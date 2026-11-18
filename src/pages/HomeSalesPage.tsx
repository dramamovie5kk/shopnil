import { homeSectionEnabled, homeColor } from "@/lib/homePageSettings";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/integrations/cloudflare/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomeBanner from "@/components/home/HomeBanner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DefaultHome = () => {
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["home-sales-pages-grid"],
    queryFn: async () => {
      const { data, error } = await api
        .from("sales_pages")
        .select("id, slug, title, hero_images, offer_price, original_price, products(image_url, price)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
  const { getSetting } = useSiteSettings();
  const title = getSetting("home_products_title", "আমাদের প্রোডাক্ট").trim() || "আমাদের প্রোডাক্ট";
  const subtitle = getSetting("home_products_subtitle", "").trim();
  const buttonText = getSetting("home_products_button_text", "বিস্তারিত দেখুন").trim() || "বিস্তারিত দেখুন";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeBanner />
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-1.5 md:px-4 pb-16 lg:pb-8">
        {homeSectionEnabled(getSetting("home_products_enabled","true")) && <section style={{backgroundColor:homeColor(getSetting("home_products_bg_color"))}} className="pt-8">

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
              <span className="h-2 w-2 rotate-45 bg-primary" />
              <h2 style={{color:homeColor(getSetting("home_products_title_color"))}} className="text-xl md:text-3xl font-bold text-foreground whitespace-nowrap">{title}</h2>
              <span className="h-2 w-2 rotate-45 bg-primary" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
            </div>
            {subtitle && <p className="mt-2 text-sm md:text-base text-muted-foreground">{subtitle}</p>}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : pages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">কোনো প্রোডাক্ট নেই</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {pages.map((p) => {
                const img = p.hero_images?.[0] || p.products?.image_url || "/placeholder.svg";
                const price = Number(p.offer_price) || Number(p.products?.price) || 0;
                const old = Number(p.original_price) || 0;
                return (
                  <article key={p.id} className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-md transition-[border-color,box-shadow] flex flex-col min-w-0">
                    <Link to={`/lp/${p.slug}`} aria-label={p.title} className="block aspect-square overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                      <img src={img} alt={p.title} loading="lazy" className="w-full h-full object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform duration-300" />
                    </Link>
                    <div className="p-3 md:p-4 flex flex-col gap-3 flex-1">
                      <h3 className="text-base md:text-lg font-bold tracking-tight min-h-12 flex items-start text-card-foreground break-words"><Link to={`/lp/${p.slug}`} className="line-clamp-2 leading-snug hover:text-primary transition-colors">{p.title}</Link></h3>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-auto">
                        {price > 0 && <span className="text-primary text-lg md:text-xl font-bold">৳{price}</span>}
                        {old > price && <span className="text-xs text-muted-foreground line-through">৳{old}</span>}
                      </div>
                      <Button style={{backgroundColor:homeColor(getSetting("home_products_button_bg_color")),color:homeColor(getSetting("home_products_button_text_color"))}} asChild className="w-full h-auto min-h-10 px-2 py-2 text-sm font-semibold gap-1.5">
                        <Link to={`/lp/${p.slug}`}><span className="min-w-0 whitespace-normal break-words text-center">{buttonText}</span><ArrowRight className="h-4 w-4 shrink-0" /></Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>}
      </main>
      <Footer />
    </div>
  );
};

export default DefaultHome;
