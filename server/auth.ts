import { Env, Row, HttpError, assert, decode, encode, json, now, randomToken, rateLimit, sha256, ipAddress } from './core';
const COOKIE = '__Host-shop_session';
const LIFETIME = 86400;
export interface Identity { id: string; email: string; full_name: string; sid: string; authenticated_at: number; roles: string[] }
interface Claims { sub: string; jti: string; exp: number; iat: number; iss: string; aud: string }
async function key(secret: string) {
  assert(typeof secret === 'string' && secret.length >= 43, 'Authentication signing secret is not configured', 503);
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function signJWT(claims: Claims, secret: string) {
  const payload = encode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))) + '.' + encode(new TextEncoder().encode(JSON.stringify(claims)));
  return payload + '.' + encode(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(payload))));
}
export async function verifyJWT(token: string, secret: string): Promise<Claims | null> {
  const signingKey = await key(secret);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    if (!await crypto.subtle.verify('HMAC', signingKey, decode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))) return null;
    const c = JSON.parse(new TextDecoder().decode(decode(parts[1]))) as Claims;
    if (typeof c.sub !== 'string' || typeof c.jti !== 'string' || !Number.isFinite(c.exp) || !Number.isFinite(c.iat) || c.exp <= now() || c.iat > now() + 30 || c.exp - c.iat > LIFETIME || c.iss !== 'baridhara' || c.aud !== 'shop') return null;
    return c;
  } catch { return null; }
}
export function cookie(request: Request, name: string) {
  return request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.slice(name.length + 1) || '';
}
const sessionCookie = (token: string, age = LIFETIME) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
export async function identify(request: Request, env: Env): Promise<Identity | null> {
  const token = cookie(request, COOKIE);
  if (!token) return null;
  const claims = await verifyJWT(token, env.JWT_SECRET);
  if (!claims) return null;
  const user = await env.DB.prepare('SELECT u.id,u.email,u.full_name,s.id AS sid,s.authenticated_at FROM auth_users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.id=? AND u.id=? AND s.expires_at>?').bind(claims.jti, claims.sub, now()).first<Omit<Identity, 'roles'>>();
  if (!user) return null;
  const roles = await env.DB.prepare('SELECT role FROM user_roles WHERE user_id=?').bind(user.id).all<{ role: string }>();
  return { ...user, roles: roles.results.map(x => x.role) };
}
export const staff = (user: Identity | null) => !!user?.roles.some(r => r === 'admin' || r === 'moderator');
export const admin = (user: Identity | null) => !!user?.roles.includes('admin');
export const publicUser = (u: {id: string; email: string; full_name: string}) => ({ id: u.id, email: u.email, user_metadata: { full_name: u.full_name } });
export async function passwordHash(password: string, salt = randomToken()) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: decode(salt) }, material, 256);
  return `pbkdf2-sha256$100000$${salt}$${encode(new Uint8Array(hash))}`;
}
async function checkPassword(password: string, stored: string) {
  const [algorithm, iterations, salt, digest] = stored.split('$');
  if (algorithm !== 'pbkdf2-sha256' || iterations !== '100000' || !salt || !digest) return false;
  const computed = (await passwordHash(password, salt)).split('$')[3];
  // Verify equal length bytes in WebCrypto rather than JS string comparison.
  const comparisonKey = await crypto.subtle.importKey('raw', decode(digest), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const marker = new TextEncoder().encode('password-comparison');
  const signature = await crypto.subtle.sign('HMAC', comparisonKey, marker);
  const actualKey = await crypto.subtle.importKey('raw', decode(computed), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', actualKey, signature, marker);
}
function validPassword(value: unknown): asserts value is string { assert(typeof value === 'string' && value.length >= 10 && value.length <= 256, 'Password must contain 10–256 characters'); }
async function session(env: Env, user: {id: string; email: string; full_name: string}, extra: Record<string,unknown> = {}) {
  await env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(now()).run();
  const sid = randomToken();
  await env.DB.prepare('INSERT INTO auth_sessions(id,user_id,expires_at,authenticated_at) VALUES (?,?,?,?)').bind(sid, user.id, now() + LIFETIME, now()).run();
  const token = await signJWT({ sub: user.id, jti: sid, iat: now(), exp: now() + LIFETIME, iss: 'baridhara', aud: 'shop' }, env.JWT_SECRET);
  return json({ data: { user: publicUser(user), session: { user: publicUser(user), expires_at: now() + LIFETIME }, ...extra }, error: null }, 200, { 'Set-Cookie': sessionCookie(token) });
}
export async function auth(request: Request, env: Env, action: string, input: Row, user: Identity | null) {
  if (action === 'session') return json({ data: { session: user ? { user: publicUser(user) } : null, user: user ? publicUser(user) : null }, error: null });
  if (action === 'logout') {
    if (user) await env.DB.prepare('DELETE FROM auth_sessions WHERE id=?').bind(user.sid).run();
    const response=json({data:{},error:null},200,{'Set-Cookie':sessionCookie('',0)});
    response.headers.append('Set-Cookie','__Host-shop_guest=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return response;
  }
  if (action === 'signup' || action === 'login') {
    await key(env.JWT_SECRET);
    const email = String(input.email || '').trim().toLowerCase();
    assert(email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Valid email required');
    assert(typeof input.password === 'string' && input.password.length <= 256, 'Password required');
    await rateLimit(env, `auth-ip:${ipAddress(request)}`, 60);
    await rateLimit(env, `auth-email:${email}`, 15, 900);
    if (action === 'signup') {
      validPassword(input.password);
      const id = crypto.randomUUID(), fullName = String(input.full_name || '').trim().slice(0, 100);
      const exists = await env.DB.prepare('SELECT id FROM auth_users WHERE email=?').bind(email).first();
      assert(!exists, 'Unable to create account with those details', 409);
      const recoveryCode = randomToken();
      await env.DB.batch([
        env.DB.prepare('INSERT INTO auth_users(id,email,password_hash,full_name,recovery_digest) VALUES (?,?,?,?,?)').bind(id,email,await passwordHash(input.password),fullName,await sha256(recoveryCode)),
        env.DB.prepare('INSERT INTO profiles(user_id,full_name) VALUES (?,?)').bind(id,fullName),
        env.DB.prepare("INSERT INTO user_roles(user_id,role) VALUES (?,'user')").bind(id),
      ]);
      return session(env, { id, email, full_name: fullName }, {recovery_code:recoveryCode});
    }
    const row = await env.DB.prepare('SELECT id,email,full_name,password_hash FROM auth_users WHERE email=?').bind(email).first<{id:string;email:string;full_name:string;password_hash:string}>();
    const dummy = 'pbkdf2-sha256$100000$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const valid = await checkPassword(input.password, row?.password_hash || dummy);
    assert(row && valid, 'Invalid email or password', 401);
    return session(env, row);
  }
  if (action === 'recover') {
    validPassword(input.password);
    await rateLimit(env, 'recover:'+ipAddress(request), 10, 900);
    const email=String(input.email||'').trim().toLowerCase(), digest=await sha256(String(input.recovery_code||''));
    const userRow=await env.DB.prepare('SELECT id FROM auth_users WHERE email=? AND recovery_digest=?').bind(email,digest).first<{id:string}>();
    assert(userRow,'Email or recovery code is invalid',401);
    const code=randomToken(), nextDigest=await sha256(code);
    const result=await env.DB.batch([
      env.DB.prepare('UPDATE auth_users SET password_hash=?,recovery_digest=? WHERE id=? AND recovery_digest=?').bind(await passwordHash(input.password),nextDigest,userRow.id,digest),
      env.DB.prepare('DELETE FROM auth_sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM auth_users WHERE id=? AND recovery_digest=?)').bind(userRow.id,userRow.id,nextDigest),
    ]);
    assert(result[0].meta.changes===1,'Recovery code has already been used',401);
    return json({data:{recovery_code:code},error:null},200,{'Set-Cookie':sessionCookie('',0)});
  }
  if (action === 'update') {
    assert(user,'Login required',401);
    assert(now()-user.authenticated_at < 300,'Please sign in again before changing account credentials',401);
    if (input.email !== undefined) {
      const email=String(input.email).trim().toLowerCase();
      assert(email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Valid email required');
      await env.DB.batch([
        env.DB.prepare('UPDATE auth_users SET email=? WHERE id=?').bind(email,user.id),
        env.DB.prepare('DELETE FROM auth_sessions WHERE user_id=? AND id<>?').bind(user.id,user.sid),
      ]);
      return json({data:{user:publicUser({...user,email})},error:null});
    }
    validPassword(input.password);
    await env.DB.batch([
      env.DB.prepare('UPDATE auth_users SET password_hash=? WHERE id=?').bind(await passwordHash(input.password),user.id),
      env.DB.prepare('DELETE FROM auth_sessions WHERE user_id=? AND id<>?').bind(user.id,user.sid),
    ]);
    return json({ data:{user:publicUser(user)},error:null });
  }
  throw new HttpError(404,'Unknown authentication action');
}
