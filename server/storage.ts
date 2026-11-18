import { Env, assert, HttpError, json, readBytes, securityHeaders } from './core';
import { Identity, admin } from './auth';
export function objectKey(parts:string[]) {
  assert(parts.length>=2&&['products','blog-images'].includes(parts[0]));
  assert(parts.every(p=>p.length>0&&p.length<=200&&!['.','..'].includes(p)&&!/[\x00-\x1f\x7f\\/]/.test(p)));
  const key=parts.join('/');assert(key.length<=1000);return key;
}
export function mediaType(bytes:Uint8Array) {
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
  if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
  const s=(start:number,end:number)=>new TextDecoder().decode(bytes.slice(start,end));
  if(['GIF87a','GIF89a'].includes(s(0,6)))return 'image/gif';
  if(s(0,4)==='RIFF'&&s(8,12)==='WEBP')return 'image/webp';
  if(s(4,8)==='ftyp'&&['avif','avis'].includes(s(8,12)))return 'image/avif';
  if(s(4,8)==='ftyp'&&['isom','mp41','mp42','M4V '].includes(s(8,12)))return 'video/mp4';
  if([26,69,223,163].every((v,i)=>bytes[i]===v))return 'video/webm';
  throw new HttpError(415,'Upload a JPEG, PNG, GIF, WebP, AVIF, MP4 or WebM file');
}
export async function storage(request:Request,env:Env,parts:string[],user:Identity|null) {
  let key=objectKey(parts);
  if(request.method==='GET'||request.method==='HEAD') {
    const width=new URL(request.url).searchParams.get('width');
    if(width&&['384','960','1600'].includes(width)&&/\.(png|jpe?g|webp|avif)$/i.test(key)){
      const variant=key+'.responsive-'+width+'.webp';
      if(await env.BUCKET.head(variant))key=variant;
    }
    const obj=request.method==='HEAD'?await env.BUCKET.head(key):await env.BUCKET.get(key,{range:request.headers});
    if(!obj)return new Response(null,{status:404,headers:securityHeaders});
    const objectBody=request.method==='GET'?obj as R2ObjectBody:null;
    const headers=new Headers(securityHeaders);obj.writeHttpMetadata(headers);headers.set('ETag',obj.httpEtag);headers.set('X-Content-Type-Options','nosniff');headers.set('Content-Security-Policy',"default-src 'none'; sandbox");headers.set('Cache-Control','public,max-age=86400');headers.set('Accept-Ranges','bytes');
    if(request.headers.get('if-none-match')?.split(',').some(value=>value.trim()==='*'||value.trim().replace(/^W\//,'')===obj.httpEtag)){
      if(objectBody)await objectBody.body.cancel();
      return new Response(null,{status:304,headers});
    }
    if(objectBody?.range&&'offset' in objectBody.range&&objectBody.range.offset!==undefined&&objectBody.range.length!==undefined){headers.set('Content-Range',`bytes ${objectBody.range.offset}-${objectBody.range.offset+objectBody.range.length-1}/${obj.size}`);headers.set('Content-Length',String(objectBody.range.length));}
    else headers.set('Content-Length',String(obj.size));
    return new Response(objectBody?.body||null,{status:objectBody?.range?206:200,headers});
  }
  assert(admin(user),'Administrator access required',403);
  if(request.method==='DELETE'){await env.BUCKET.delete([key,...[384,960,1600].map(width=>key+'.responsive-'+width+'.webp')]);return json({data:{path:key},error:null});}
  assert(request.method==='PUT','Method not allowed',405);
  assert(request.body,'File required');
  const bytes=await readBytes(request,20*1024*1024);
  const total=bytes.byteLength;assert(total>0,'File is empty');
  const type=mediaType(bytes);assert(type.startsWith('video/')||total<=10*1024*1024,'Images must be 10 MB or smaller',413);
  // Atomic conditional write prevents replacing an existing URL accidentally.
  const result=await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type},onlyIf:{etagDoesNotMatch:'*'}});
  assert(result,'A file already exists at this path',409);
  return json({data:{path:parts.slice(1).join('/')},error:null});
}
