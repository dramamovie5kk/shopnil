export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_data: Json | null
          checkout_step: string | null
          created_at: string
          customer_ip: string | null
          customer_phone: string | null
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cart_data?: Json | null
          checkout_step?: string | null
          created_at?: string
          customer_ip?: string | null
          customer_phone?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cart_data?: Json | null
          checkout_step?: string | null
          created_at?: string
          customer_ip?: string | null
          customer_phone?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          block_type: string | null
          blocked_by: string | null
          blocked_until: string | null
          created_at: string
          id: string
          ip_address: string | null
          phone: string | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          block_type?: string | null
          blocked_by?: string | null
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          block_type?: string | null
          blocked_by?: string | null
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          button_link: string | null
          button_text: string | null
          content: string | null
          content_bn: string | null
          created_at: string
          featured_image: string | null
          id: string
          images: string[] | null
          is_published: boolean | null
          product_id: string | null
          sections: Json | null
          slug: string
          title: string
          title_bn: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          content_bn?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          product_id?: string | null
          sections?: Json | null
          slug: string
          title: string
          title_bn?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          content_bn?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          product_id?: string | null
          sections?: Json | null
          slug?: string
          title?: string
          title_bn?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          selection_key: string
          variation_ids: Json
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          selection_key?: string
          variation_ids?: Json
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          selection_key?: string
          variation_ids?: Json
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          name_bn: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_bn: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_bn?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          name_bn: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          name_bn: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          name_bn?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          variation_id: string | null
          variation_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          order_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_discount: number | null
          courier_consignment_id: string | null
          courier_id: string | null
          courier_ratio_data: Json | null
          courier_sent_at: string | null
          courier_tracking_code: string | null
          created_at: string
          customer_address: string
          customer_city: string
          customer_ip: string | null
          customer_name: string
          customer_phone: string
          id: string
          is_duplicate_blocked: boolean | null
          notes: string | null
          order_source: string | null
          payment_method: string
          purchase_event_id: string | null
          shipping_cost: number | null
          status: string
          total_amount: number
          tracking_data: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          coupon_discount?: number | null
          courier_consignment_id?: string | null
          courier_id?: string | null
          courier_ratio_data?: Json | null
          courier_sent_at?: string | null
          courier_tracking_code?: string | null
          created_at?: string
          customer_address: string
          customer_city: string
          customer_ip?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          is_duplicate_blocked?: boolean | null
          notes?: string | null
          order_source?: string | null
          payment_method?: string
          purchase_event_id?: string | null
          shipping_cost?: number | null
          status?: string
          total_amount: number
          tracking_data?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          coupon_discount?: number | null
          courier_consignment_id?: string | null
          courier_id?: string | null
          courier_ratio_data?: Json | null
          courier_sent_at?: string | null
          courier_tracking_code?: string | null
          created_at?: string
          customer_address?: string
          customer_city?: string
          customer_ip?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          is_duplicate_blocked?: boolean | null
          notes?: string | null
          order_source?: string | null
          payment_method?: string
          purchase_event_id?: string | null
          shipping_cost?: number | null
          status?: string
          total_amount?: number
          tracking_data?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string | null
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          created_at: string
          group_name: string | null
          id: string
          image_url: string | null
          is_default: boolean | null
          price: number
          product_id: string
          sort_order: number | null
          stock: number | null
          variation_name: string
          variation_type: string
        }
        Insert: {
          created_at?: string
          group_name?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          price: number
          product_id: string
          sort_order?: number | null
          stock?: number | null
          variation_name: string
          variation_type?: string
        }
        Update: {
          created_at?: string
          group_name?: string | null
          id?: string
          image_url?: string | null
          is_default?: boolean | null
          price?: number
          product_id?: string
          sort_order?: number | null
          stock?: number | null
          variation_name?: string
          variation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          catalog_id: number | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          description_bn: string | null
          free_shipping: boolean | null
          has_variations: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          low_stock_threshold: number | null
          name: string
          name_bn: string
          original_price: number | null
          price: number
          rating: number | null
          review_images: string[] | null
          reviews_count: number | null
          shipping_inside_dhaka: number | null
          shipping_outside_dhaka: number | null
          short_description: string | null
          short_description_bn: string | null
          slug: string
          stock: number | null
          updated_at: string
          variation_type: string | null
          video_url: string | null
        }
        Insert: {
          catalog_id?: number | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          free_shipping?: boolean | null
          has_variations?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          name: string
          name_bn: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_images?: string[] | null
          reviews_count?: number | null
          shipping_inside_dhaka?: number | null
          shipping_outside_dhaka?: number | null
          short_description?: string | null
          short_description_bn?: string | null
          slug: string
          stock?: number | null
          updated_at?: string
          variation_type?: string | null
          video_url?: string | null
        }
        Update: {
          catalog_id?: number | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          free_shipping?: boolean | null
          has_variations?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          name_bn?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_images?: string[] | null
          reviews_count?: number | null
          shipping_inside_dhaka?: number | null
          shipping_outside_dhaka?: number | null
          short_description?: string | null
          short_description_bn?: string | null
          slug?: string
          stock?: number | null
          updated_at?: string
          variation_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          purchase_order_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_date: string
          received_date: string | null
          status: string
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          received_date?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          received_date?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_pages: {
        Row: {
          accent_color: string | null
          background_color: string | null
          button_color: string | null
          contact_availability: string | null
          contact_headline: string | null
          contact_phone: string | null
          contact_phone_link: string | null
          contact_subheadline: string | null
          contact_variant: string | null
          contact_whatsapp: string | null
          contact_whatsapp_text: string | null
          countdown_end_date: string | null
          countdown_label_days: string | null
          countdown_label_hours: string | null
          countdown_label_minutes: string | null
          countdown_label_seconds: string | null
          created_at: string
          cta_button_text: string | null
          cta_urgency_text: string | null
          discount_text: string | null
          extra_section_1_heading: string | null
          extra_section_1_point_1: string | null
          extra_section_1_point_2: string | null
          extra_section_1_point_3: string | null
          extra_section_1_point_4: string | null
          extra_section_1_point_5: string | null
          extra_section_1_point_6: string | null
          extra_section_1_points: Json | null
          extra_section_2_heading: string | null
          extra_section_2_point_1: string | null
          extra_section_2_point_2: string | null
          extra_section_2_point_3: string | null
          extra_section_2_point_4: string | null
          extra_section_2_point_5: string | null
          extra_section_2_point_6: string | null
          extra_section_2_points: Json | null
          extra_section_3_heading: string | null
          extra_section_3_point_1: string | null
          extra_section_3_point_2: string | null
          extra_section_3_point_3: string | null
          extra_section_3_point_4: string | null
          extra_section_3_point_5: string | null
          extra_section_3_point_6: string | null
          extra_section_3_points: Json | null
          feature_1_description: string | null
          feature_1_icon: string | null
          feature_1_text: string | null
          feature_2_description: string | null
          feature_2_icon: string | null
          feature_2_text: string | null
          feature_3_description: string | null
          feature_3_icon: string | null
          feature_3_text: string | null
          feature_4_description: string | null
          feature_4_icon: string | null
          feature_4_text: string | null
          feature_5_description: string | null
          feature_5_icon: string | null
          feature_5_text: string | null
          feature_6_description: string | null
          feature_6_icon: string | null
          feature_6_text: string | null
          feature_card_bg_color: string | null
          feature_icon_bg_color: string | null
          feature_points: Json | null
          feature_section_image: string | null
          feature_section_images: string[] | null
          feature_variant: string | null
          features_headline: string | null
          features_subheadline: string | null
          footer_text: string | null
          gallery_images: string[] | null
          gallery_product_prices: Json | null
          gallery_subtitle: string | null
          gallery_title: string | null
          gallery_variant: string | null
          headline_color: string | null
          hero_badge_text: string | null
          hero_headline: string
          hero_images: string[] | null
          hero_subheadline: string | null
          hero_variant: string | null
          hero_video_url: string | null
          id: string
          is_active: boolean | null
          offer_details: string | null
          offer_price: number
          original_price: number | null
          payment_method: string | null
          price_unit: string | null
          primary_color: string | null
          product_id: string | null
          review_images: string[] | null
          review_variant: string | null
          review_video_url: string | null
          reviews_headline: string | null
          reviews_subheadline: string | null
          section_order: string[] | null
          selected_variation_ids: string[] | null
          show_checkout_section: boolean | null
          show_contact_section: boolean | null
          show_countdown: boolean | null
          show_extra_section_1: boolean | null
          show_extra_section_2: boolean | null
          show_extra_section_3: boolean | null
          show_features_section: boolean | null
          show_gallery_section: boolean | null
          show_hero_section: boolean | null
          show_reviews_section: boolean | null
          show_spec_section: boolean | null
          show_variations: boolean | null
          show_video_section: boolean | null
          slug: string
          spec_items: Json | null
          spec_section_heading: string | null
          template_id: string | null
          template_styles: Json | null
          text_color: string | null
          title: string
          updated_at: string
          video_subtitle: string | null
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          button_color?: string | null
          contact_availability?: string | null
          contact_headline?: string | null
          contact_phone?: string | null
          contact_phone_link?: string | null
          contact_subheadline?: string | null
          contact_variant?: string | null
          contact_whatsapp?: string | null
          contact_whatsapp_text?: string | null
          countdown_end_date?: string | null
          countdown_label_days?: string | null
          countdown_label_hours?: string | null
          countdown_label_minutes?: string | null
          countdown_label_seconds?: string | null
          created_at?: string
          cta_button_text?: string | null
          cta_urgency_text?: string | null
          discount_text?: string | null
          extra_section_1_heading?: string | null
          extra_section_1_point_1?: string | null
          extra_section_1_point_2?: string | null
          extra_section_1_point_3?: string | null
          extra_section_1_point_4?: string | null
          extra_section_1_point_5?: string | null
          extra_section_1_point_6?: string | null
          extra_section_1_points?: Json | null
          extra_section_2_heading?: string | null
          extra_section_2_point_1?: string | null
          extra_section_2_point_2?: string | null
          extra_section_2_point_3?: string | null
          extra_section_2_point_4?: string | null
          extra_section_2_point_5?: string | null
          extra_section_2_point_6?: string | null
          extra_section_2_points?: Json | null
          extra_section_3_heading?: string | null
          extra_section_3_point_1?: string | null
          extra_section_3_point_2?: string | null
          extra_section_3_point_3?: string | null
          extra_section_3_point_4?: string | null
          extra_section_3_point_5?: string | null
          extra_section_3_point_6?: string | null
          extra_section_3_points?: Json | null
          feature_1_description?: string | null
          feature_1_icon?: string | null
          feature_1_text?: string | null
          feature_2_description?: string | null
          feature_2_icon?: string | null
          feature_2_text?: string | null
          feature_3_description?: string | null
          feature_3_icon?: string | null
          feature_3_text?: string | null
          feature_4_description?: string | null
          feature_4_icon?: string | null
          feature_4_text?: string | null
          feature_5_description?: string | null
          feature_5_icon?: string | null
          feature_5_text?: string | null
          feature_6_description?: string | null
          feature_6_icon?: string | null
          feature_6_text?: string | null
          feature_card_bg_color?: string | null
          feature_icon_bg_color?: string | null
          feature_points?: Json | null
          feature_section_image?: string | null
          feature_section_images?: string[] | null
          feature_variant?: string | null
          features_headline?: string | null
          features_subheadline?: string | null
          footer_text?: string | null
          gallery_images?: string[] | null
          gallery_product_prices?: Json | null
          gallery_subtitle?: string | null
          gallery_title?: string | null
          gallery_variant?: string | null
          headline_color?: string | null
          hero_badge_text?: string | null
          hero_headline: string
          hero_images?: string[] | null
          hero_subheadline?: string | null
          hero_variant?: string | null
          hero_video_url?: string | null
          id?: string
          is_active?: boolean | null
          offer_details?: string | null
          offer_price: number
          original_price?: number | null
          payment_method?: string | null
          price_unit?: string | null
          primary_color?: string | null
          product_id?: string | null
          review_images?: string[] | null
          review_variant?: string | null
          review_video_url?: string | null
          reviews_headline?: string | null
          reviews_subheadline?: string | null
          section_order?: string[] | null
          selected_variation_ids?: string[] | null
          show_checkout_section?: boolean | null
          show_contact_section?: boolean | null
          show_countdown?: boolean | null
          show_extra_section_1?: boolean | null
          show_extra_section_2?: boolean | null
          show_extra_section_3?: boolean | null
          show_features_section?: boolean | null
          show_gallery_section?: boolean | null
          show_hero_section?: boolean | null
          show_reviews_section?: boolean | null
          show_spec_section?: boolean | null
          show_variations?: boolean | null
          show_video_section?: boolean | null
          slug: string
          spec_items?: Json | null
          spec_section_heading?: string | null
          template_id?: string | null
          template_styles?: Json | null
          text_color?: string | null
          title: string
          updated_at?: string
          video_subtitle?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          button_color?: string | null
          contact_availability?: string | null
          contact_headline?: string | null
          contact_phone?: string | null
          contact_phone_link?: string | null
          contact_subheadline?: string | null
          contact_variant?: string | null
          contact_whatsapp?: string | null
          contact_whatsapp_text?: string | null
          countdown_end_date?: string | null
          countdown_label_days?: string | null
          countdown_label_hours?: string | null
          countdown_label_minutes?: string | null
          countdown_label_seconds?: string | null
          created_at?: string
          cta_button_text?: string | null
          cta_urgency_text?: string | null
          discount_text?: string | null
          extra_section_1_heading?: string | null
          extra_section_1_point_1?: string | null
          extra_section_1_point_2?: string | null
          extra_section_1_point_3?: string | null
          extra_section_1_point_4?: string | null
          extra_section_1_point_5?: string | null
          extra_section_1_point_6?: string | null
          extra_section_1_points?: Json | null
          extra_section_2_heading?: string | null
          extra_section_2_point_1?: string | null
          extra_section_2_point_2?: string | null
          extra_section_2_point_3?: string | null
          extra_section_2_point_4?: string | null
          extra_section_2_point_5?: string | null
          extra_section_2_point_6?: string | null
          extra_section_2_points?: Json | null
          extra_section_3_heading?: string | null
          extra_section_3_point_1?: string | null
          extra_section_3_point_2?: string | null
          extra_section_3_point_3?: string | null
          extra_section_3_point_4?: string | null
          extra_section_3_point_5?: string | null
          extra_section_3_point_6?: string | null
          extra_section_3_points?: Json | null
          feature_1_description?: string | null
          feature_1_icon?: string | null
          feature_1_text?: string | null
          feature_2_description?: string | null
          feature_2_icon?: string | null
          feature_2_text?: string | null
          feature_3_description?: string | null
          feature_3_icon?: string | null
          feature_3_text?: string | null
          feature_4_description?: string | null
          feature_4_icon?: string | null
          feature_4_text?: string | null
          feature_5_description?: string | null
          feature_5_icon?: string | null
          feature_5_text?: string | null
          feature_6_description?: string | null
          feature_6_icon?: string | null
          feature_6_text?: string | null
          feature_card_bg_color?: string | null
          feature_icon_bg_color?: string | null
          feature_points?: Json | null
          feature_section_image?: string | null
          feature_section_images?: string[] | null
          feature_variant?: string | null
          features_headline?: string | null
          features_subheadline?: string | null
          footer_text?: string | null
          gallery_images?: string[] | null
          gallery_product_prices?: Json | null
          gallery_subtitle?: string | null
          gallery_title?: string | null
          gallery_variant?: string | null
          headline_color?: string | null
          hero_badge_text?: string | null
          hero_headline?: string
          hero_images?: string[] | null
          hero_subheadline?: string | null
          hero_variant?: string | null
          hero_video_url?: string | null
          id?: string
          is_active?: boolean | null
          offer_details?: string | null
          offer_price?: number
          original_price?: number | null
          payment_method?: string | null
          price_unit?: string | null
          primary_color?: string | null
          product_id?: string | null
          review_images?: string[] | null
          review_variant?: string | null
          review_video_url?: string | null
          reviews_headline?: string | null
          reviews_subheadline?: string | null
          section_order?: string[] | null
          selected_variation_ids?: string[] | null
          show_checkout_section?: boolean | null
          show_contact_section?: boolean | null
          show_countdown?: boolean | null
          show_extra_section_1?: boolean | null
          show_extra_section_2?: boolean | null
          show_extra_section_3?: boolean | null
          show_features_section?: boolean | null
          show_gallery_section?: boolean | null
          show_hero_section?: boolean | null
          show_reviews_section?: boolean | null
          show_spec_section?: boolean | null
          show_variations?: boolean | null
          show_video_section?: boolean | null
          slug?: string
          spec_items?: Json | null
          spec_section_heading?: string | null
          template_id?: string | null
          template_styles?: Json | null
          text_color?: string | null
          title?: string
          updated_at?: string
          video_subtitle?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spin_entries: {
        Row: {
          coupon_code: string
          created_at: string
          customer_name: string
          customer_phone: string
          discount_type: string
          discount_value: number
          id: string
          is_used: boolean
          offer_id: string | null
          offer_text: string | null
          status: string
          used_order_id: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          customer_name: string
          customer_phone: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_used?: boolean
          offer_id?: string | null
          offer_text?: string | null
          status?: string
          used_order_id?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_used?: boolean
          offer_id?: string | null
          offer_text?: string | null
          status?: string
          used_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spin_entries_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "spin_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spin_entries_used_order_id_fkey"
            columns: ["used_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_offers: {
        Row: {
          color: string
          created_at: string
          discount_type: string
          discount_value: number
          icon: string | null
          id: string
          is_active: boolean
          offer_text: string
          probability: number
          sort_order: number
          text_color: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          offer_text: string
          probability?: number
          sort_order?: number
          text_color?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          offer_text?: string
          probability?: number
          sort_order?: number
          text_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_history: {
        Row: {
          change_type: string
          created_at: string
          created_by: string | null
          id: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity_change: number
          reference_id: string | null
          reference_type: string | null
          unit_cost: number | null
        }
        Insert: {
          change_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id: string
          quantity_change: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
        }
        Update: {
          change_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string
          quantity_change?: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          order_id: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_reviews_public: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string | null
          is_approved: boolean | null
          product_id: string | null
          rating: number | null
          review_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string | null
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string | null
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_add_order_item: { Args: { _order_id: string }; Returns: boolean }
      get_spin_coupon: {
        Args: { _code: string }
        Returns: {
          coupon_code: string
          discount_type: string
          discount_value: number
          offer_text: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_spin_coupon: {
        Args: { _code: string; _order_id: string }
        Returns: boolean
      }
      remove_abandoned_cart: {
        Args: { _customer_phone: string; _session_id: string }
        Returns: undefined
      }
      save_abandoned_cart: {
        Args: {
          _cart_data: Json
          _checkout_step?: string
          _customer_phone: string
          _session_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, never>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
