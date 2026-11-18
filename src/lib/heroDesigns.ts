/** Shared hero designs are opt-in; older sales pages keep their template-specific hero. */
export const heroDesigns = [
  { id: '01', label: 'পূর্ণ ছবি', description: 'ছবির উপর লেখাসহ বড় প্রচ্ছদ' },
  { id: '02', label: 'সম্পাদকীয়', description: 'ছবি ও লেখা দুই পাশে' },
  { id: '03', label: 'প্রিমিয়াম দুই কলাম', description: 'লেখা বামে, বড় ছবি ডানে' },
  { id: '04', label: 'অফার ব্যানার', description: 'দাম ও ছাড়কে গুরুত্ব' },
  { id: '05', label: 'ম্যাগাজিন', description: 'একটি বড়, দুটি ছোট ছবি' },
  { id: '06', label: 'গোল্ড প্রিমিয়াম', description: 'চার ছবি, সোনালি শিরোনাম ও অফার' },
  { id: '07', label: 'ডার্ক শোকেস', description: 'গাঢ় পটভূমিতে পণ্যের ছবি' },
  { id: '08', label: 'সোলার অফার', description: 'সোনালি ঘোষণা, বড় ছবি ও সবুজ অর্ডার কার্ড' },
  { id: '09', label: 'প্রিমিয়াম কম্বো', description: 'গোলাপি প্রচ্ছদ, সোনালি ছবির ফ্রেম ও লাল বোতাম' },
  { id: '10', label: 'কোর্স অফার', description: 'প্রফেশনাল কাউন্টডাউন, অফার মূল্য ও গোলাপি বোতাম' },
] as const;

export const getHeroDesign = (id?: string) => heroDesigns.find(item => item.id === id)?.id ?? '01';

export const heroColorFields = [
  { key: 'sectionBg', label: 'পটভূমি' },
  { key: 'heading', label: 'শিরোনাম' },
  { key: 'body', label: 'বর্ণনা' },
  { key: 'badgeBg', label: 'ব্যাজের পটভূমি' },
  { key: 'badgeText', label: 'ব্যাজের লেখা' },
  { key: 'buttonBg', label: 'বোতামের পটভূমি' },
  { key: 'buttonText', label: 'বোতামের লেখা' },
  { key: 'accent', label: 'বর্ডার ও দাম' },
] as const;

/** Offer-timer (hero design 04) color overrides, stored as flat hero keys. */
export const offerTimerColorFields = [
  { key: 'timerBg', label: 'টাইমারের পটভূমি', cssVar: '--offer-timer-bg' },
  { key: 'timerText', label: 'টাইমারের লেখা', cssVar: '--offer-timer-text' },
  { key: 'timerCellBg', label: 'ঘরের পটভূমি', cssVar: '--offer-timer-cell' },
  { key: 'timerNumber', label: 'সংখ্যার রং', cssVar: '--offer-timer-number' },
  { key: 'timerLabel', label: 'লেবেলের রং', cssVar: '--offer-timer-label' },
  { key: 'timerBorder', label: 'টাইমারের নিচের লাইন', cssVar: '--offer-timer-border' },
  { key: 'timerDivider', label: 'ঘরের মাঝের লাইন', cssVar: '--offer-timer-divider' },
] as const;
