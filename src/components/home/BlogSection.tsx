import { useBlogs } from "@/hooks/useBlogs";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const BlogSection = () => {
  const { data: blogs, isLoading } = useBlogs();

  if (isLoading || !blogs || blogs.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="flex justify-center items-center mb-6">
        <h2
          className="text-xl md:text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}
        >
          📝 ব্লগ পোস্ট
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {blogs.slice(0, 6).map((blog) => (
          <Link
            key={blog.id}
            to={`/blog/${blog.slug}`}
            className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {blog.featured_image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(blog.created_at), "dd MMM yyyy", { locale: bn })}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {blog.title_bn || blog.title}
              </h3>
              {blog.content_bn || blog.content ? (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {(blog.content_bn || blog.content || "").replace(/<[^>]*>/g, "").slice(0, 120)}
                </p>
              ) : null}
              <div className="flex items-center gap-1 text-primary text-xs font-medium mt-3">
                <span>বিস্তারিত পড়ুন</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
