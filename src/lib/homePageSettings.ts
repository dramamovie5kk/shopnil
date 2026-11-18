export const homePageDefaults = {
  home_products_enabled:'true',home_products_title:'আমাদের প্রোডাক্ট',home_products_subtitle:'',home_products_button_text:'বিস্তারিত দেখুন',home_shop_button_text:'সব প্রোডাক্ট দেখুন',
  home_products_limit:'12',home_products_columns_mobile:'2',home_products_columns_desktop:'4',home_products_title_color:'',home_products_bg_color:'',home_products_button_bg_color:'',home_products_button_text_color:'',
  category_section_enabled:'true',category_section_title:'টপ ক্যাটাগরি',category_section_title_color:'',category_section_button_text:'সব দেখুন',category_section_button_text_color:'',category_section_button_bg_color:'',
  category_section_bg_color:'',category_card_bg_color:'',category_card_border_color:'',category_text_color:'',category_section_border:'true',
};
export const homeSectionEnabled = (value: string) => value !== 'false' && value !== '0';
export const homeNumber = (value: string,min:number,max:number,fallback:number) => {
  if(!value.trim())return fallback;
  const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.round(number))):fallback;
};
export const homeColor = (value: string) => /^#[\da-f]{6}$/i.test(value)?value:undefined;
