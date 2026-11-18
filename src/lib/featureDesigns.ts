/** Saved feature customization is opt-in; pages without a design retain their original section. */
export const featureDesigns = [
  { id: "01", label: "কার্ড গ্রিড", description: "ছবিসহ সমান কার্ড" },
  { id: "02", label: "পরিষ্কার তালিকা", description: "এক কলামে আইকন ও লেখা" },
  { id: "03", label: "নম্বর ধাপ", description: "ক্রমিক নম্বরের ধাপ" },
  { id: "04", label: "ছবি ও ফিচার", description: "পাশাপাশি ছবি ও তথ্য" },
  { id: "05", label: "বিকল্প সারি", description: "পর্যায়ক্রমে বিপরীত সারি" },
  { id: "06", label: "সংক্ষিপ্ত টাইল", description: "গাঢ় পটভূমিতে টাইল" },
] as const;

export const featureColorGroups = [
  { label: "সেকশন", fields: [
    { key: "sectionBg", label: "সেকশনের পটভূমি" },
    { key: "heading", label: "শিরোনামের রং" },
    { key: "subtitle", label: "শিরোনামের নিচের লেখার রং" },
  ] },
  { label: "ফিচার আইটেম", fields: [
    { key: "itemBg", label: "আইটেমের পটভূমি" },
    { key: "itemBorder", label: "আইটেমের বর্ডার" },
    { key: "iconBg", label: "আইকনের পটভূমি" },
    { key: "iconText", label: "আইকনের রং" },
    { key: "title", label: "আইটেমের শিরোনাম" },
    { key: "description", label: "আইটেমের বর্ণনা" },
    { key: "number", label: "ধাপের নম্বর" },
    { key: "imageBorder", label: "ছবির বর্ডার" },
  ] },
] as const;

export const getFeatureDesign = (id: string | undefined) => featureDesigns.find(d => d.id === id)?.id ?? "01";

export const featurePalette: Record<string, Record<string, string>> = {
  "01": { sectionBg: "#f0fdf4", heading: "#14532d", subtitle: "#4b6856", itemBg: "#ffffff", itemBorder: "#bbf7d0", iconBg: "#dcfce7", iconText: "#15803d", title: "#14532d", description: "#52645b", number: "#15803d", imageBorder: "#bbf7d0" },
  "02": { sectionBg: "#ffffff", heading: "#16332b", subtitle: "#64746c", itemBg: "#f7faf8", itemBorder: "#d5e8dc", iconBg: "#1e7255", iconText: "#ffffff", title: "#16332b", description: "#52645b", number: "#1e7255", imageBorder: "#d5e8dc" },
  "03": { sectionBg: "#f8f7f2", heading: "#253b36", subtitle: "#65716b", itemBg: "#ffffff", itemBorder: "#d9dfd8", iconBg: "#e1efe8", iconText: "#176f52", title: "#253b36", description: "#65716b", number: "#178a64", imageBorder: "#d9dfd8" },
  "04": { sectionBg: "#f5faf8", heading: "#123c34", subtitle: "#566d64", itemBg: "#ffffff", itemBorder: "#cde5d9", iconBg: "#d4f0e1", iconText: "#147a56", title: "#123c34", description: "#566d64", number: "#147a56", imageBorder: "#91bca7" },
  "05": { sectionBg: "#fcf9f2", heading: "#264039", subtitle: "#67736c", itemBg: "#ffffff", itemBorder: "#dbe3d7", iconBg: "#d9efdc", iconText: "#1c7652", title: "#264039", description: "#637168", number: "#1c7652", imageBorder: "#dbe3d7" },
  "06": { sectionBg: "#092b22", heading: "#ffffff", subtitle: "#c0d7ca", itemBg: "#164437", itemBorder: "#366a52", iconBg: "#80d1a2", iconText: "#0d3626", title: "#ffffff", description: "#c0d7ca", number: "#80d1a2", imageBorder: "#80d1a2" },
};

export const getFeatureVariables = (saved: Record<string, string> | undefined, design: string): Record<string, string> => {
  const variables: Record<string, string> = {};
  const palette = featurePalette[design] ?? featurePalette["01"];
  for (const group of featureColorGroups) for (const field of group.fields) {
    const color = saved?.[field.key];
    variables[`--feature-${field.key}`] = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : palette[field.key];
  }
  return variables;
};
