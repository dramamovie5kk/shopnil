import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { SalesPage, FeaturePoint, SpecItem } from "@/types/salesPage";
import { toast } from "sonner";

// Helper to safely parse JSONB arrays from database
const parseJsonArray = <T>(value: unknown, defaultValue: T[]): T[] => {
  if (Array.isArray(value)) return value as T[];
  return defaultValue;
};

export const useSalesPages = () => {
  return useQuery({
    queryKey: ["sales-pages"],
    queryFn: async () => {
      const { data, error } = await api
        .from("sales_pages")
        .select("*, products(id, name, name_bn, price, image_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        feature_points: parseJsonArray<FeaturePoint>(item.feature_points, []),
        extra_section_1_points: parseJsonArray<string>(item.extra_section_1_points, []),
        extra_section_2_points: parseJsonArray<string>(item.extra_section_2_points, []),
        extra_section_3_points: parseJsonArray<string>(item.extra_section_3_points, []),
        spec_items: parseJsonArray<SpecItem>(item.spec_items, []),
        gallery_product_prices: parseJsonArray<number>(item.gallery_product_prices, []),
      })) as SalesPage[];
    },
  });
};

export const useSalesPage = (slug: string) => {
  return useQuery({
    queryKey: ["sales-page", slug],
    queryFn: async () => {
      const { data, error } = await api
        .from("sales_pages")
        .select("*, products(id, name, name_bn, price, original_price, image_url, shipping_inside_dhaka, shipping_outside_dhaka, free_shipping, has_variations, variation_type)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      // Add defaults for new fields
      const result = {
        ...data,
        template_id: data.template_id ?? 'elegant-dark',
        show_video_section: data.show_video_section ?? true,
        video_url: data.video_url ?? null,
        video_title: data.video_title ?? 'প্রোডাক্ট ভিডিও',
        video_subtitle: data.video_subtitle ?? 'এখানে দেখুন প্রোডাক্টের বিস্তারিত',
        payment_method: data.payment_method ?? 'cod',
        hero_variant: data.hero_variant ?? '01',
        gallery_variant: data.gallery_variant ?? '01',
        feature_variant: data.feature_variant ?? '01',
        review_variant: data.review_variant ?? '01',
        contact_variant: data.contact_variant ?? '01',
        // Extra sections defaults
        show_extra_section_1: data.show_extra_section_1 ?? false,
        extra_section_1_heading: data.extra_section_1_heading ?? 'কেন আমাদের উপর আস্থা রাখবেন?',
        extra_section_1_point_1: data.extra_section_1_point_1 ?? '',
        extra_section_1_point_2: data.extra_section_1_point_2 ?? '',
        extra_section_1_point_3: data.extra_section_1_point_3 ?? '',
        extra_section_1_point_4: data.extra_section_1_point_4 ?? '',
        extra_section_1_point_5: data.extra_section_1_point_5 ?? '',
        extra_section_1_point_6: data.extra_section_1_point_6 ?? '',
        show_extra_section_2: data.show_extra_section_2 ?? false,
        extra_section_2_heading: data.extra_section_2_heading ?? 'আমাদের বিশেষত্ব',
        extra_section_2_point_1: data.extra_section_2_point_1 ?? '',
        extra_section_2_point_2: data.extra_section_2_point_2 ?? '',
        extra_section_2_point_3: data.extra_section_2_point_3 ?? '',
        extra_section_2_point_4: data.extra_section_2_point_4 ?? '',
        extra_section_2_point_5: data.extra_section_2_point_5 ?? '',
        extra_section_2_point_6: data.extra_section_2_point_6 ?? '',
        show_extra_section_3: data.show_extra_section_3 ?? false,
        extra_section_3_heading: data.extra_section_3_heading ?? 'গ্রাহক সুবিধা',
        extra_section_3_point_1: data.extra_section_3_point_1 ?? '',
        extra_section_3_point_2: data.extra_section_3_point_2 ?? '',
        extra_section_3_point_3: data.extra_section_3_point_3 ?? '',
        extra_section_3_point_4: data.extra_section_3_point_4 ?? '',
        extra_section_3_point_5: data.extra_section_3_point_5 ?? '',
        extra_section_3_point_6: data.extra_section_3_point_6 ?? '',
        section_order: data.section_order ?? ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'],
        // JSONB arrays
        feature_points: parseJsonArray<FeaturePoint>(data.feature_points, []),
        extra_section_1_points: parseJsonArray<string>(data.extra_section_1_points, []),
        extra_section_2_points: parseJsonArray<string>(data.extra_section_2_points, []),
        extra_section_3_points: parseJsonArray<string>(data.extra_section_3_points, []),
        spec_items: parseJsonArray<SpecItem>(data.spec_items, []),
        gallery_product_prices: parseJsonArray<number>(data.gallery_product_prices, []),
        // Spec section defaults
        show_spec_section: data.show_spec_section ?? false,
        spec_section_heading: data.spec_section_heading ?? 'টেকনিক্যাল স্পেসিফিকেশন',
        template_styles: (data as any).template_styles ?? {},
      };
      return result as SalesPage;
    },
    enabled: !!slug,
  });
};

export const useCreateSalesPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salesPage: Omit<Partial<SalesPage>, 'products'>) => {
      const { data, error } = await api
        .from("sales_pages")
        .insert(salesPage as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-pages"] });
      toast.success("সেলস পেজ তৈরি হয়েছে!");
    },
    onError: (error: any) => {
      toast.error(error.message || "সেলস পেজ তৈরি করতে সমস্যা হয়েছে");
    },
  });
};

export const useUpdateSalesPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalesPage> & { id: string }) => {
      // Remove products from updates as it's a joined field
      const { products, ...cleanUpdates } = updates as any;
      const { data, error } = await api
        .from("sales_pages")
        .update(cleanUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-pages"] });
      toast.success("সেলস পেজ আপডেট হয়েছে!");
    },
    onError: (error: any) => {
      toast.error(error.message || "আপডেট করতে সমস্যা হয়েছে");
    },
  });
};

export const useDeleteSalesPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from("sales_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-pages"] });
      toast.success("সেলস পেজ ডিলিট হয়েছে!");
    },
    onError: (error: any) => {
      toast.error(error.message || "ডিলিট করতে সমস্যা হয়েছে");
    },
  });
};
