/** Hero 09 uses isolated copy/color overrides while retaining shared page media and prices. */
export const hero09TextFields = [
  { key: 'text_hero09_accent', label: 'শিরোনামের লাল অংশ', fallback: '' },
  { key: 'text_hero09_subtitle', label: 'শিরোনামের নিচের লেখা', fallback: 'স্টাইলে থাকুন সবসময় — ট্রেন্ডি থ্রি পিস এখন আপনার হাতের নাগালে!' },
  { key: 'text_hero09_badge', label: 'ছবির নিচের ব্যাজ', fallback: '৫ পিস প্রিমিয়াম থ্রি-পিস কম্বো' },
  { key: 'text_hero09_button', label: 'অর্ডার বোতামের লেখা', fallback: 'অর্ডার করুন এখনই' },
  { key: 'text_hero09_call', label: 'কল বোতামের লেখা', fallback: 'কল করুন' },
] as const;

export const hero09ColorFields = [
  { key: 'hero09BottomBg', label: 'নিচের পটভূমি', cssVar: '--hero09-bottom-bg', fallback: '#fffaf0' },
  { key: 'hero09Highlight', label: 'শিরোনামের লাল অংশ', cssVar: '--hero09-highlight', fallback: '#e82225' },
  { key: 'hero09ImageBorder', label: 'ছবির বর্ডার', cssVar: '--hero09-image-border', fallback: '#ffce08' },
  { key: 'hero09CallBg', label: 'কল বোতামের পটভূমি', cssVar: '--hero09-call-bg', fallback: '#e82225' },
  { key: 'hero09CallText', label: 'কল বোতামের লেখা', cssVar: '--hero09-call-text', fallback: '#ffffff' },
] as const;