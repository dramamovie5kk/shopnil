import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { data: allProducts = [] } = useProducts({});
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  const wishlistProducts = allProducts.filter((p) =>
    wishlistItems.some((w) => w.product_id === p.id)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pb-20 lg:pb-0">
          <div className="text-center space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-bold">
              {language === "en" ? "Please login to view your wishlist" : "উইশলিস্ট দেখতে লগইন করুন"}
            </h1>
            <Button asChild>
              <Link to="/login">
                {language === "en" ? "Login" : "লগইন"}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-destructive" />
            {language === "en" ? "My Wishlist" : "আমার উইশলিস্ট"}
            {wishlistProducts.length > 0 && (
              <span className="text-muted-foreground text-base font-normal">
                ({wishlistProducts.length})
              </span>
            )}
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {language === "en" ? "Your wishlist is empty" : "আপনার উইশলিস্ট খালি"}
              </p>
              <Button asChild variant="outline">
                <Link to="/products">
                  {language === "en" ? "Browse Products" : "প্রোডাক্ট দেখুন"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistProducts.map((product) => {
                const displayName = language === "en" ? (product.name || product.name_bn) : product.name_bn;
                const discount = product.original_price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

                return (
                  <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <Link to={`/product/${product.slug}`} className="block">
                      <div className="aspect-square overflow-hidden bg-secondary/50">
                        {product.image_url?.startsWith("http") ? (
                          <img
                            src={product.image_url}
                            alt={displayName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {product.image_url || "📦"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3 space-y-2">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                          {displayName}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ৳{product.original_price}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary">৳{product.price}</span>
                        {discount > 0 && (
                          <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          {language === "en" ? "Add to Cart" : "কার্টে যোগ"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromWishlist(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
