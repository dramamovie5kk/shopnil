import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await api
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await api
        .from("wishlist")
        .insert({
          product_id: productId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast.success("উইশলিস্টে যোগ হয়েছে!");
    },
    onError: () => {
      toast.error("উইশলিস্টে যোগ করতে সমস্যা হয়েছে");
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await api
        .from("wishlist")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
    },
    onError: () => {
      toast.error("উইশলিস্ট থেকে সরাতে সমস্যা হয়েছে");
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast.error("উইশলিস্ট ব্যবহার করতে লগইন করুন");
      return;
    }

    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
  };
};
