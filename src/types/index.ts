export interface Category {
  id: string;
  name: string;
  name_bn: string;
  icon: string | null;
  image_url: string | null;
  slug: string;
  created_at: string;
  parent_id: string | null;
}
 
  export interface ProductVariation {
    id: string;
    product_id: string;
    variation_type: string;
    variation_name: string;
    price: number;
    stock: number | null;
    sort_order: number;
    is_default: boolean;
   image_url: string | null;
   /** Variation group (e.g. "কালার", "সাইজ"); null/empty = legacy single group. */
   group_name?: string | null;
    created_at: string;
  }

export interface Product {
  id: string;
  name: string;
  name_bn: string;
  description: string | null;
  description_bn: string | null;
  short_description: string | null;
  short_description_bn: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[] | null;
  video_url: string | null;
  review_images?: string[] | null;
  category_id: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_new: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
  // Shipping fields
  shipping_inside_dhaka: number | null;
  shipping_outside_dhaka: number | null;
  free_shipping: boolean;
  // Inventory fields
  cost_price: number | null;
  low_stock_threshold: number;
  // Variation fields
  has_variations: boolean;
  variation_type: string | null;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  total_amount: number;
  shipping_cost: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}
