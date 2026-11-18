export const template02Sections = ['hero', 'gallery', 'features', 'reviews', 'contact'] as const;
export type Template02Section = typeof template02Sections[number];
export const template02Designs = {
  hero: ['এডিটোরিয়াল পোস্টার', 'স্পটলাইট স্টেজ', 'ডাবল ফটো স্টোরি', 'ক্যাটালগ কভার', 'মডার্ন লুকবুক'],
  gallery: ['ম্যাসনারি সংগ্রহ', 'সাইড থাম্ব স্টুডিও', 'অনুভূমিক শোকেস', 'নম্বরযুক্ত ক্যাটালগ', 'বড়-ছোট কোলাজ'],
  features: ['নম্বরযুক্ত তালিকা', 'আইকন মোজাইক', 'ফিচার টাইমলাইন', 'ছবির পাশে সুবিধা', 'কম্প্যাক্ট তুলিকা'],
  reviews: ['ফিডব্যাক ওয়াল', 'ফোকাস স্লাইডার', 'পোলারয়েড স্মৃতি', 'ভিডিও স্পটলাইট', 'ফিডব্যাক স্ট্রিপ'],
  contact: ['সরাসরি সংযোগ', 'দুই চ্যানেল', 'সহায়তা ডেস্ক', 'মিনিমাল যোগাযোগ', 'সেন্টার কনসিয়ার্জ'],
} satisfies Record<Template02Section, string[]>;
export function isTemplate02Design(value: string | undefined): boolean {
  return /^t2-0[1-5]$/.test(value ?? '');
}
export function template02DesignOptions(section: Template02Section) {
  return template02Designs[section].map((label, i) => ({ id: `t2-0${i + 1}`, label }));
}
export function template02DialNumber(number: string, code = '') {
  const digits = number.replace(/\D/g, '');
  const country = code.replace(/\D/g, '');
  if (!digits) return '';
  return country && !number.startsWith('+') ? `+${digits.startsWith(country) ? digits : country + digits.replace(/^0/, '')}` : number.replace(/[^\d+]/g, '');
}