/** Shared contact presentation; optional overrides live in template_styles.contact. */
export const contactDesigns = [
  { id: "01", label: "ক্লাসিক", description: "একটির নিচে একটি" },
  { id: "02", label: "পাশাপাশি", description: "পাশাপাশি দুটি মাধ্যম" },
  { id: "03", label: "টিকিট", description: "আলাদা নম্বর প্যানেল" },
] as const;

export const getContactDesign = (value: unknown) =>
  contactDesigns.find(design => design.id === value)?.id ?? "01";

export const contactTextFields = [
  { key: "phoneLabel", label: "ফোনের উপরের লেখা", defaultText: "ফোনে অর্ডার" },
  { key: "phoneAction", label: "কল করার লেখা", defaultText: "কল করুন" },
  { key: "whatsappLabel", label: "হোয়াটসঅ্যাপের উপরের লেখা", defaultText: "হোয়াটসঅ্যাপ" },
  { key: "whatsappAction", label: "মেসেজ করার লেখা", defaultText: "মেসেজ করুন" },
] as const;

export const contactColorGroups = [
  { label: "সেকশন ও শিরোনাম", fields: [
    { key: "sectionBg", label: "সেকশনের পটভূমি", defaultColor: "#071f13" },
    { key: "panelBg", label: "প্যানেলের পটভূমি", defaultColor: "#103e2b" },
    { key: "panelBorder", label: "প্যানেলের বর্ডার", defaultColor: "#266145" },
    { key: "headingText", label: "শিরোনামের লেখা", defaultColor: "#ffffff" },
    { key: "subtitleText", label: "উপশিরোনামের লেখা", defaultColor: "#b7d2c2" },
    { key: "iconBg", label: "শিরোনামের আইকনের পটভূমি", defaultColor: "#0f9563" },
    { key: "iconText", label: "শিরোনামের আইকন", defaultColor: "#ffffff" },
  ] },
  { label: "ফোন", fields: [
    { key: "phoneBg", label: "ফোন বাটনের পটভূমি", defaultColor: "#119b5b" },
    { key: "phoneBorder", label: "ফোন বাটনের বর্ডার", defaultColor: "#119b5b" },
    { key: "phoneText", label: "ফোন নম্বর ও লেখার রং", defaultColor: "#ffffff" },
    { key: "phoneHint", label: "ফোনের ছোট লেখার রং", defaultColor: "#def7e8" },
    { key: "phoneIconBg", label: "ফোন আইকনের পটভূমি", defaultColor: "#168953" },
    { key: "phoneIcon", label: "ফোন আইকন", defaultColor: "#ffffff" },
    { key: "phoneActionText", label: "কল করার লেখার রং", defaultColor: "#ffffff" },
  ] },
  { label: "হোয়াটসঅ্যাপ", fields: [
    { key: "whatsappBg", label: "হোয়াটসঅ্যাপ বাটনের পটভূমি", defaultColor: "#16b868" },
    { key: "whatsappBorder", label: "হোয়াটসঅ্যাপ বাটনের বর্ডার", defaultColor: "#16b868" },
    { key: "whatsappText", label: "হোয়াটসঅ্যাপ লেখার রং", defaultColor: "#ffffff" },
    { key: "whatsappHint", label: "হোয়াটসঅ্যাপের ছোট লেখার রং", defaultColor: "#def7e8" },
    { key: "whatsappIconBg", label: "হোয়াটসঅ্যাপ আইকনের পটভূমি", defaultColor: "#10855a" },
    { key: "whatsappIcon", label: "হোয়াটসঅ্যাপ আইকন", defaultColor: "#ffffff" },
    { key: "whatsappActionText", label: "মেসেজ করার লেখার রং", defaultColor: "#ffffff" },
  ] },
] as const;

export const getContactColorVariables = (contact: Record<string, string> | undefined): Record<string, string> => {
  const variables: Record<string, string> = {};
  for (const group of contactColorGroups) {
    for (const field of group.fields) {
      const value = contact?.[field.key];
      if (value && /^#[0-9a-fA-F]{6}$/.test(value)) variables[`--contact-${field.key}`] = value;
    }
  }
  return variables;
};
