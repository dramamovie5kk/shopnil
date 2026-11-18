export interface SalesPage {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
  template_id: string;
  product_id: string | null;
  
  // Unlimited points support (JSONB arrays)
  feature_points?: FeaturePoint[];
  extra_section_1_points?: string[];
  extra_section_2_points?: string[];
  extra_section_3_points?: string[];
  
  // Section visibility toggles
  show_hero_section: boolean;
  show_countdown: boolean;
  show_video_section: boolean;
  show_gallery_section: boolean;
  show_features_section: boolean;
  show_reviews_section: boolean;
  show_contact_section: boolean;
  show_checkout_section: boolean;
  
  // Section variants (01, 02, 03)
  hero_variant: string;
  gallery_variant: string;
  feature_variant: string;
  review_variant: string;
  contact_variant: string;
  
  // Hero Section
  hero_badge_text: string;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_images: string[];
  hero_video_url: string | null;
  
  // Countdown
  countdown_end_date: string | null;
  countdown_label_days: string;
  countdown_label_hours: string;
  countdown_label_minutes: string;
  countdown_label_seconds: string;
  
  // Video Section
  video_url: string | null;
  video_title: string;
  video_subtitle: string;
  
  // Pricing Section
  offer_price: number;
  original_price: number | null;
  discount_text: string;
  price_unit: string;
  offer_details: string | null;
  
  // Payment
  payment_method: string;
  
  // Features Section
  features_headline: string;
  features_subheadline: string;
  feature_1_text: string;
  feature_1_icon: string;
  feature_1_description: string;
  feature_2_text: string;
  feature_2_icon: string;
  feature_2_description: string;
  feature_3_text: string;
  feature_3_icon: string;
  feature_3_description: string;
  feature_4_text: string;
  feature_4_icon: string;
  feature_4_description: string;
  feature_5_text: string;
  feature_5_icon: string;
  feature_5_description: string;
  feature_6_text: string;
  feature_6_icon: string;
  feature_6_description: string;
  feature_card_bg_color: string;
  feature_icon_bg_color: string;
  
  // Gallery / Product Grid
  gallery_title: string;
  gallery_subtitle: string;
  gallery_images: string[];
  gallery_product_prices: number[];
  
  // Reviews Section
  reviews_headline: string;
  reviews_subheadline: string;
  review_images: string[];
  review_video_url: string | null;
  
  // Contact Section
  contact_headline: string;
  contact_subheadline: string;
  contact_phone: string;
  contact_phone_link: string;
  contact_whatsapp: string;
  contact_whatsapp_text: string;
  contact_availability: string;
  
 // Footer
 footer_text: string | null;
 
  // CTA
  cta_button_text: string;
  cta_urgency_text: string;
  
  // Styling
  primary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  headline_color: string;
  button_color: string;
  
  // Metadata
  
  // Extra Sections (3 customizable sections with heading + 6 bullet points)
  show_extra_section_1: boolean;
  extra_section_1_heading: string;
  extra_section_1_point_1: string;
  extra_section_1_point_2: string;
  extra_section_1_point_3: string;
  extra_section_1_point_4: string;
  extra_section_1_point_5: string;
  extra_section_1_point_6: string;
  
  show_extra_section_2: boolean;
  extra_section_2_heading: string;
  extra_section_2_point_1: string;
  extra_section_2_point_2: string;
  extra_section_2_point_3: string;
  extra_section_2_point_4: string;
  extra_section_2_point_5: string;
  extra_section_2_point_6: string;
  
  show_extra_section_3: boolean;
  extra_section_3_heading: string;
  extra_section_3_point_1: string;
  extra_section_3_point_2: string;
  extra_section_3_point_3: string;
  extra_section_3_point_4: string;
  extra_section_3_point_5: string;
  extra_section_3_point_6: string;
  
  // Section Order
  section_order: string[];
  
  // Technical Specification Section
  show_spec_section: boolean;
  spec_section_heading: string;
  spec_items: SpecItem[];
  
  // Feature Section Image
  feature_section_image: string | null;
  feature_section_images: string[];
  
  // Template-specific styles (JSONB)
  template_styles?: Record<string, Record<string, string>>;

  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined data
  products?: {
    id: string;
    name: string;
    name_bn: string;
    price: number;
    image_url: string | null;
    original_price?: number | null;
    shipping_inside_dhaka?: number | null;
    shipping_outside_dhaka?: number | null;
    free_shipping?: boolean | null;
     has_variations?: boolean | null;
     variation_type?: string | null;
  };
}

export interface FeaturePoint {
  icon: string;
  text: string;
  description?: string;
}

export interface SpecItem {
  label: string;
  value: string;
}
