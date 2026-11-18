import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { Product, Category } from "@/types";

export const useProducts = (options?: { featured?: boolean; limit?: number; categorySlug?: string; compact?: boolean }) => {
  return useQuery({
    queryKey: ["products", options],
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      let query = api
        .from("products")
        .select(options?.compact ? "id,name,name_bn,price,original_price,image_url,category_id,stock,rating,reviews_count,is_featured,is_new,slug,created_at,updated_at,shipping_inside_dhaka,shipping_outside_dhaka,free_shipping,has_variations,variation_type,categories(*)" : "*, categories(*)");

      if (options?.featured) {
        query = query.eq("is_featured", true);
      }

      if (options?.categorySlug) {
        const { data: category } = await api
          .from("categories")
          .select("id")
          .eq("slug", options.categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await api
        .from("products")
        .select("*, categories(*)")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await api
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });
};
