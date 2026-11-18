import ReviewSection from "@/components/product/ReviewSection";
import type { CSSProperties } from 'react';
import { productEnabled, productColor, productNumber, safeProductLink } from '@/lib/productPageSettings';
import { useRelatedProducts } from '@/hooks/useRelatedProducts';
import ProductPageSections from '@/components/product/ProductPageSections';
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Phone, ChevronDown, ChevronUp, Loader2, Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductMedia from "@/components/product/ProductMedia";
import VariationSelector from "@/components/product/VariationSelector";
import { useProduct } from "@/hooks/useProducts";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/home/ProductCard";
import { usePixelTracking } from "@/hooks/usePixelTracking";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductVariation } from "@/types";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart } from "lucide-react";
import { cn, getWhatsAppUrl } from "@/lib/utils";
import { groupVariations, defaultSelection, selectionPrice, selectionLabel } from "@/lib/variationGroups";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: relatedProducts = [] } = useRelatedProducts(product?.id);
  const { data: variations = [] } = useProductVariations(product?.id || null);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { trackViewItem, trackAddToCart } = usePixelTracking();
  const { getSetting } = useSiteSettings();
  const enabled = (key: string) => productEnabled(getSetting(key,'true'));
  const pageStyle = Object.fromEntries([
    ['product_page_bg','--pd-page-bg'],['product_page_card_bg','--pd-card-bg'],['product_page_heading_color','--pd-heading'],['product_page_text_color','--pd-text'],['product_page_price_color','--pd-price'],['product_page_border_color','--pd-border'],['product_page_short_bg','--pd-short-bg'],['product_page_short_color','--pd-short-text'],['product_page_accent','--pd-accent'],['product_details_bg','--pd-details-bg'],['product_details_heading_color','--pd-details-heading'],['product_details_text_color','--pd-details-text'],['product_social_bg','--pd-social-bg'],['product_social_color','--pd-social-text'],['product_related_bg','--pd-related-bg'],
  ].flatMap(([key,variable])=>{const color=productColor(getSetting(key));return color?[[variable,color]]:[]})) as CSSProperties;
  Object.assign(pageStyle,{'--pd-title-mobile':`${productNumber(getSetting('product_page_title_mobile','21'),16,32,21)}px`,'--pd-title-desktop':`${productNumber(getSetting('product_page_title_desktop','28'),18,40,28)}px`,'--pd-copy-mobile':`${productNumber(getSetting('product_page_copy_mobile','14'),12,22,14)}px`,'--pd-copy-desktop':`${productNumber(getSetting('product_page_copy_desktop','16'),12,24,16)}px`,'--pd-button-radius':`${productNumber(getSetting('product_page_button_radius','10'),0,40,10)}px`});
  const openConfigured = (key: string, allowTel = false) => {
    const link=safeProductLink(getSetting(key),allowTel);if(!link)return false;
    if(link.startsWith('/'))navigate(link);else window.location.assign(link);return true;
  };
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);
  const { t, language } = useLanguage();
  
  const productCallPhone = getSetting("product_call_phone", "");
  const contactPhone = productCallPhone || getSetting("footer_phone", "০১৭XX-XXXXXX");
  const productWhatsappPhone = getSetting("product_whatsapp_phone", "");
  const whatsappNumber = productWhatsappPhone || getSetting("whatsapp_number", "");
  
  // Product Page Button Settings - use t() when English, DB setting when Bengali
  const addToCartBg = getSetting("product_addtocart_bg", "");
  
  const addToCartText = getSetting("product_addtocart_text", "");
  const dbAddToCartLabel = getSetting("product_addtocart_label", "");
  const addToCartLabel = language === 'en' ? t('product.add_to_cart') : (dbAddToCartLabel || t('product.add_to_cart'));
  const orderBg = getSetting("product_order_bg", "");
  const orderText = getSetting("product_order_text", "");
  const dbOrderLabel = getSetting("product_order_label", "");
  const orderLabel = language === 'en' ? t('product.order_now') : (dbOrderLabel || t('product.order_now'));
  const whatsappBorder = getSetting("product_whatsapp_border", "#16a34a");
  const whatsappTextColor = getSetting("product_whatsapp_text", "#16a34a");
  const dbWhatsappLabel = getSetting("product_whatsapp_label", "");
  const whatsappLabel = language === 'en' ? t('product.whatsapp_order') : (dbWhatsappLabel || t('product.whatsapp_order'));
  const whatsappBg = getSetting("product_whatsapp_bg", "transparent");
  const callBorder = getSetting("product_call_border", "#213c8d");
  const callTextColor = getSetting("product_call_text", "#ffffff");
  const callBg = getSetting("product_call_bg", "");

  // Check if product has variations
  const hasVariations = product?.has_variations && variations.length > 0;
  
  useEffect(() => { setQuantity(1); setSelectedVariations([]); }, [product?.id]);

  // Set default variations when variations load
  useEffect(() => {
    if (hasVariations && selectedVariations.length === 0) {
      setSelectedVariations(defaultSelection(groupVariations(variations)));
    }
  }, [variations, hasVariations, selectedVariations]);

  // Get current price based on selected variations
  const currentPrice = selectedVariations.length > 0
    ? selectionPrice(selectedVariations, product?.price ?? 0)
    : (product?.price ?? 0);
  const originalPrice = product?.original_price;

  // Track view_item when product loads
  useEffect(() => {
    if (product) {
      trackViewItem({
        product_id: product.id,
        product_name: product.name_bn,
        price: product.price,
        original_price: product.original_price,
        quantity: 1,
        category: product.categories?.name || product.category_id || undefined,
        image_url: product.image_url || undefined,
        stock: product.stock,
        stock_status: product.stock > 0 ? 'instock' : 'outofstock',
      }, product.name_bn);
    }
  }, [product, trackViewItem]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pb-20 lg:pb-0">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pb-20 lg:pb-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('product.not_found')}</h1>
            <Button asChild>
              <Link to="/products">{t('product.view_all')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (hasVariations && selectedVariations.length === 0) {
      toast.error(t('product.select_option'));
      return;
    }
    addToCart(product, quantity, undefined, !!safeProductLink(getSetting('product_addtocart_link')), selectedVariations.length > 0 ? selectedVariations : undefined);
    trackAddToCart({
      product_id: product.id,
      product_name: product.name_bn,
      price: currentPrice,
      original_price: originalPrice,
      quantity: quantity,
      category: product.category_id || undefined,
    }, product.name_bn);
    openConfigured('product_addtocart_link');
  };

  const handleOrderNow = () => {
    if (hasVariations && selectedVariations.length === 0) {
      toast.error(t('product.select_option'));
      return;
    }
    // Skip drawer opening for direct checkout
    addToCart(product, quantity, undefined, true, selectedVariations.length > 0 ? selectedVariations : undefined);
    trackAddToCart({
      product_id: product.id,
      product_name: product.name_bn,
      price: currentPrice,
      original_price: originalPrice,
      quantity: quantity,
      category: product.category_id || undefined,
    }, product.name_bn);
    if(!openConfigured('product_order_link'))navigate("/checkout");
  };

  const handleCall = () => {
    if(openConfigured('product_call_link',true))return;
    const phoneClean = contactPhone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${phoneClean}`;
  };

  const handleWhatsApp = () => {
    if(openConfigured('product_whatsapp_link'))return;
    const waInput = whatsappNumber || contactPhone;
    const productName = language === 'en' ? (product.name || product.name_bn) : product.name_bn;
    const variationText = selectedVariations.length > 0 ? `\n🎨 ${selectionLabel(selectedVariations)}` : '';
    const totalPrice = currentPrice * quantity;
    const message = language === 'en' 
      ? `🛒 *Order Request*\n\n📦 Product: *${productName}*${variationText}\n💰 Price: ৳${currentPrice.toLocaleString()}\n🔢 Quantity: ${quantity}\n💵 Total: ৳${totalPrice.toLocaleString()}\n\nI want to order this product.`
      : `🛒 *অর্ডার করতে চাই*\n\n📦 পণ্য: *${productName}*${variationText}\n💰 মূল্য: ৳${currentPrice.toLocaleString()}\n🔢 পরিমাণ: ${quantity}\n💵 মোট: ৳${totalPrice.toLocaleString()}\n\nআমি এই পণ্যটি অর্ডার করতে চাই।`;
    const template=getSetting('product_whatsapp_message');
    const values:Record<string,string>={name:productName,price:String(currentPrice),quantity:String(quantity),total:String(totalPrice),url:window.location.href};
    const text=template?template.replace(/\{(name|price|quantity|total|url)\}/g,(_,key:string)=>values[key]):message;
    window.open(getWhatsAppUrl(waInput, text), '_blank', 'noopener,noreferrer');
  };

  return (
    <div data-product-page style={pageStyle} className="min-h-screen flex flex-col">
      {enabled('product_page_header_enabled') && <Header />}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Breadcrumb */}
        <div className="bg-secondary/30 py-2">
          <div className="container px-2 md:px-4 lg:px-8">
            <nav className="text-xs md:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link to="/" className="hover:text-primary">{t('product.home')}</Link>
              <span className="mx-1 md:mx-2">/</span>
              <Link to="/products" className="hover:text-primary">{t('product.product')}</Link>
              <span className="mx-1 md:mx-2">/</span>
              <span className="text-foreground">{language === 'en' ? (product.name || product.name_bn) : product.name_bn}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="pt-[2px] pb-4 md:py-6" style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
          <div className="container px-2 md:px-4 lg:px-8" style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
            <div data-product-summary data-gallery-visible={enabled('product_page_gallery_enabled')} className="grid gap-6 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:grid-cols-2 md:p-5 lg:gap-10 lg:p-6">
              {/* Product Media - Image, Gallery then Video */}
              {enabled('product_page_gallery_enabled') && <ProductMedia
                key={product.id}
                imageUrl={selectedVariations.find((v) => v.image_url)?.image_url || product.image_url}
                videoUrl={product.video_url}
                images={product.images}
                isNew={product.is_new}
                discount={discount}
                showVideoFirst={false}
              />}

              {/* Product Info */}
              <div data-product-copy className="min-w-0 space-y-4 text-[#101820]">
                {/* Product Name */}
                <div className="flex items-start justify-between gap-2">
                  <h1 data-product-heading className="text-xl lg:text-[23px] font-medium text-black leading-snug break-words flex-1">
                    {language === 'en' ? (product.name || product.name_bn) : product.name_bn}
                  </h1>
                  {enabled('product_page_wishlist_enabled') && <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWishlist(product.id)}
                    className={cn(
                      "shrink-0 h-9 w-9 rounded-full transition-all",
                      isInWishlist(product.id)
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-secondary hover:bg-secondary/80 hover:text-destructive"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
                  </Button>}
                </div>

                {/* Price */}
                <div data-product-price-row className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  {originalPrice && originalPrice > currentPrice && (
                    <span data-product-original-price className="text-lg md:text-xl text-foreground/60 line-through font-medium">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span data-product-price className="text-2xl font-semibold text-[#f58220]">
                    ৳{currentPrice.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {discount > 0 && (
                    <Badge data-product-discount className="bg-destructive text-destructive-foreground text-sm font-bold">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Short Description */}
                {enabled('product_page_short_enabled') && (language === 'en' ? (product.short_description || product.short_description_bn) : (product.short_description_bn || product.short_description)) && (
                  <div data-product-short-description className="text-sm md:text-base text-black whitespace-pre-line break-words leading-relaxed">
                    {language === 'en' ? (product.short_description || product.short_description_bn) : (product.short_description_bn || product.short_description)}
                  </div>
                )}

                {/* Variation Selector */}
                {hasVariations && (
                  <VariationSelector
                    variations={variations}
                    variationType={product.variation_type || "custom"}
                    selected={selectedVariations}
                    onSelect={setSelectedVariations}
                    basePrice={product.price}
                  />
                )}

                {/* Quantity Selector */}
                <div data-product-quantity className="flex items-center gap-6 border-t border-gray-100 pt-4">
                  <span className="text-sm">{language === 'en' ? 'Quantity:' : 'পরিমাণ:'}</span>
                  <div className="inline-flex items-center border rounded-md">
                    <button
                      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label="পরিমাণ কমান"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                    <button
                      className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label="পরিমাণ বাড়ান"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div data-product-purchase-buttons className="grid grid-cols-2 gap-2">
                {/* Add to Cart */}
                {enabled('product_addtocart_enabled') && <button
                  className="w-full h-10 px-3 text-xs sm:text-sm font-semibold gap-2 rounded-md inline-flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50 border-2"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    backgroundColor: addToCartBg || '#f58220',
                    color: addToCartText || '#ffffff',
                    borderColor: addToCartBg || '#f58220',
                  }}
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="truncate">{addToCartLabel}</span>
                </button>}

                {/* Buy now */}
                {enabled('product_order_enabled') && <button
                  className="w-full h-10 px-3 text-xs sm:text-sm font-semibold gap-2 rounded-md inline-flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleOrderNow}
                  disabled={product.stock === 0}
                  style={{
                    backgroundColor: orderBg || '#062c26',
                    color: orderText || '#ffffff',
                  }}
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="truncate">{orderLabel}</span>
                </button>}

                </div>

                {/* WhatsApp & Call - Side by Side */}
                <div data-product-contact-buttons className="grid grid-cols-2 gap-2">
                  {enabled('product_whatsapp_enabled') && <button
                    className="w-full flex items-center justify-center gap-2 h-10 text-xs sm:text-sm font-semibold rounded-md border transition-colors"
                    onClick={handleWhatsApp}
                    style={{
                      borderColor: whatsappBorder,
                      color: whatsappBg && whatsappBg !== 'transparent' ? whatsappTextColor : '#ffffff',
                      backgroundColor: whatsappBg && whatsappBg !== 'transparent' ? whatsappBg : '#16a34a',
                    }}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="truncate">{whatsappLabel}</span>
                  </button>}
                  {enabled('product_call_enabled') && <button
                    className="w-full flex items-center justify-center gap-2 h-10 text-xs sm:text-sm font-semibold rounded-md border transition-colors"
                    onClick={handleCall}
                    style={{
                      borderColor: callBorder || '#213c8d',
                      color: callTextColor || '#ffffff',
                      backgroundColor: callBg || '#213c8d',
                    }}
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="truncate">{getSetting('product_call_label',language === 'en' ? 'Call For Order' : 'ফোনে অর্ডার করুন')}</span>
                  </button>}
                </div>


              </div>
            </div>
            <ProductPageSections product={product} />
          </div>
        </section>

        {/* Related Products */}
        {enabled('product_related_enabled') && relatedProducts.length>0 && <section data-product-related className="py-8 md:py-12 bg-secondary/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">{getSetting('product_related_title',t('product.related_products'))}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>}

        {/* Customer Review Images - bottom of product page, above footer */}
        {enabled('product_reviews_enabled') && (product as any).review_images && (product as any).review_images.length > 0 && (
          <section className="py-8 md:py-10">
            <div className="container">
              <div className="flex flex-row items-center justify-between mb-5 gap-3 flex-wrap">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold whitespace-nowrap">কাস্টমার রিভিউ</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">আমাদের সন্তুষ্ট কাস্টমারদের মতামত</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-9 px-3 text-xs md:text-sm shrink-0">
                      <Star className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      আপনার রিভিউ দিন
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>আপনার রিভিউ দিন</DialogTitle>
                    </DialogHeader>
                    <ReviewSection
                      productId={product.id}
                      productName={product.name_bn}
                      totalReviews={product.reviews_count}
                      averageRating={product.rating}
                      embedded
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Carousel opts={{ align: "start", loop: false }} className="relative">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {((product as any).review_images as string[]).map((url, idx) => (
                    <CarouselItem
                      key={idx}
                      className="pl-2 md:pl-4 basis-1/2 sm:basis-[45%] md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="rounded-xl md:rounded-2xl border border-emerald-200 bg-emerald-50/40 p-2 md:p-3 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-2 gap-1">
                          <div className="inline-flex items-center gap-0.5 md:gap-1 bg-white border border-emerald-200 text-emerald-700 text-[9px] md:text-[11px] font-medium px-1.5 md:px-2 py-0.5 rounded-full">
                            <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            Verified
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg md:rounded-xl overflow-hidden bg-white aspect-[4/5]">
                          <img
                            src={url}
                            alt={`Customer review ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </Carousel>
            </div>
          </section>
        )}
      </main>
      {enabled('product_page_footer_enabled') && <Footer />}
    </div>
  );
};

export default ProductDetail;
