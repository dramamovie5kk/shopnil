import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";

export type BlogSectionType = "text" | "image" | "video" | "product" | "button" | "gallery";

export interface SectionStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  textAlign?: string;
  padding?: string;
  borderRadius?: string;
  // button specific
  buttonColor?: string;
  buttonBgColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: string;
  buttonBorderRadius?: string;
  buttonFontSize?: string;
  buttonPadding?: string;
  // image specific
  imageRadius?: string;
  maxHeight?: string;
}

export interface BlogSection {
  id: string;
  type: BlogSectionType;
  content?: string;
  image_url?: string;
  video_url?: string;
  product_id?: string;
  button_text?: string;
  button_link?: string;
  images?: string[];
  heading?: string;
  style?: SectionStyle;
}

export interface BlogPost {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  content: string | null;
  content_bn: string | null;
  featured_image: string | null;
  images: string[];
  video_url: string | null;
  product_id: string | null;
  button_text: string | null;
  button_link: string | null;
  is_published: boolean;
  sections: BlogSection[];
  created_at: string;
  updated_at: string;
  products?: { name: string; name_bn: string; image_url: string | null; slug: string } | null;
}

export const uploadBlogImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await api.storage.from("blog-images").upload(fileName, file);
  if (error) throw error;
  const { data } = api.storage.from("blog-images").getPublicUrl(fileName);
  return data.publicUrl;
};

export const useBlogs = () => {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await api
        .from("blog_posts" as any)
        .select("*, products(name, name_bn, image_url, slug)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BlogPost[];
    },
  });
};

export const useAdminBlogs = () => {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await api
        .from("blog_posts" as any)
        .select("*, products(name, name_bn, image_url, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BlogPost[];
    },
  });
};

export const useBlogMutations = () => {
  const queryClient = useQueryClient();

  const createBlog = useMutation({
    mutationFn: async (blog: Partial<BlogPost>) => {
      const { data, error } = await api
        .from("blog_posts" as any)
        .insert(blog as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });

  const updateBlog = useMutation({
    mutationFn: async ({ id, ...blog }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await api
        .from("blog_posts" as any)
        .update(blog as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from("blog_posts" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });

  return { createBlog, updateBlog, deleteBlog };
};
