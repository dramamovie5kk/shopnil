export const productPageDefaults = {
  product_page_header_enabled:'true',product_page_footer_enabled:'true',product_page_gallery_enabled:'true',product_page_short_enabled:'true',product_page_wishlist_enabled:'true',
  product_page_bg:'',product_page_card_bg:'',product_page_heading_color:'',product_page_text_color:'',product_page_price_color:'',product_page_border_color:'',product_page_short_bg:'',product_page_short_color:'',product_page_accent:'',
  product_page_title_mobile:'21',product_page_title_desktop:'28',product_page_copy_mobile:'14',product_page_copy_desktop:'16',product_page_button_radius:'10',
  product_addtocart_enabled:'true',product_order_enabled:'true',product_whatsapp_enabled:'true',product_call_enabled:'true',product_addtocart_link:'',product_order_link:'',product_whatsapp_link:'',product_call_link:'',product_call_label:'ফোনে অর্ডার করুন',product_whatsapp_message:'',
  product_social_enabled:'true',product_social_title:'আমাদের সঙ্গে যুক্ত থাকুন',product_social_subtitle:'নতুন পণ্য ও আপডেট পেতে আমাদের সঙ্গে থাকুন',
  product_social_facebook:'',product_social_instagram:'',product_social_youtube:'',product_social_tiktok:'',product_social_facebook_enabled:'true',product_social_instagram_enabled:'true',product_social_youtube_enabled:'true',product_social_tiktok_enabled:'true',
  product_description_enabled:'true',product_description_title:'বিস্তারিত বিবরণ',product_description_open:'true',product_policy_enabled:'true',product_policy_title:'রিটার্ন ও এক্সচেঞ্জ পলিসি',product_policy_content:'',product_reviews_enabled:'true',product_reviews_title:'কাস্টমার রিভিউ',
  product_details_bg:'',product_details_heading_color:'',product_details_text_color:'',product_social_bg:'',product_social_color:'',product_related_enabled:'true',product_related_title:'আপনার পছন্দ হতে পারে',product_related_mode:'auto',product_related_ids:'',product_related_count:'4',product_related_bg:'',
};
export const productEnabled=(value:string)=>value!=='false'&&value!=='0';
export const productColor=(value:string)=>/^#[\da-f]{6}$/i.test(value)?value:undefined;
export const productNumber=(value:string,min:number,max:number,fallback:number)=>value.trim()&&Number.isFinite(Number(value))?Math.max(min,Math.min(max,Math.round(Number(value)))):fallback;
export const selectedRelatedIds=(value:string)=>[...new Set(value.split(',').map(id=>id.trim()).filter(Boolean))].slice(0,24);
export function safeProductLink(value:string,allowTel=false):string|undefined {
  const link=value.trim();if(!link||/[\x00-\x20\\]/.test(link))return;
  if(link.startsWith('/')&&!link.startsWith('//'))return link;
  if(allowTel&&/^tel:\+?[\d-]{5,20}$/.test(link))return link;
  try{const url=new URL(link);if(url.protocol==='https:')return url.href;}catch{ /* Keep the normal action for an invalid URL. */ }
}
