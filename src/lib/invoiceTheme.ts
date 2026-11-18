export interface InvoiceColors {
  // Header
  header_bg: string;
  header_accent_bg: string;
  header_brown_bg: string;
  brand_name_color: string;
  brand_tagline_color: string;
  invoice_label_color: string;
  invoice_id_color: string;
  // Separator
  separator_left_bg: string;
  separator_right_bg: string;
  // Body
  page_bg: string;
  body_text_color: string;
  badge_bg: string;
  badge_text_color: string;
  badge_border_color: string;
  section_name_color: string;
  section_info_color: string;
  // Table
  table_header_bg: string;
  table_header_text: string;
  table_row_text: string;
  table_row_border: string;
  // Totals
  summary_text: string;
  total_bar_bg: string;
  total_bar_text: string;
  // Footer
  thanks_title_color: string;
  thanks_text_color: string;
  signature_color: string;
  signature_label_color: string;
  bottom_band_left_bg: string;
  bottom_band_right_bg: string;
  // Print button
  print_button_bg: string;
  print_button_text: string;
  // Product images
  show_product_image: string;
  // Sticker
  sticker_enabled: string;
  sticker_border: string;
  sticker_header_bg: string;
  sticker_header_text: string;
  sticker_accent: string;
  sticker_label_color: string;
  sticker_value_color: string;
  sticker_slogan_color: string;
  sticker_slogan: string;
  sticker_hotline: string;
  sticker_template: string;
}

const DEFAULT_PRIMARY = "#1a2a44";
const DEFAULT_ACCENT = "#f39c12";

export const getInvoiceColors = (
  getSetting: (key: string, defaultValue?: string) => string
): InvoiceColors => {
  const primary = getSetting("invoice_primary_color", DEFAULT_PRIMARY);
  const accent = getSetting("invoice_accent_color", DEFAULT_ACCENT);

  return {
    header_bg: getSetting("invoice_header_bg", primary),
    header_accent_bg: getSetting("invoice_header_accent_bg", accent),
    header_brown_bg: getSetting("invoice_header_brown_bg", "#8b5a2b"),
    brand_name_color: getSetting("invoice_brand_name_color", "#ffffff"),
    brand_tagline_color: getSetting("invoice_brand_tagline_color", "rgba(255,255,255,0.85)"),
    invoice_label_color: getSetting("invoice_label_color", accent),
    invoice_id_color: getSetting("invoice_id_color", "#ffffff"),

    separator_left_bg: getSetting("invoice_separator_left_bg", accent),
    separator_right_bg: getSetting("invoice_separator_right_bg", "#ffd9a8"),

    page_bg: getSetting("invoice_page_bg", "#ffffff"),
    body_text_color: getSetting("invoice_body_text_color", "#222222"),
    badge_bg: getSetting("invoice_badge_bg", primary),
    badge_text_color: getSetting("invoice_badge_text_color", "#ffffff"),
    badge_border_color: getSetting("invoice_badge_border_color", accent),
    section_name_color: getSetting("invoice_section_name_color", "#222222"),
    section_info_color: getSetting("invoice_section_info_color", "#555555"),

    table_header_bg: getSetting("invoice_table_header_bg", accent),
    table_header_text: getSetting("invoice_table_header_text", "#ffffff"),
    table_row_text: getSetting("invoice_table_row_text", "#333333"),
    table_row_border: getSetting("invoice_table_row_border", "#e8e8e8"),

    summary_text: getSetting("invoice_summary_text", "#333333"),
    total_bar_bg: getSetting("invoice_total_bar_bg", accent),
    total_bar_text: getSetting("invoice_total_bar_text", "#ffffff"),

    thanks_title_color: getSetting("invoice_thanks_title_color", "#222222"),
    thanks_text_color: getSetting("invoice_thanks_text_color", "#888888"),
    signature_color: getSetting("invoice_signature_color", "#222222"),
    signature_label_color: getSetting("invoice_signature_label_color", "#666666"),
    bottom_band_left_bg: getSetting("invoice_bottom_band_left_bg", accent),
    bottom_band_right_bg: getSetting("invoice_bottom_band_right_bg", primary),

    print_button_bg: getSetting("invoice_print_button_bg", primary),
    print_button_text: getSetting("invoice_print_button_text", "#ffffff"),

    show_product_image: getSetting("invoice_show_product_image", "true"),

    sticker_enabled: getSetting("invoice_sticker_enabled", "true"),
    sticker_border: getSetting("invoice_sticker_border", primary),
    sticker_header_bg: getSetting("invoice_sticker_header_bg", primary),
    sticker_header_text: getSetting("invoice_sticker_header_text", "#ffffff"),
    sticker_accent: getSetting("invoice_sticker_accent", accent),
    sticker_label_color: getSetting("invoice_sticker_label_color", "#111111"),
    sticker_value_color: getSetting("invoice_sticker_value_color", "#000000"),
    sticker_slogan_color: getSetting("invoice_sticker_slogan_color", primary),
    sticker_slogan: getSetting("invoice_sticker_slogan", "আপনাদের সেবা আমাদের ধর্ম"),
    sticker_hotline: getSetting("invoice_sticker_hotline", ""),
    sticker_template: getSetting("invoice_sticker_template", "classic"),
  };
};

