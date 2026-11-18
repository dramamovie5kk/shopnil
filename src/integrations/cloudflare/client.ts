import { QueryBuilder, Result } from '../../../shared/query';
import type { AuthEvent, Session, User } from './authTypes';
async function call(path:string,body?:unknown,method=body===undefined?'GET':'POST'):Promise<Result> {
  try {
    const response=await fetch('/api/'+path,{method,credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    const result=await response.json() as Record<string,any>;
    if(!response.ok||result.error){const message=typeof result.error==='string'?result.error:result.error?.message;return {data:null,error:Object.assign(new Error(message||'Request failed'),{code:result.error?.code,status:response.status})};}
    return result.data!==undefined?{data:result.data,error:null,count:result.count}:{data:result,error:null};
  } catch {return {data:null,error:new Error('Cannot reach the application API. Run the Pages Functions server or try again later.')};}
}
const listeners=new Set<(event:AuthEvent,session:Session|null)=>void>();
const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('shop-auth'):null;
async function emit(event:AuthEvent,broadcast=true){const r=await call('auth/session');const session=r.data?.session||null;listeners.forEach(fn=>fn(event,session));if(broadcast)channel?.postMessage(event);}
channel?.addEventListener('message',e=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(e.data))void emit(e.data,false);});
const auth={
  async getSession(){const r=await call('auth/session');return {data:{session:(r.data?.session||null) as Session|null},error:r.error};},
  async getUser(){const r=await call('auth/session');return {data:{user:(r.data?.user||null) as User|null},error:r.error};},
  onAuthStateChange(callback:(event:AuthEvent,session:Session|null)=>void){listeners.add(callback);return {data:{subscription:{unsubscribe(){listeners.delete(callback);}}}};},
  async signUp(input:{email:string;password:string;options?:{data?:{full_name?:string};emailRedirectTo?:string}}){const r=await call('auth/signup',{email:input.email,password:input.password,full_name:input.options?.data?.full_name});if(!r.error)await emit('SIGNED_IN');return r;},
  async signInWithPassword(input:{email:string;password:string}){const r=await call('auth/login',input);if(!r.error)await emit('SIGNED_IN');return r;},
  async signOut(){const r=await call('auth/logout',{});if(!r.error)await emit('SIGNED_OUT');return r;},
  async updateUser(input:{password?:string;email?:string}){const r=await call('auth/update',input);if(!r.error)await emit('USER_UPDATED');return r;},
  async recover(input:{email:string;password:string;recovery_code:string}){const r=await call('auth/recover',input);if(!r.error)await emit('SIGNED_OUT');return r;},
};
const encoded=(bucket:string,path:string)=>[bucket,...path.split('/')].map(encodeURIComponent).join('/');
export const api={
  from:(table:string)=>new QueryBuilder(table,q=>call('database',q)),
  rpc:(name:string,input:unknown={})=>call('rpc/'+encodeURIComponent(name),input),
  checkout:(input:unknown)=>call('checkout',input),
  auth,
  functions:{invoke:(name:string,options?:{body?:unknown})=>call('functions/'+encodeURIComponent(name),options?.body||{})},
  storage:{from:(bucket:string)=>({
    async upload(path:string,file:Blob,_options?:{upsert?:boolean}){try{const r=await fetch('/api/media/'+encoded(bucket,path),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});const result=await r.json() as Record<string,any>;
      if(r.ok&&file.type.startsWith('image/')&&!path.includes('.responsive-')){
        try{const {imageVariantsUpload}=await import('@/lib/imageVariantsUpload');const variants=await imageVariantsUpload(file);
          await Promise.allSettled(variants.map(({width,blob})=>fetch('/api/media/'+encoded(bucket,path+'.responsive-'+width+'.webp'),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'image/webp'},body:blob})));
        }catch{/* Unsupported browser/image: the public media handler falls back to the original. */}
      }
      return r.ok?{...result,error:null}:{data:null,error:new Error(result.error?.message||'Upload failed')};}catch{return {data:null,error:new Error('Upload failed')};}},
    getPublicUrl(path:string){return {data:{publicUrl:new URL('/api/media/'+encoded(bucket,path),window.location.origin).href}};},
    async remove(paths:string[]){for(const path of paths){try{const r=await fetch('/api/media/'+encoded(bucket,path),{method:'DELETE',credentials:'same-origin'});if(!r.ok)return {error:new Error('Delete failed')};}catch{return {error:new Error('Delete failed')};}}return {error:null};},
  })},
};
