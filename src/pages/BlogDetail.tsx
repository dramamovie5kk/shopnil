import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { BlogPost, BlogSection } from "@/hooks/useBlogs";

const FONT_FAMILY = "'Baloo Da Digits', 'Hind Siliguri', sans-serif";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await api
        .from("blog_posts" as any)
        .select("*, products(name, name_bn, image_url, slug, price, original_price)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as unknown as BlogPost & {
        products?: { name: string; name_bn: string; image_url: string | null; slug: string; price: number; original_price: number | null } | null;
      };
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" style={{ fontFamily: FONT_FAMILY }}>ব্লগ পোস্ট পাওয়া যায়নি</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sections: BlogSection[] = blog.sections || [];

  const renderSection = (section: BlogSection, index: number) => {
    const s = section.style || {};

    switch (section.type) {
      case "text":
        return (
          <div key={section.id || index} className="mb-6" style={{
            color: s.color || undefined,
            backgroundColor: s.backgroundColor || undefined,
            fontSize: s.fontSize || undefined,
            textAlign: (s.textAlign as any) || undefined,
            padding: s.padding || undefined,
            borderRadius: s.borderRadius || undefined,
            fontFamily: FONT_FAMILY,
          }}>
            {section.heading && (
              <h2 className="text-xl font-bold mb-3" style={{ fontFamily: FONT_FAMILY, color: s.color || undefined }}>
                {section.heading}
              </h2>
            )}
            {section.content && (
              <div className="prose prose-sm max-w-none" style={{ fontFamily: FONT_FAMILY }} dangerouslySetInnerHTML={{ __html: section.content }} />
            )}
          </div>
        );

      case "image":
        return section.image_url ? (
          <div key={section.id || index} className="mb-6">
            <img
              src={section.image_url}
              alt=""
              className="w-full object-cover"
              style={{
                borderRadius: s.imageRadius || "12px",
                maxHeight: s.maxHeight || undefined,
              }}
              loading="lazy"
            />
          </div>
        ) : null;

      case "gallery":
        return section.images && section.images.length > 0 ? (
          <div key={section.id || index} className="grid grid-cols-2 gap-3 mb-6">
            {section.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full object-cover"
                style={{ borderRadius: s.imageRadius || "8px" }}
                loading="lazy"
              />
            ))}
          </div>
        ) : null;

      case "video":
        return section.video_url ? (
          <div key={section.id || index} className="aspect-video mb-6 rounded-xl overflow-hidden">
            <iframe
              src={section.video_url.replace("watch?v=", "embed/")}
              className="w-full h-full"
              allowFullScreen
              title="Video"
            />
          </div>
        ) : null;

      case "product": {
        // Try to find product from blog.products if matching
        const product = blog.products;
        if (!product || !section.product_id) return null;
        return (
          <div key={section.id || index} className="bg-card border rounded-xl p-4 flex items-center gap-4 mb-6">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <p className="font-bold text-foreground" style={{ fontFamily: FONT_FAMILY }}>
                {product.name_bn || product.name}
              </p>
            </div>
            <Link to={`/product/${product.slug}`}>
              <Button size="sm">দেখুন</Button>
            </Link>
          </div>
        );
      }

      case "button":
        return section.button_text && section.button_link ? (
          <div key={section.id || index} className="text-center mb-6">
            <Link to={section.button_link}>
              <button
                style={{
                  backgroundColor: s.buttonBgColor || "hsl(var(--primary))",
                  color: s.buttonColor || "#ffffff",
                  border: `${s.buttonBorderWidth || "0px"} solid ${s.buttonBorderColor || "transparent"}`,
                  borderRadius: s.buttonBorderRadius || "8px",
                  fontSize: s.buttonFontSize || "16px",
                  padding: s.buttonPadding || "10px 20px",
                  fontFamily: FONT_FAMILY,
                  cursor: "pointer",
                  display: "inline-block",
                  fontWeight: 600,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {section.button_text}
              </button>
            </Link>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 py-8">
        {blog.featured_image && (
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full rounded-xl mb-6 object-cover max-h-[400px]"
          />
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span style={{ fontFamily: FONT_FAMILY }}>
            {format(new Date(blog.created_at), "dd MMMM yyyy", { locale: bn })}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: FONT_FAMILY }}>
          {blog.title_bn || blog.title}
        </h1>

        {/* Render Dynamic Sections */}
        {sections.map((section, i) => renderSection(section, i))}
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
