// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/api/[[path]]';
import { storage } from '../../server/storage';
import type { Env } from '../../server/core';
function object() {
  return {httpEtag:'"asset-etag"',size:3,range:undefined,body:new ReadableStream({start(c){c.enqueue(Uint8Array.of(1,2,3));c.close();}}),writeHttpMetadata:(h:Headers)=>h.set('Content-Type','image/png')};
}
beforeEach(()=>vi.stubGlobal('caches',{default:{match:vi.fn().mockResolvedValue(undefined),put:vi.fn().mockResolvedValue(undefined)}}));
afterEach(()=>vi.unstubAllGlobals());
describe('public media performance and caching',()=>{
  it('serves images without authenticating unrelated session cookies or reading D1',async()=>{
    const prepare=vi.fn(()=>{throw new Error('Unexpected D1 query');});
    const env={DB:{prepare},BUCKET:{get:vi.fn().mockResolvedValue(object())}} as unknown as Env;
    const request=new Request('https://example.test/api/media/products/image.png',{headers:{Cookie:'__Host-shop_session=invalid'}});
    const response=await onRequest({request,env,waitUntil:vi.fn()} as unknown as Parameters<typeof onRequest>[0]);
    expect(response.status).toBe(200);expect(prepare).not.toHaveBeenCalled();
    expect(response.headers.has('Set-Cookie')).toBe(false);
    expect(response.headers.get('Cache-Control')).toBe('public,max-age=86400');
  });
  it('returns 304 for matching ETags without a response body',async()=>{
    const env={BUCKET:{get:vi.fn().mockResolvedValue(object())}} as unknown as Env;
    const response=await storage(new Request('https://example.test/api/media/products/image.png',{headers:{'If-None-Match':'W/"asset-etag"'}}),env,['products','image.png'],null);
    expect(response.status).toBe(304);expect(await response.text()).toBe('');
  });
  it('uses metadata-only HEAD requests instead of reading object bodies',async()=>{
    const get=vi.fn(),head=vi.fn().mockResolvedValue(object());
    const env={BUCKET:{get,head}} as unknown as Env;
    const response=await storage(new Request('https://example.test/api/media/products/image.png',{method:'HEAD'}),env,['products','image.png'],null);
    expect(response.status).toBe(200);expect(await response.text()).toBe('');
    expect(head).toHaveBeenCalledOnce();expect(get).not.toHaveBeenCalled();
  });
});

describe('responsive media variants',()=>{
  it('serves a prepared WebP variant for an allowed width',async()=>{
    const get=vi.fn().mockResolvedValue(object()),head=vi.fn().mockResolvedValue({size:3});
    const env={BUCKET:{get,head}} as unknown as Env;
    const response=await storage(new Request('https://example.test/api/media/products/image.png?width=384'),env,['products','image.png'],null);
    expect(response.status).toBe(200);expect(get.mock.calls[0][0]).toBe('products/image.png.responsive-384.webp');
  });
  it('falls back to the original when a variant is missing',async()=>{
    const get=vi.fn().mockResolvedValue(object()),head=vi.fn().mockResolvedValue(null);
    await storage(new Request('https://example.test/api/media/products/image.png?width=960'),{BUCKET:{get,head}} as unknown as Env,['products','image.png'],null);
    expect(get.mock.calls[0][0]).toBe('products/image.png');
  });
  it('serves a public cache hit without reading R2 or D1',async()=>{
    const get=vi.fn();const cached=new Response('cached image');
    vi.stubGlobal('caches',{default:{match:vi.fn().mockResolvedValue(cached)}});
    const response=await onRequest({request:new Request('https://example.test/api/media/products/image.png'),env:{BUCKET:{get}} as unknown as Env,waitUntil:vi.fn()} as unknown as Parameters<typeof onRequest>[0]);
    expect(await response.text()).toBe('cached image');expect(get).not.toHaveBeenCalled();
  });
});
