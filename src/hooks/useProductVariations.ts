 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { api } from "@/integrations/cloudflare/client";
 import { ProductVariation } from "@/types";
 
 export const useProductVariations = (productId: string | null) => {
   return useQuery({
     queryKey: ["productVariations", productId],
     staleTime: 3 * 60 * 1000,
     queryFn: async () => {
       if (!productId) return [];
       
       const { data, error } = await api
         .from("product_variations")
         .select("*")
         .eq("product_id", productId)
         .order("sort_order", { ascending: true });
 
       if (error) throw error;
       return data as ProductVariation[];
     },
     enabled: !!productId,
   });
 };
 
 export interface VariationOptionInput {
   variation_name: string;
   price: number;
   stock: number | null;
   is_default: boolean;
   image_url?: string | null;
 }
 
 export interface VariationGroupInput {
   /** Group label, e.g. "কালার" / "সাইজ". Empty for the legacy single group. */
   group_name: string;
   variation_type: string;
   options: VariationOptionInput[];
 }
 
 export const useSaveVariations = () => {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({
       productId,
       groups,
     }: {
       productId: string;
       groups: VariationGroupInput[];
     }) => {
       // Delete existing variations
       const { error: deleteError } = await api
         .from("product_variations")
         .delete()
         .eq("product_id", productId);
 
       if (deleteError) throw deleteError;
 
       const activeGroups = groups.filter((g) => g.options.length > 0);
       // A single unnamed group stays legacy-compatible (group_name NULL).
       const singleGroup = activeGroups.length === 1 && !activeGroups[0].group_name.trim();
 
       const rows = activeGroups.flatMap((group, groupIndex) =>
         group.options.map((option, optionIndex) => ({
           product_id: productId,
           variation_type: group.variation_type,
           variation_name: option.variation_name,
           price: option.price,
           stock: option.stock || 0,
           sort_order: groupIndex * 1000 + optionIndex,
           is_default: option.is_default || optionIndex === 0,
           image_url: option.image_url || null,
           group_name: singleGroup ? null : group.group_name.trim() || `গ্রুপ ${groupIndex + 1}`,
         }))
       );
 
       if (rows.length > 0) {
         const { error: insertError } = await api
           .from("product_variations")
           .insert(rows);
 
         if (insertError) throw insertError;
       }
 
       // Update product has_variations flag
       const { error: updateError } = await api
         .from("products")
         .update({
           has_variations: rows.length > 0,
           variation_type: rows.length > 0 ? activeGroups[0].variation_type : null,
         })
         .eq("id", productId);
 
       if (updateError) throw updateError;
 
       return true;
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ["productVariations", variables.productId] });
       queryClient.invalidateQueries({ queryKey: ["products"] });
       queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
     },
   });
 };
