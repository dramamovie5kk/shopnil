/** Persisted under sales_pages.template_styles.checkout.design for every template. */
export const checkoutDesigns = [
  { id: "01", label: "ক্লাসিক" },
  { id: "02", label: "মিনিমাল" },
  { id: "03", label: "স্প্লিট" },
  { id: "04", label: "টিকিট" },
  { id: "05", label: "হাইলাইট" },
  { id: "06", label: "কমপ্যাক্ট" },
  { id: "07", label: "এডিটোরিয়াল" },
  { id: "08", label: "সাইডবার" },
  { id: "09", label: "আউটলাইন" },
  { id: "10", label: "ইনভয়েস" },
] as const;

export const getCheckoutDesign = (value: unknown): string =>
  checkoutDesigns.find((design) => design.id === value)?.id ?? "01";

/** Optional copy overrides share the checkout settings with design and colors. */
export const checkoutTextGroups = [
  { label: "শিরোনাম ও পণ্য", fields: [
    { key: "productsHeading", label: "প্রোডাক্ট বাছাই শিরোনাম", defaultText: "আপনার পছন্দের প্রোডাক্ট সিলেক্ট করুন" },
    { key: "title", label: "চেকআউট শিরোনাম", defaultText: "অর্ডার করুন" },
    { key: "urgency", label: "শিরোনামের নিচের লেখা", defaultText: "" },
    { key: "discount", label: "ছাড়ের লেখা", defaultText: "ছাড়" },
    { key: "variationSize", label: "সাইজ বাছাই", defaultText: "সাইজ বাছুন" },
    { key: "variationColor", label: "রঙ বাছাই", defaultText: "রঙ বাছুন" },
    { key: "variationPack", label: "প্যাক বাছাই", defaultText: "প্যাক বাছুন" },
    { key: "variationCustom", label: "অপশন বাছাই", defaultText: "অপশন বাছুন" },
  ] },
  { label: "গ্রাহকের তথ্য ও ডেলিভারি", advanced: true, fields: [
    { key: "nameLabel", label: "নামের লেবেল", defaultText: "আপনার নাম" },
    { key: "namePlaceholder", label: "নামের ইঙ্গিত", defaultText: "আপনার পুরো নাম" },
    { key: "phoneLabel", label: "মোবাইলের লেবেল", defaultText: "মোবাইল নম্বর" },
    { key: "phonePlaceholder", label: "মোবাইলের ইঙ্গিত", defaultText: "01XXXXXXXXX" },
    { key: "phoneIncomplete", label: "অসম্পূর্ণ ফোনের বার্তা", defaultText: "ফোন নম্বর অসম্পূর্ণ" },
    { key: "phoneInvalid", label: "ভুল ফোনের বার্তা", defaultText: "সঠিক বাংলাদেশি ফোন নম্বর দিন" },
    { key: "phoneValid", label: "সঠিক ফোনের বার্তা", defaultText: "সঠিক ফোন নম্বর" },
    { key: "addressLabel", label: "ঠিকানার লেবেল", defaultText: "সম্পূর্ণ ঠিকানা" },
    { key: "addressPlaceholder", label: "ঠিকানার ইঙ্গিত", defaultText: "বাড়ি নং, রোড, এলাকা, থানা" },
    { key: "thanaLabel", label: "থানার লেবেল", defaultText: "থানা" },
    { key: "thanaPlaceholder", label: "থানার ইঙ্গিত", defaultText: "আপনার থানা" },
    { key: "districtLabel", label: "জেলার লেবেল", defaultText: "জেলা" },
    { key: "districtPlaceholder", label: "জেলার ইঙ্গিত", defaultText: "আপনার জেলা" },
    { key: "additionalInfoLabel", label: "কাস্টম ফিল্ডের লেবেল", defaultText: "অতিরিক্ত কোনো তথ্য" },
    { key: "additionalInfoPlaceholder", label: "কাস্টম ফিল্ডের ইঙ্গিত", defaultText: "অতিরিক্ত কোনো তথ্য থাকলে লিখুন" },
    { key: "areaLabel", label: "এলাকার লেবেল", defaultText: "ডেলিভারি এলাকা" },
    { key: "insideDhaka", label: "ঢাকার ভিতরের অপশন", defaultText: "ঢাকার ভিতরে" },
    { key: "outsideDhaka", label: "ঢাকার বাইরের অপশন", defaultText: "ঢাকার বাইরে" },
  ] },
  { label: "পেমেন্ট", advanced: true, fields: [
    { key: "paymentLabel", label: "পেমেন্টের লেবেল", defaultText: "পেমেন্ট মেথড" },
    { key: "cod", label: "ক্যাশ অন ডেলিভারি অপশন", defaultText: "ক্যাশ অন ডেলিভারি" },
    { key: "online", label: "অনলাইন পেমেন্ট অপশন", defaultText: "অনলাইন পেমেন্ট" },
    { key: "noPaymentNumber", label: "নাম্বার না থাকার বার্তা", defaultText: "অনলাইন পেমেন্ট নাম্বার এখনো যোগ করা হয়নি।" },
    { key: "paymentInstruction", label: "টাকা পাঠানোর নির্দেশনা (টাকার আগে)", defaultText: "নিচের যেকোনো নাম্বারে মোট" },
    { key: "paymentInstructionEnd", label: "টাকা পাঠানোর নির্দেশনা (টাকার পরে)", defaultText: "Send Money করুন, তারপর তথ্য দিন:" },
    { key: "bkash", label: "বিকাশ ট্যাব", defaultText: "বিকাশ" },
    { key: "nagad", label: "নগদ ট্যাব", defaultText: "নগদ" },
    { key: "rocket", label: "রকেট ট্যাব", defaultText: "রকেট" },
    { key: "accountDetail", label: "নাম্বারের বিবরণ", defaultText: "(পার্সোনাল) — Send Money" },
    { key: "copy", label: "কপি বাটন", defaultText: "কপি" },
    { key: "senderLabel", label: "সেন্ডার নাম্বারের লেবেল", defaultText: "সেন্ডার" },
    { key: "senderSuffix", label: "সেন্ডার লেবেলের শেষাংশ", defaultText: "নাম্বার" },
    { key: "senderPlaceholder", label: "সেন্ডার নাম্বারের ইঙ্গিত", defaultText: "01XXXXXXXXX" },
    { key: "transactionLabel", label: "ট্রানজেকশন আইডির লেবেল", defaultText: "ট্রানজেকশন আইডি (TrxID)" },
    { key: "transactionPlaceholder", label: "ট্রানজেকশন আইডির ইঙ্গিত", defaultText: "যেমন: 8N7A6D5X2K" },
    { key: "copySuccess", label: "নাম্বার কপির বার্তা", defaultText: "নাম্বার কপি হয়েছে" },
    { key: "senderInvalid", label: "ভুল সেন্ডার নাম্বারের বার্তা", defaultText: "যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি সঠিকভাবে দিন (১১ ডিজিট)" },
    { key: "transactionInvalid", label: "ভুল ট্রানজেকশন আইডির বার্তা", defaultText: "সঠিক ট্রানজেকশন আইডি দিন" },
  ] },
  { label: "কুপন ও হিসাব", advanced: true, fields: [
    { key: "couponLabel", label: "কুপন শিরোনাম", defaultText: "কুপন কোড আছে?" },
    { key: "couponPlaceholder", label: "কুপন ইনপুটের ইঙ্গিত", defaultText: "কুপন কোড লিখুন" },
    { key: "couponApply", label: "কুপন প্রয়োগ বাটন", defaultText: "প্রয়োগ" },
    { key: "couponFreeShipping", label: "কুপনের ফ্রি শিপিং লেখা", defaultText: "ফ্রি শিপিং! 🚚" },
    { key: "couponDiscount", label: "কুপনের ছাড়", defaultText: "ছাড়:" },
    { key: "couponInvalid", label: "অবৈধ কুপনের বার্তা", defaultText: "কুপন কোডটি অবৈধ বা ইতিমধ্যে ব্যবহৃত" },
    { key: "couponError", label: "কুপন চেকের সমস্যা", defaultText: "কুপন চেক করতে সমস্যা হয়েছে" },
    { key: "subtotal", label: "সাবটোটাল", defaultText: "সাবটোটাল:" },
    { key: "couponSavings", label: "কুপন ছাড়", defaultText: "কুপন ছাড়:" },
    { key: "deliveryCharge", label: "ডেলিভারি চার্জ", defaultText: "ডেলিভারি চার্জ:" },
    { key: "free", label: "ফ্রি ডেলিভারি লেখা", defaultText: "ফ্রি" },
    { key: "total", label: "মোট", defaultText: "মোট:" },
  ] },
  { label: "অর্ডার বাটন ও নিচের লেখা", fields: [
    { key: "submit", label: "অর্ডার বাটনের লেখা", defaultText: "অর্ডার কনফার্ম করুন" },
    { key: "processing", label: "অর্ডার প্রসেসের লেখা", defaultText: "প্রসেস হচ্ছে..." },
    { key: "orderPhoneInvalid", label: "অর্ডারের ভুল ফোনের বার্তা", defaultText: "সঠিক ফোন নম্বর দিন (১১ ডিজিট)" },
    { key: "duplicateOrder", label: "আগের অর্ডারের বার্তা", defaultText: "আপনি ইতিমধ্যে একটি অর্ডার করেছেন" },
    { key: "orderSuccess", label: "সফল অর্ডারের বার্তা", defaultText: "অর্ডার সফল হয়েছে!" },
    { key: "orderError", label: "অর্ডারের সমস্যা", defaultText: "অর্ডার করতে সমস্যা হয়েছে" },
    { key: "codFooter", label: "ক্যাশ অন ডেলিভারির নিচের লেখা", defaultText: "📦 পণ্য হাতে পেয়ে পেমেন্ট করুন" },
    { key: "onlineFooter", label: "অনলাইন পেমেন্টের নিচের লেখা", defaultText: "💳 টাকা পাঠিয়ে নাম্বার ও TrxID দিয়ে অর্ডার কনফার্ম করুন" },
  ] },
] as const;

