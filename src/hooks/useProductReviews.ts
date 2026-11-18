import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { ProductReview } from "@/types";

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      // Get approved reviews via public view (excludes customer_phone)
      const { data: approvedReviews, error: approvedError } = await api
        .from("product_reviews_public")
        .select("id, product_id, user_id, customer_name, rating, review_text, is_approved, created_at, updated_at")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (approvedError) throw approvedError;

      // Get current user's pending reviews
      const { data: { user } } = await api.auth.getUser();
      let userPendingReviews: any[] = [];
      
      if (user) {
        const { data: pendingReviews, error: pendingError } = await api
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("user_id", user.id)
          .eq("is_approved", false);
        
        if (!pendingError && pendingReviews) {
          userPendingReviews = pendingReviews;
        }
      }

      // Combine and deduplicate
      const allReviews = [...approvedReviews];
      userPendingReviews.forEach(pending => {
        if (!allReviews.find(r => r.id === pending.id)) {
          allReviews.push(pending);
        }
      });

      return allReviews as ProductReview[];
    },
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: string;
      customer_name: string;
      customer_phone?: string;
      rating: number;
      review_text?: string;
    }) => {
      const { data: { user } } = await api.auth.getUser();
      
      const { data: review, error } = await api
        .from("product_reviews")
        .insert({
          ...data,
          user_id: user?.id || null,
          is_approved: false,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
    },
  });
};

// Admin hooks
export const useAdminReviews = () => {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await api
        .from("product_reviews")
        .select(`
          *,
          products:product_id (name_bn, slug)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await api
        .from("product_reviews")
        .update({ is_approved: true })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await api
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
};
