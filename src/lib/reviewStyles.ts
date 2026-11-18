/** Optional flat review copy/color overrides; absent values retain each template's palette. */
export const reviewTextFields = [
  { key: "rating", label: "রেটিংয়ের লেখা", defaultText: "রেটিং দেখাতে লেখা লিখুন" },
  { key: "videoTitle", label: "ভিডিওর শিরোনাম", defaultText: "ভিডিওর উপরে শিরোনাম লিখুন" },
  { key: "previous", label: "আগের ছবির বাটনের নাম", defaultText: "আগের রিভিউ" },
  { key: "next", label: "পরের ছবির বাটনের নাম", defaultText: "পরের রিভিউ" },
  { key: "imageAlt", label: "ছবির বর্ণনা", defaultText: "কাস্টমার রিভিউ" },
  { key: "pageLabel", label: "স্লাইডারের পৃষ্ঠা নির্বাচন", defaultText: "রিভিউ পৃষ্ঠা" },
] as const;

export const reviewColorGroups = [
  { label: "সেকশন ও লেখা", fields: [
    { key: "sectionBg", label: "সেকশনের পটভূমি" },
    { key: "headingText", label: "শিরোনামের রং" },
    { key: "subtitleText", label: "শিরোনামের নিচের লেখার রং" },
    { key: "ratingText", label: "রেটিং লেখার রং" },
    { key: "star", label: "তারকার রং" },
  ] },
  { label: "ভিডিও ও ছবি", fields: [
    { key: "videoTitleText", label: "ভিডিও শিরোনামের রং" },
    { key: "videoBg", label: "ভিডিওর পটভূমি" },
    { key: "videoBorder", label: "ভিডিওর বর্ডার" },
    { key: "imageBg", label: "ছবির পটভূমি" },
    { key: "imageBorder", label: "ছবির বর্ডার" },
    { key: "controlBg", label: "স্লাইডারের বাটন" },
    { key: "controlIcon", label: "বাটনের আইকন" },
    { key: "dotActive", label: "সক্রিয় ডট" },
    { key: "dotInactive", label: "অন্যান্য ডট" },
  ] },
] as const;

export const reviewDefaults = (templateId: string | null | undefined): Record<string, string> => {
  const isFashion = templateId === "template-03-fashion";
  const isGadget = templateId === "template-04-gadget";
  const isUniversal = templateId === "template-15-universal";
  const sectionBg = isFashion ? "#4c1d95" : isGadget ? "#0f172a" : isUniversal ? "#065f46" : "#052e16";
  const foreground = "#ffffff";
  const accent = isFashion ? "#ec4899" : isGadget ? "#06b6d4" : isUniversal ? "#4ade80" : "#22c55e";
  return {
    sectionBg, headingText: foreground, subtitleText: "#b7d2c2",
    ratingText: "#b7d2c2", star: "#fbbf24",
    videoTitleText: foreground, videoBg: "#071f13",
    videoBorder: accent, imageBg: "#103e2b", imageBorder: accent,
    controlBg: accent, controlIcon: "#ffffff", dotActive: accent, dotInactive: "#6f9180",
  };
};

export const getReviewVariables = (review: Record<string, string> | undefined, templateId: string | null | undefined, legacy?: Record<string, string>): Record<string, string> => {
  const defaults = { ...reviewDefaults(templateId), ...legacy };
  const variables: Record<string, string> = {};
  for (const group of reviewColorGroups) for (const field of group.fields) {
    const value = review?.[field.key];
    variables[`--review-${field.key}`] = value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : defaults[field.key];
  }
  return variables;
};
