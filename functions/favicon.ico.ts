import type { Env } from '../server/core';
import { objectKey } from '../server/storage';

// Serve the saved brand icon before the SPA loads; favicon responses must revalidate.
export const onRequest: PagesFunction<Env> = async context => {
  if(!['GET','HEAD'].includes(context.request.method))return new Response(null,{status:405});
  try {
    const row=await context.env.DB.prepare("SELECT setting_value FROM site_settings WHERE setting_key='site_favicon_url'").first<{setting_value:string}>();
    if(row?.setting_value){
      const url=new URL(row.setting_value,new URL(context.request.url).origin);
      if(url.pathname.startsWith('/api/media/')){
        const key=objectKey(url.pathname.slice('/api/media/'.length).split('/').map(decodeURIComponent));
        const image=await context.env.BUCKET.get(key);
        if(image){
          const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});image.writeHttpMetadata(headers);
          if(context.request.method==='HEAD'){await image.body.cancel();return new Response(null,{headers});}
          return new Response(image.body,{headers});
        }
      }else if(url.protocol==='https:')return new Response(null,{status:302,headers:{Location:url.href,'Cache-Control':'no-store'}});
    }
  } catch { /* Preserve the static fallback if storage is temporarily unavailable. */ }
  const response=await context.next();const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,headers});
};
