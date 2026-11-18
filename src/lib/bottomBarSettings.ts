import { getWhatsAppUrl } from './utils';
export const bottomBarDefaults = {
  bottom_nav_enabled:'true',bottom_nav_home_label:'হোম',bottom_nav_shop_label:'শপ',bottom_nav_offers_label:'অফার',bottom_nav_whatsapp_label:'হোয়াটসঅ্যাপ',bottom_nav_account_label:'অ্যাকাউন্ট',
  bottom_nav_whatsapp_number:'',bottom_nav_whatsapp_message:'',bottom_nav_background:'#ffffff',bottom_nav_color:'#6b8580',bottom_nav_active_color:'#16b653',bottom_nav_offers_color:'#ff781c',
};
export function bottomLink(value:string,fallback:string){
 const link=value.trim();if(/[\x00-\x20\\]/.test(link))return fallback;
 if(/^\/(?!\/)/.test(link))return link;
 try{const url=new URL(link);if(url.protocol==='https:')return url.href;}catch{}
 return fallback;
}
export function bottomWhatsapp(number:string,legacy:string,message:string){
 const input=number.trim()||legacy.trim();
 if(input.includes('X'))return undefined;
 if(/^https:\/\/(wa.me|api.whatsapp.com)\//i.test(input))return getWhatsAppUrl(input,message);
 if(!/^\+?[\d\s()-]+$/.test(input))return undefined;
 const digits=input.replace(/[^\d]/g,'');if(digits.length<10||digits.length>15)return undefined;
 return getWhatsAppUrl(input,message);
}
