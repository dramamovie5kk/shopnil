import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || "";
  const { data: products = [], isLoading } = useProducts({ categorySlug, compact: true });
  const { data: categories = [] } = useCategories();
  const { t, language } = useLanguage();

  const PRICE_RANGES = [
    { id: "all", label: t('products.all_prices'), min: 0, max: Infinity },
    { id: "0-500", label: t('products.price_0_500'), min: 0, max: 500 },
    { id: "500-1000", label: t('products.price_500_1000'), min: 500, max: 1000 },
    { id: "1000+", label: t('products.price_1000_plus'), min: 1000, max: Infinity },
  ];

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [priceRange, setPriceRange] = useState("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name_bn.includes(searchQuery)
      );
    }
    const selectedRange = PRICE_RANGES.find(r => r.id === priceRange);
    if (selectedRange && priceRange !== "all") {
      result = result.filter(
        (p) => p.price >= selectedRange.min && p.price < selectedRange.max
      );
    }
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFilteredProducts(result);
  }, [products, searchQuery, priceRange, language]);

  const handleCategoryChange = (slug: string) => {
    if (slug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
    setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    searchParams.delete("category");
    searchParams.delete("search");
    setSearchParams(searchParams);
    setPriceRange("all");
    setMobileFilterOpen(false);
  };

  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const hasActiveFilters = categorySlug || priceRange !== "all" || searchQuery;

  const getCatDisplayName = (cat: any) => language === 'en' ? (cat.name || cat.name_bn) : cat.name_bn;

  const FilterSidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <h3 className="font-bold text-foreground mb-4 text-lg">{t('products.filter')}</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-3">{t('products.category')}</h4>
        <RadioGroup 
          value={categorySlug || "all"} 
          onValueChange={handleCategoryChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="text-sm cursor-pointer">{t('products.all_categories')}</Label>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} />
              <Label htmlFor={`cat-${cat.slug}`} className="text-sm cursor-pointer">
                {getCatDisplayName(cat)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-3">{t('products.price_range')}</h4>
        <RadioGroup 
          value={priceRange} 
          onValueChange={setPriceRange}
          className="space-y-2"
        >
          {PRICE_RANGES.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <RadioGroupItem value={range.id} id={`price-${range.id}`} />
              <Label htmlFor={`price-${range.id}`} className="text-sm cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-2" />
          {t('products.clear_filter')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="bg-gradient-brand py-6 md:py-10">
          <div className="container max-w-[1240px] mx-auto px-4 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground mb-1">
              {selectedCategory ? getCatDisplayName(selectedCategory) : t('products.all_products')}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {filteredProducts.length} {t('products.products_found')}
            </p>
          </div>
        </div>

        <section className="py-6 md:py-8">
          <div className="container max-w-[1240px] mx-auto px-4">
            <div className="flex gap-6">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-4">
                  <FilterSidebar />
                </div>
              </aside>

              <div className="flex-1">
                <div className="lg:hidden mb-4">
                  <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Filter className="h-4 w-4 mr-2" />
                        {t('products.filter')}
                        {hasActiveFilters && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {t('products.filter_active')}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0">
                      <SheetHeader className="p-4 border-b">
                        <SheetTitle>{t('products.filter')}</SheetTitle>
                      </SheetHeader>
                      <div className="p-4">
                        <FilterSidebar className="border-0 p-0" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categorySlug && selectedCategory && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {getCatDisplayName(selectedCategory)}
                        <button onClick={() => handleCategoryChange("all")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {priceRange !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {PRICE_RANGES.find(r => r.id === priceRange)?.label}
                        <button onClick={() => setPriceRange("all")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        "{searchQuery}"
                        <button onClick={() => {
                          searchParams.delete("search");
                          setSearchParams(searchParams);
                        }}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-xl text-muted-foreground mb-4">{t('products.no_products')}</p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={handleClearFilters}>
                        {t('products.clear_filter')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