export type CheckoutTextKey = (typeof checkoutTextGroups)[number]["fields"][number]["key"];
export const getCheckoutText = (checkout: Record<string, string> | undefined, key: CheckoutTextKey, fallback: string) =>
  checkout?.[`text_${key}`]?.trim() || fallback;

/** Shared checkout palette fields. Values are optional so existing pages retain their original look. */
export const checkoutColorGroups = [
  { label: "চেকআউট ও কার্ড", fields: [
    { key: "sectionBg", label: "সেকশনের পটভূমি", defaultColor: "#020617" },
    { key: "cardBg", label: "কার্ডের পটভূমি", defaultColor: "#101a2b" },
    { key: "cardBorder", label: "কার্ডের বর্ডার", defaultColor: "#334155" },
    { key: "headingBg", label: "শিরোনামের পটভূমি", defaultColor: "#16a34a" },
    { key: "headingText", label: "শিরোনামের লেখা", defaultColor: "#ffffff" },
    { key: "urgencyText", label: "শিরোনামের নিচের লেখা", defaultColor: "#ffffff" },
    { key: "divider", label: "অংশগুলোর বর্ডার", defaultColor: "#334155" },
  ] },
  { label: "পণ্য ও পরিমাণ", fields: [
    { key: "productText", label: "পণ্যের নাম", defaultColor: "#ffffff" },
    { key: "priceText", label: "দাম", defaultColor: "#22c55e" },
    { key: "oldPriceText", label: "আগের দাম", defaultColor: "#94a3b8" },
    { key: "discountBg", label: "ছাড়ের ব্যাজ", defaultColor: "#164e36" },
    { key: "discountText", label: "ছাড়ের লেখা", defaultColor: "#22c55e" },
    { key: "quantityBg", label: "পরিমাণ বাটন", defaultColor: "#16a34a" },
    { key: "quantityText", label: "পরিমাণ বাটনের চিহ্ন", defaultColor: "#ffffff" },
    { key: "quantityNumber", label: "পরিমাণের সংখ্যা", defaultColor: "#ffffff" },
  ] },
  { label: "ফর্ম ও অপশন", fields: [
    { key: "labelText", label: "ফর্মের লেবেল", defaultColor: "#cbd5e1" },
    { key: "icon", label: "লেবেলের আইকন", defaultColor: "#22c55e" },
    { key: "inputBg", label: "ইনপুটের পটভূমি", defaultColor: "#182235" },
    { key: "inputText", label: "ইনপুটের লেখা", defaultColor: "#ffffff" },
    { key: "placeholder", label: "ইনপুটের ইঙ্গিত", defaultColor: "#94a3b8" },
    { key: "inputBorder", label: "ইনপুটের বর্ডার", defaultColor: "#334155" },
    { key: "optionBg", label: "অনির্বাচিত অপশন", defaultColor: "#182235" },
    { key: "optionText", label: "অনির্বাচিত অপশনের লেখা", defaultColor: "#cbd5e1" },
    { key: "optionBorder", label: "অপশনের বর্ডার", defaultColor: "#334155" },
    { key: "selectedBg", label: "নির্বাচিত অপশন", defaultColor: "#16a34a" },
    { key: "selectedText", label: "নির্বাচিত অপশনের লেখা", defaultColor: "#ffffff" },
    { key: "couponBg", label: "কুপন বক্স", defaultColor: "#f8fafc" },
    { key: "couponText", label: "কুপনের লেখা", defaultColor: "#334155" },
    { key: "couponButtonBg", label: "কুপন প্রয়োগ বাটন", defaultColor: "#22c55e" },
    { key: "couponButtonText", label: "কুপন বাটনের লেখা", defaultColor: "#ffffff" },
  ] },
  { label: "হিসাব ও অর্ডার", fields: [
    { key: "summaryBg", label: "হিসাবের পটভূমি", defaultColor: "#101a2b" },
    { key: "summaryBorder", label: "হিসাবের বর্ডার", defaultColor: "#334155" },
    { key: "summaryLabel", label: "হিসাবের লেবেল", defaultColor: "#cbd5e1" },
    { key: "summaryValue", label: "হিসাবের দাম", defaultColor: "#ffffff" },
    { key: "totalText", label: "মোট টাকার রং", defaultColor: "#22c55e" },
    { key: "submitBg", label: "অর্ডার বাটন", defaultColor: "#16a34a" },
    { key: "submitText", label: "অর্ডার বাটনের লেখা", defaultColor: "#ffffff" },
    { key: "footerText", label: "বাটনের নিচের লেখা", defaultColor: "#94a3b8" },
  ] },
] as const;

export const checkoutColorFields: { key: string; label: string; defaultColor: string }[] = checkoutColorGroups.reduce<{ key: string; label: string; defaultColor: string }[]>(
  (fields, group) => [...fields, ...group.fields], []
);

export const getCheckoutColorVariables = (checkout: Record<string, string> | undefined): Record<string, string> => {
  const variables: Record<string, string> = {};
  for (const field of checkoutColorFields) {
    const value = checkout?.[field.key];
    if (value && /^#[0-9a-fA-F]{6}$/.test(value)) {
      variables[`--checkout-${field.key}`] = value;
    }
  }
  return variables;
};