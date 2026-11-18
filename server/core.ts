export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
}
export type Row = Record<string, unknown>;
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function assert(condition: unknown, message = 'Invalid request', status = 400): asserts condition {
  if (!condition) throw new HttpError(status, message);
}
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
export async function readBytes(request: Request, maximum: number): Promise<Uint8Array> {
  const length = request.headers.get('content-length');
  if (length !== null) assert(/^\d+$/.test(length) && Number(length) <= maximum, 'Request too large', 413);
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new HttpError(413, 'Request too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...securityHeaders, ...headers } });
}
export async function body(request: Request, maximum = 1024 * 1024): Promise<Row> {
  assert(request.headers.get('content-type')?.split(';',1)[0].trim().toLowerCase()==='application/json', 'JSON required', 415);
  const bytes = await readBytes(request, maximum);
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new HttpError(400, 'Invalid UTF-8'); }
  let result: unknown;
  try { result = JSON.parse(text); } catch { throw new HttpError(400, 'Invalid JSON'); }
  assert(result && typeof result === 'object' && !Array.isArray(result));
  return result as Row;
}
export function csrf(request: Request) {
  const origin = request.headers.get('origin');
  assert(origin === new URL(request.url).origin, 'Origin not allowed', 403);
  assert(request.headers.get('sec-fetch-site') !== 'cross-site', 'Origin not allowed', 403);
}
export const ipAddress = (request: Request) => request.headers.get('cf-connecting-ip') || 'local';
export const now = () => Math.floor(Date.now() / 1000);
export const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
export const decode = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
export const randomToken = () => encode(crypto.getRandomValues(new Uint8Array(32)));
export async function sha256(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(x => x.toString(16).padStart(2, '0')).join('');
}
export async function rateLimit(env: Env, key: string, maximum: number, seconds = 3600) {
  // Expired entries are bounded by a rolling cleanup on each write.
  const stamp = now();
  await env.DB.prepare('DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires_at < ? LIMIT 100)').bind(stamp - 3600).run();
  const result = await env.DB.prepare(`INSERT INTO request_limits(key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`).bind(await sha256(key), stamp + seconds, stamp, stamp).first<{ attempts: number }>();
  assert(result && result.attempts <= maximum, 'Too many requests. Please try again later.', 429);
}
export async function settings(env: Env): Promise<Record<string, string>> {
  const r = await env.DB.prepare('SELECT setting_key,setting_value FROM site_settings').all<{ setting_key: string; setting_value: string | null }>();
  return Object.fromEntries(r.results.map(x => [x.setting_key, x.setting_value || '']));
}
