import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { Product } from "@/types";

interface ConfigurableProductSectionProps {
  sectionKey: string;
  defaultTitle: string;
  defaultCategorySlug?: string;
}

const ConfigurableProductSection = ({ 
  sectionKey, 
  defaultTitle,
  defaultCategorySlug 
}: ConfigurableProductSectionProps) => {
  // Fetch products based on category
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", sectionKey, defaultCategorySlug],
    queryFn: async () => {
      let query = api
        .from("products")
        .select("*, categories(*)")
        .order("created_at", { ascending: false })
        .limit(8);

      if (defaultCategorySlug) {
        const { data: category } = await api
          .from("categories")
          .select("id")
          .eq("slug", defaultCategorySlug)
          .single();

        if (category) {
          query = api
            .from("products")
            .select("*, categories(*)")
            .eq("category_id", category.id)
            .order("created_at", { ascending: false })
            .limit(8);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 
              className="text-xl md:text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}
            >
              {defaultTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-brand rounded-full" />
          </div>
          {defaultCategorySlug && (
            <Button 
              variant="outline" 
              className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
              asChild
            >
              <Link to={`/products?category=${defaultCategorySlug}`}>
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {defaultCategorySlug && (
          <div className="mt-6 text-center sm:hidden">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
              asChild
            >
              <Link to={`/products?category=${defaultCategorySlug}`}>
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConfigurableProductSection;
