// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { signJWT, verifyJWT, passwordHash } from '../../server/auth';
import { encode, now } from '../../server/core';
import { column, hydrate, parseSelect, prepareValues, privateSetting, runQuery, selectionSQL } from '../../server/database';
import { mediaType, objectKey } from '../../server/storage';
import type { Env } from '../../server/core';
const secret='a-test-only-signing-secret-with-at-least-64-characters-0123456789abcd';
const claims=()=>({sub:'user',jti:'session',iat:now(),exp:now()+600,iss:'baridhara',aud:'shop'});

describe('custom JWT and password security',()=>{
  it('verifies only correctly signed, unexpired, scoped tokens',async()=>{
    const token=await signJWT(claims(),secret);
    expect((await verifyJWT(token,secret))?.sub).toBe('user');
    expect(await verifyJWT(token,secret+'wrong')).toBeNull();
    const expired=await signJWT({...claims(),iat:now()-100,exp:now()-1},secret);
    expect(await verifyJWT(expired,secret)).toBeNull();
    expect(await verifyJWT(await signJWT({...claims(),aud:'other'},secret),secret)).toBeNull();
    expect(await verifyJWT(await signJWT({...claims(),iss:'other'},secret),secret)).toBeNull();
    expect(await verifyJWT(await signJWT({...claims(),iat:now()+3600},secret),secret)).toBeNull();
  });
  it('rejects altered headers, payloads, signatures and malformed inputs',async()=>{
    const token=await signJWT(claims(),secret),parts=token.split('.');
    expect(await verifyJWT(['eyJhbGciOiJub25lIn0',parts[1],parts[2]].join('.'),secret)).toBeNull();
    const payload=encode(new TextEncoder().encode(JSON.stringify({...claims(),sub:'admin'})));
    expect(await verifyJWT([parts[0],payload,parts[2]].join('.'),secret)).toBeNull();
    parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);
    expect(await verifyJWT(parts.join('.'),secret)).toBeNull();
    expect(await verifyJWT('not-a-jwt',secret)).toBeNull();
  });
  it('uses independently salted password hashes and fails closed without a secret',async()=>{
    const a=await passwordHash('test-password-long'),b=await passwordHash('test-password-long');
    expect(a).not.toBe(b);expect(a).toMatch(/^pbkdf2-sha256\$100000\$/);
    await expect(signJWT(claims(),'')).rejects.toThrow('not configured');
  });
});
describe('D1 query and R2 input boundaries',()=>{
  it('accepts only declared SQL identifiers',()=>{
    expect(()=>column('auth_users','password_hash')).toThrow('Unknown table');
    expect(()=>column('products','id; DROP TABLE products')).toThrow('Unknown column');
    expect(()=>column('products','constructor')).toThrow('Unknown column');
    expect(()=>prepareValues('products',{unexpected:1},true)).toThrow();
    expect(()=>parseSelect('*,products(name')).toThrow();
    expect(parseSelect('*, products(name, slug)')).toEqual(['*','products(name, slug)']);
  });
  it('round-trips compressed settings, JSON and false booleans',()=>{
    const values=prepareValues('sales_pages',{title:'Test',show_hero_section:false,template_styles:{hero:{design:'01'}}},true);
    const row=hydrate('sales_pages',values);
    expect(row.show_hero_section).toBe(false);
    expect(row.template_styles).toEqual({hero:{design:'01'}});
    expect(row).not.toHaveProperty('content');
    expect(hydrate('products',{is_new:0,images:'["a.png"]'})).toMatchObject({is_new:false,images:['a.png']});
  });
  it('identifies credentials as private settings',()=>{
    for(const key of ['fb_pixel_access_token','pathao_password','steadfast_secret_key','bdcourier_api_key'])expect(privateSetting(key)).toBe(true);
    expect(privateSetting('site_name')).toBe(false);
  });
  it('rejects unsupported namespaces, traversal, HTML and scriptable SVG',()=>{
    expect(()=>objectKey(['products','..','x'])).toThrow();
    expect(()=>objectKey(['products','folder/../private'])).toThrow();
    expect(()=>objectKey(['private','x'])).toThrow();
    expect(()=>mediaType(new TextEncoder().encode('<svg onload="alert(1)"/>'))).toThrow();
    expect(()=>mediaType(new TextEncoder().encode('<html>bad</html>'))).toThrow();
    expect(mediaType(Uint8Array.of(137,80,78,71,13,10,26,10))).toBe('image/png');
  });
});

describe('catalog relationship query budgets',()=>{
  it('loads a hundred product relationships in a batch without exposing implicit IDs',async()=>{
    const rows=Array.from({length:100},(_,i)=>({id:String(i),name:'Product '+i,category_id:'category'}));
    const prepare=vi.fn((sql:string)=>({bind:()=>({all:async()=>({results:sql.includes('FROM "products"')?rows:[{id:'category',name:'Category'}]})})}));
    const env={DB:{prepare}} as unknown as Env;
    const result=await runQuery(env,{table:'products',action:'select',select:'name, categories(name)'},null,new Request('https://example.test/api/database'));
    expect(prepare).toHaveBeenCalledTimes(2);
    const data=result.data as {name:string;categories:{name:string}}[];
    expect(data).toHaveLength(100);
    expect(data[0]).toEqual({name:'Product 0',categories:{name:'Category'}});
  });
});

describe('bounded JSON and private field queries',()=>{
  it('does not read a declared oversized request',async()=>{
    const {readBytes}=await import('../../server/core');
    const getReader=vi.fn();
    const request={headers:new Headers({'content-length':'1001'}),body:{getReader}} as unknown as Request;
    await expect(readBytes(request,1000)).rejects.toMatchObject({status:413});
    expect(getReader).not.toHaveBeenCalled();
  });
  it('cancels chunked requests when their actual byte size exceeds the limit',async()=>{
    const {readBytes}=await import('../../server/core');
    const cancel=vi.fn();
    const stream=new ReadableStream<Uint8Array>({start(c){c.enqueue(new Uint8Array(6));c.enqueue(new Uint8Array(6));},cancel});
    const request={headers:new Headers(),body:stream} as unknown as Request;
    await expect(readBytes(request,10)).rejects.toMatchObject({status:413});
    expect(cancel).toHaveBeenCalledOnce();
  });
  it('rejects private price inference through filters and sorting before querying D1',async()=>{
    const prepare=vi.fn(),env={DB:{prepare}} as unknown as Env;
    const request=new Request('https://example.test/api/database');
    for(const query of [
      {table:'products',action:'select',filters:[{column:'cost_price',op:'gte',value:1}],head:true,count:'exact'},
      {table:'products',action:'select',orders:[{column:'cost_price',ascending:true}]},
    ])await expect(runQuery(env,query,null,request)).rejects.toMatchObject({status:403});
    expect(prepare).not.toHaveBeenCalled();
  });
  it('projects only requested sales fields rather than the entire design document',()=>{
    const sql=selectionSQL('sales_pages','id,hero_images,products(name)');
    expect(sql).toContain('json_extract(content');
    expect(sql).toContain('"product_id"');
    expect(sql).not.toContain('SELECT *');
    const hydrated=hydrate('sales_pages',{id:'page',hero_images:'["a.png"]'});
    expect(hydrated.hero_images).toEqual(['a.png']);
  });
});
