import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const usePages = () => {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await api
        .from("pages" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as PageData[];
    },
  });
};

export const usePage = (slug: string) => {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await api
        .from("pages" as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as unknown as PageData;
    },
    enabled: !!slug,
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (page: Partial<PageData>) => {
      const { data, error } = await api
        .from("pages" as any)
        .insert(page as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("পেজ তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["page"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "পেজ তৈরি করতে সমস্যা হয়েছে");
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PageData> & { id: string }) => {
      const { data, error } = await api
        .from("pages" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("পেজ আপডেট হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["page"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "আপডেট করতে সমস্যা হয়েছে");
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from("pages" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("পেজ ডিলিট হয়েছে!");
    },
    onError: (error: any) => {
      toast.error(error.message || "ডিলিট করতে সমস্যা হয়েছে");
    },
  });
};
