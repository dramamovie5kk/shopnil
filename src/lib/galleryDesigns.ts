/** Gallery customizations are opt-in, preserving local galleries on existing pages. */
export const galleryDesigns = [
  { id: "01", label: "ছবি ও থাম্বনেইল", description: "বড় ছবি, নিচে ছোট ছবি" },
  { id: "02", label: "কালেকশন কার্ড", description: "পরিষ্কার ছবির গ্রিড" },
  { id: "03", label: "থাম্বনেইল স্লাইডার", description: "ছোট ছবিতে দ্রুত বাছাই" },
  { id: "04", label: "অর্ডার কার্ড", description: "প্রতিটি ছবির নিচে অর্ডার" },
  { id: "05", label: "সম্পাদকীয় শোকেস", description: "একটি বড় ও পাশের ছবি" },
  { id: "06", label: "ফিল্মস্ট্রিপ", description: "পাশাপাশি স্ক্রল করা ছবি" },
] as const;

export const galleryColorGroups = [
  { label: "সেকশন ও লেখা", fields: [
    { key: "sectionBg", label: "পটভূমি" }, { key: "heading", label: "শিরোনাম" },
    { key: "subtitle", label: "বর্ণনা" }, { key: "caption", label: "ছবির নাম" },
  ] },
  { label: "ছবি ও নিয়ন্ত্রণ", fields: [
    { key: "cardBg", label: "কার্ডের পটভূমি" }, { key: "cardBorder", label: "কার্ডের বর্ডার" },
    { key: "controlBg", label: "তীরের পটভূমি" }, { key: "controlText", label: "তীরের রং" },
    { key: "active", label: "নির্বাচিত ছবির বর্ডার" },
  ] },
  { label: "অর্ডার বোতাম", fields: [
    { key: "buttonBg", label: "বোতামের পটভূমি" }, { key: "buttonText", label: "বোতামের লেখা" },
  ] },
] as const;

export const galleryPalette: Record<string, Record<string, string>> = {
  "01": { sectionBg: "#641e1e", heading: "#ffffff", subtitle: "#f1d9d4", caption: "#ffffff", cardBg: "#ffffff", cardBorder: "#f0ca76", controlBg: "#ffffff", controlText: "#641e1e", active: "#f0ca76", buttonBg: "#f0ca76", buttonText: "#3e1717" },
  "02": { sectionBg: "#f5f8f6", heading: "#153d34", subtitle: "#5b7068", caption: "#253f37", cardBg: "#ffffff", cardBorder: "#dce8e0", controlBg: "#ffffff", controlText: "#173f34", active: "#287957", buttonBg: "#175c43", buttonText: "#ffffff" },
  "03": { sectionBg: "#fcfaf5", heading: "#303b35", subtitle: "#69756b", caption: "#303b35", cardBg: "#ffffff", cardBorder: "#e4e4da", controlBg: "#ffffff", controlText: "#303b35", active: "#af7751", buttonBg: "#2e604d", buttonText: "#ffffff" },
  "04": { sectionBg: "#f7f8f5", heading: "#223d35", subtitle: "#64746b", caption: "#223d35", cardBg: "#ffffff", cardBorder: "#dae5dd", controlBg: "#ffffff", controlText: "#223d35", active: "#247650", buttonBg: "#18734f", buttonText: "#ffffff" },
  "05": { sectionBg: "#edf3f1", heading: "#193a37", subtitle: "#627671", caption: "#193a37", cardBg: "#ffffff", cardBorder: "#d4e2de", controlBg: "#ffffff", controlText: "#193a37", active: "#257c77", buttonBg: "#205f59", buttonText: "#ffffff" },
  "06": { sectionBg: "#172b2a", heading: "#ffffff", subtitle: "#c1d1cb", caption: "#ffffff", cardBg: "#27403d", cardBorder: "#44605b", controlBg: "#f4f7f2", controlText: "#1a3b34", active: "#9ad5a9", buttonBg: "#b5dfa9", buttonText: "#18372c" },
};

export const getGalleryDesign = (id?: string) => galleryDesigns.find(d => d.id === id)?.id ?? "01";
export const getGalleryVariables = (saved: Record<string, string> | undefined, design: string): Record<string, string> => {
  const palette = galleryPalette[design] ?? galleryPalette["01"];
  const variables: Record<string, string> = {};
  for (const group of galleryColorGroups) for (const field of group.fields) {
    const color = saved?.[field.key];
    variables[`--gallery-${field.key}`] = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : palette[field.key];
  }
  return variables;
};
