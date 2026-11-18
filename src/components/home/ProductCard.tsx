import { imageVariant, imageSrcSet } from "@/lib/responsiveImage";
import { useState, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariation } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";
import { groupVariations, isSelectionComplete, selectionPrice } from "@/lib/variationGroups";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { data: variations = [] } = useProductVariations(product.has_variations ? product.id : null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const [showVariations, setShowVariations] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);
  const [pendingAction, setPendingAction] = useState<'cart' | 'order'>('cart');

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const displayName = language === 'en' ? (product.name || product.name_bn) : product.name_bn;
  const categoryName = language === 'en' 
    ? (product.categories?.name || product.categories?.name_bn)
    : (product.categories?.name_bn || product.categories?.name);
  const isWishlisted = isInWishlist(product.id);

  const VARIATION_TYPE_LABELS: Record<string, string> = {
    size: t('card.select_size'),
    color: t('card.select_color'),
    pack: t('card.select_pack'),
    custom: t('card.select_option'),
  };

  const groups = groupVariations(variations);
  const selectionComplete = isSelectionComplete(groups, selectedVariations);
  const selectedIds = new Set(selectedVariations.map((v) => v.id));

  const handleAddToCart = useCallback(() => {
    if (product.has_variations && variations.length > 0) {
      setPendingAction('cart');
      setShowVariations(true);
      setSelectedVariations([]);
    } else {
      addToCart(product);
    }
  }, [product, variations, addToCart]);

  const handleOrderNow = useCallback(() => {
    if (product.has_variations && variations.length > 0) {
      setPendingAction('order');
      setShowVariations(true);
      setSelectedVariations([]);
    } else {
      addToCart(product, 1, undefined, true);
      navigate('/checkout');
    }
  }, [product, variations, addToCart, navigate]);

  const handleVariationSelect = useCallback((groupKey: string, variation: ProductVariation) => {
    setSelectedVariations((prev) => {
      const group = groups.find((g) => g.key === groupKey);
      if (!group) return prev;
      const groupOptionIds = new Set(group.options.map((o) => o.id));
      return [...prev.filter((v) => !groupOptionIds.has(v.id)), variation];
    });
  }, [groups]);

  const handleConfirmAddToCart = useCallback(() => {
    if (selectionComplete && selectedVariations.length > 0) {
      addToCart(product, 1, undefined, pendingAction === 'order', selectedVariations);
      setShowVariations(false);
      setSelectedVariations([]);
      if (pendingAction === 'order') {
        navigate('/checkout');
      }
    }
  }, [selectionComplete, selectedVariations, addToCart, product, pendingAction, navigate]);

  const handleCloseVariations = useCallback(() => {
    setShowVariations(false);
    setSelectedVariations([]);
  }, []);

  const handleWishlistClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }, [toggleWishlist, product.id]);

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
        {product.is_new && (
          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{t('card.new')}</Badge>
        )}
        {discount > 0 && (
          <Badge className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">-{discount}%</Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleWishlistClick}
        className={cn(
          "absolute top-2 right-2 z-10 h-7 w-7 backdrop-blur-sm transition-all",
          isWishlisted 
            ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
            : "bg-card/80 hover:bg-card hover:text-destructive"
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-current")} />
      </Button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50">
          {product.image_url?.startsWith('http') ? (
            <img 
              src={imageVariant(product.image_url,384)}
              srcSet={imageSrcSet(product.image_url)}
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
              decoding="async"
              alt={displayName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl">
              {product.image_url || "📦"}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="mb-auto">
          <h3 className="font-medium text-foreground text-[17px] sm:text-[19px] line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {displayName}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 mt-1.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-bold text-foreground">৳{product.price}</span>
            {product.original_price && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ৳{product.original_price}
              </span>
            )}
          </div>
          {(product.rating > 0 || product.reviews_count > 0) && (
            <div className="flex items-center gap-0.5 shrink-0 text-xs sm:text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{Number(product.rating || 0).toFixed(1)}</span>
              <span>({product.reviews_count || 0})</span>
            </div>
          )}
        </div>

        {/* Variation Selector */}
        {showVariations && variations.length > 0 && (
          <div className="space-y-2 pt-1 mt-1.5 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {groups.length > 1 ? t('card.select_option') : (VARIATION_TYPE_LABELS[product.variation_type || 'custom'])}
              </span>
              <button
                onClick={handleCloseVariations}
                className="p-0.5 hover:bg-secondary rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            {groups.map((group) => (
              <div key={group.key || "legacy"} className="space-y-1">
                {groups.length > 1 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {group.key || VARIATION_TYPE_LABELS[group.type] || VARIATION_TYPE_LABELS.custom}
                  </span>
                )}
                <div className="flex flex-wrap gap-1">
                  {group.options.map((variation) => (
                    <button
                      key={variation.id}
                      onClick={() => handleVariationSelect(group.key, variation)}
                      className={cn(
                        "px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-all border",
                        selectedIds.has(variation.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 border-border hover:border-primary/50"
                      )}
                    >
                      {variation.variation_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {selectionComplete && selectedVariations.length > 0 && (
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground bg-secondary/30 p-1.5 rounded">
                <span>৳{selectionPrice(selectedVariations, product.price)}</span>
                <span>{t('product.stock')}: {Math.min(...selectedVariations.map((v) => v.stock ?? 0))}</span>
              </div>
            )}
            <Button
              className="w-full h-7 sm:h-8 text-[10px] sm:text-xs font-medium bg-gradient-brand hover:opacity-90"
              onClick={handleConfirmAddToCart}
              disabled={!selectionComplete}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              <span className="truncate">{t('card.confirm')}</span>
            </Button>
          </div>
        )}

        {/* Add to Cart Button */}
        {!showVariations && (
          <div className="flex items-stretch gap-1.5 mt-2">
            <Button
              className="flex-1 h-9 sm:h-10 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
              onClick={handleOrderNow}
            >
              <span className="truncate">{t('card.add_to_cart')}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddToCart}
              className="h-9 sm:h-10 w-9 sm:w-10 shrink-0 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 rounded-md"
              aria-label={t('card.add_to_cart')}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
