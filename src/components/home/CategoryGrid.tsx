import { imageVariant, imageSrcSet } from "@/lib/responsiveImage";
import { homeSectionEnabled, homeColor } from "@/lib/homePageSettings";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useProducts";
import { useRef, useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const CategoryGrid = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { getSetting } = useSiteSettings();
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const dbTitle = getSetting("category_section_title", "");
  const sectionTitle = language === 'en' ? t('section.top_categories') : (dbTitle || t('section.top_categories'));
  const titleColor = getSetting("category_section_title_color", "");
  const buttonText = getSetting("category_section_button_text", "");
  const buttonTextColor = getSetting("category_section_button_text_color", "");
  const buttonBgColor = getSetting("category_section_button_bg_color", "");
  const categoryEnabled = homeSectionEnabled(getSetting('category_section_enabled','true'));
  const seeAllLabel = language === 'en' ? 'See All' : (buttonText || 'সব দেখুন');

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -containerRef.current.clientWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth / 2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.clientWidth / 3;
      const page = Math.round(scrollLeft / itemWidth);
      setCurrentPage(Math.floor(page / 3));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [categoryEnabled, categories.length]);

  const totalPages = Math.ceil(categories.length / 3);

  if (!categoryEnabled) return null;

  if (isLoading) {
    return (
      <section className="py-6 bg-background">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section data-home-categories style={{backgroundColor:homeColor(getSetting("category_section_bg_color"))}} className="py-4 mt-5 mb-0 bg-background w-[calc(100vw-40px)] left-1/2 -translate-x-1/2 relative">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-block w-1 h-6 md:h-7 rounded-full bg-primary" />
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate"
              style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif", ...(titleColor ? { color: titleColor } : {}) }}
            >
              {sectionTitle}
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-primary text-[11px] font-medium border border-primary/30 hover:opacity-90 transition-all duration-200 group/btn"
            style={{
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              ...(buttonTextColor ? { color: buttonTextColor, borderColor: buttonTextColor } : {}),
              ...(buttonBgColor ? { backgroundColor: buttonBgColor } : {}),
            }}
          >
            <span>{seeAllLabel}</span>
            <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="relative group">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer border border-border"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer border border-border"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div
            ref={containerRef}
            className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((category) => {
              const catName = language === 'en' ? (category.name || category.name_bn) : category.name_bn;
              return (
                <div
                  key={category.id}
                  className="flex-shrink-0 snap-start w-[calc((100%-24px)/3)] md:w-[calc((100%-72px)/7)]"
                >
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="flex flex-col gap-2 cursor-pointer group/item"
                  >
                    <div style={{borderColor:homeColor(getSetting("category_card_border_color")),borderWidth:homeSectionEnabled(getSetting("category_section_border","true"))?undefined:0,backgroundColor:homeColor(getSetting("category_card_bg_color"))}} className="aspect-square rounded-xl overflow-hidden category-card-border p-1.5 group-hover/item:p-0 transition-all duration-300">
                      <div style={{backgroundColor:homeColor(getSetting("category_card_bg_color"))}} className="w-full h-full rounded-lg overflow-hidden bg-secondary">
                        {category.image_url ? (
                          <img
                            src={imageVariant(category.image_url,384)} decoding="async"
                            alt={catName}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div style={{background:homeColor(getSetting("category_card_bg_color"))}} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="text-4xl md:text-5xl">
                              {category.icon || "📦"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p style={{color:homeColor(getSetting("category_text_color"))}} className="font-semibold text-foreground text-[11px] sm:text-sm leading-tight px-1 line-clamp-2 text-center">
                      {catName}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentPage ? "bg-foreground" : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
