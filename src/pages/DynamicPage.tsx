import { useParams } from "react-router-dom";
import { usePage } from "@/hooks/usePages";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";
import NotFound from "./NotFound";
import DOMPurify from "dompurify";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = usePage(slug || "");

  if (!isLoading && (error || !page)) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="max-w-[1240px] mx-auto px-4 py-10 pb-24 lg:pb-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : page ? (
            <>
              {page.meta_description && (
                <meta name="description" content={page.meta_description} />
              )}
              {/* Page Content */}
              <article className="bg-card rounded-lg shadow-sm border p-6 md:p-8">
                <h1 className="text-2xl font-bold text-foreground mb-5">{page.title}</h1>
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content, { USE_PROFILES: { html: true } }) }}
                  className="page-content whitespace-pre-line leading-relaxed text-card-foreground
                    [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-8 [&>h2]:text-foreground [&>h2]:border-b [&>h2]:border-border [&>h2]:pb-2
                    [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-6 [&>h3]:text-foreground
                    [&>p]:text-muted-foreground [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-[15px]
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:text-muted-foreground [&>ul>li]:mb-1.5
                    [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol>li]:text-muted-foreground [&>ol>li]:mb-1.5
                    [&>strong]:text-foreground [&>a]:text-primary [&>a]:underline [&>a:hover]:text-primary/80
                    [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:bg-muted/50 [&>blockquote]:rounded-r-md
                    [&>table]:w-full [&>table]:border-collapse [&>table_th]:border [&>table_th]:border-border [&>table_th]:p-2 [&>table_th]:bg-muted [&>table_td]:border [&>table_td]:border-border [&>table_td]:p-2"
                />
              </article>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
