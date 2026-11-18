/** Hero 08 copy is independent; prices, media and contact numbers use existing page data. */
export const hero08TextFields = [
  { key: 'text_hero08_topbar', label: 'উপরের ঘোষণা', fallback: 'টপ ও সীমিত স্টক আবার — ক্যাশ অন ডেলিভারি সারা বাংলাদেশে' },
  { key: 'text_hero08_image_label', label: 'ছবির উপরের ট্যাগ', fallback: 'সোলার ফ্যান সহ' },
  { key: 'text_hero08_badge', label: 'ছবির নিচের ব্যাজ', fallback: 'নতুন আশা — সোলার প্রযুক্তির ক্যাপ' },
  { key: 'text_hero08_stock', label: 'স্টকের লেখা', fallback: 'স্টক সীমিত' },
  { key: 'text_hero08_price_note', label: 'দামের নিচের লেখা', fallback: 'ডেলিভারি চার্জ আলাদা' },
  { key: 'text_hero08_button', label: 'অর্ডার বোতামের লেখা', fallback: 'এখনই অর্ডার করুন' },
  { key: 'text_hero08_whatsapp', label: 'হোয়াটসঅ্যাপ বোতামের লেখা', fallback: 'হোয়াটসঅ্যাপে অর্ডার করুন' },
  { key: 'text_hero08_delivery', label: 'সবচেয়ে নিচের ডেলিভারি লেখা', fallback: 'ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন' },
] as const;

export const hero08ColorFields = [
  { key: 'hero08TopbarBg', label: 'ঘোষণার পটভূমি', cssVar: '--hero08-topbar-bg' },
  { key: 'hero08TopbarText', label: 'ঘোষণার লেখা', cssVar: '--hero08-topbar-text' },
  { key: 'hero08CardBg', label: 'ছবি ও অর্ডার কার্ড', cssVar: '--hero08-card-bg' },
  { key: 'hero08TagBg', label: 'ছবির ট্যাগ ও স্টকের পটভূমি', cssVar: '--hero08-tag-bg' },
  { key: 'hero08TagText', label: 'ছবির ট্যাগ ও স্টকের লেখা', cssVar: '--hero08-tag-text' },
] as const;