// Default values keyed by setting key (for the admin form & settings defaults)
export const invoiceColorDefaults: Record<string, string> = {
  invoice_header_bg: DEFAULT_PRIMARY,
  invoice_header_accent_bg: DEFAULT_ACCENT,
  invoice_header_brown_bg: "#8b5a2b",
  invoice_brand_name_color: "#ffffff",
  invoice_brand_tagline_color: "#dfe3ea",
  invoice_label_color: DEFAULT_ACCENT,
  invoice_id_color: "#ffffff",
  invoice_separator_left_bg: DEFAULT_ACCENT,
  invoice_separator_right_bg: "#ffd9a8",
  invoice_page_bg: "#ffffff",
  invoice_body_text_color: "#222222",
  invoice_badge_bg: DEFAULT_PRIMARY,
  invoice_badge_text_color: "#ffffff",
  invoice_badge_border_color: DEFAULT_ACCENT,
  invoice_section_name_color: "#222222",
  invoice_section_info_color: "#555555",
  invoice_table_header_bg: DEFAULT_ACCENT,
  invoice_table_header_text: "#ffffff",
  invoice_table_row_text: "#333333",
  invoice_table_row_border: "#e8e8e8",
  invoice_summary_text: "#333333",
  invoice_total_bar_bg: DEFAULT_ACCENT,
  invoice_total_bar_text: "#ffffff",
  invoice_thanks_title_color: "#222222",
  invoice_thanks_text_color: "#888888",
  invoice_signature_color: "#222222",
  invoice_signature_label_color: "#666666",
  invoice_bottom_band_left_bg: DEFAULT_ACCENT,
  invoice_bottom_band_right_bg: DEFAULT_PRIMARY,
  invoice_print_button_bg: DEFAULT_PRIMARY,
  invoice_print_button_text: "#ffffff",
  invoice_show_product_image: "true",
  invoice_sticker_enabled: "true",
  invoice_sticker_border: DEFAULT_PRIMARY,
  invoice_sticker_header_bg: DEFAULT_PRIMARY,
  invoice_sticker_header_text: "#ffffff",
  invoice_sticker_accent: DEFAULT_ACCENT,
  invoice_sticker_label_color: "#111111",
  invoice_sticker_value_color: "#000000",
  invoice_sticker_slogan_color: DEFAULT_PRIMARY,
  invoice_sticker_slogan: "আপনাদের সেবা আমাদের ধর্ম",
  invoice_sticker_hotline: "",
  invoice_sticker_template: "classic",
};