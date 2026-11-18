import SectionAppearance from '../SectionAppearance';
import ExtraSection from '../ExtraSection';
import { isExtraDesign } from '@/lib/extraSectionDesigns';
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
 import { motion } from "framer-motion";
 import { useState, useEffect, useRef } from "react";
import { getWhatsAppUrl } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import { SalesPage } from "@/types/salesPage";
 import { 
   ArrowRight, 
    Check,
    CheckCircle,
    Phone, 
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Shield,
    Star,
    Sparkles,
    Truck,
    Gift,
    Palette,
    Scissors,
    Users,
    Clock,
    Package,
    Zap
 } from "lucide-react";
 import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import SharedContactSection from "../ContactSection";
import SharedReviewsSection from "../SharedReviewsSection";
import SharedGallerySection from "../SharedGallerySection";
import SharedFeaturesSection from "../SharedFeaturesSection";
 import { usePixelTracking } from "@/hooks/usePixelTracking";
 
 // Review Carousel Component - 2 columns sliding  
 const ReviewCarousel = ({ images }: { images: string[] }) => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const imagesPerSlide = 2;
   const totalSlides = Math.ceil(images.length / imagesPerSlide);
 
   useEffect(() => {
     if (totalSlides <= 1) return;
     const interval = setInterval(() => {
       setCurrentIndex((prev) => (prev + 1) % totalSlides);
     }, 3000);
     return () => clearInterval(interval);
   }, [totalSlides]);
 
   const slides: string[][] = [];
   for (let i = 0; i < images.length; i += imagesPerSlide) {
     slides.push(images.slice(i, i + imagesPerSlide));
   }
 
   return (
     <div className="relative">
       <div className="overflow-hidden rounded-xl">
         <motion.div
           className="flex"
           animate={{ x: `-${currentIndex * 100}%` }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
         >
           {renderSalesText(slides.map((slideImages, slideIndex) => (
             <div key={slideIndex} className="w-full flex-shrink-0">
               <div className="grid grid-cols-2 gap-2">
                 {renderSalesText(slideImages.map((img, imgIndex) => (
                   <div key={imgIndex} className="rounded-xl overflow-hidden border border-purple-400/20">
                     <img src={img} alt={salesPlainText(`Review ${slideIndex * imagesPerSlide + imgIndex + 1}`)} className="w-full h-auto object-cover" />
                   </div>
                 )))}
               </div>
             </div>
           )))}
         </motion.div>
       </div>
       {renderSalesText(totalSlides > 1 && (
         <div className="flex justify-center gap-2 mt-4">
           {renderSalesText(slides.map((_, i) => (
             <button
               key={i}
               onClick={() => setCurrentIndex(i)}
               className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex ? "bg-pink-400 w-6" : "bg-pink-400/30"}`}
             />
           )))}
         </div>
       ))}
     </div>
   );
 };
 
 // Gallery Carousel with Thumbnails
 const GalleryCarousel = ({ images, productName }: { images: string[]; productName?: string }) => {
   const [currentIndex, setCurrentIndex] = useState(0);
 
   return (
     <div className="space-y-3">
       <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-pink-100 to-purple-100">
         <motion.img
           key={currentIndex}
           src={images[currentIndex]}
           alt={salesPlainText(`Product ${currentIndex + 1}`)}
           className="w-full aspect-square object-cover"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.3 }}
         />
         <button
           onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
           className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
         >
           <ChevronLeft className="w-6 h-6 text-purple-700" />
         </button>
         <button
           onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
           className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
         >
           <ChevronRight className="w-6 h-6 text-purple-700" />
         </button>
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
           <p className="text-white text-sm font-medium">{renderSalesText(currentIndex + 1)}/{renderSalesText(images.length)}</p>
         </div>
       </div>
       <div className="flex gap-2 overflow-x-auto pb-2">
         {renderSalesText(images.map((img, i) => (
           <button
             key={i}
             onClick={() => setCurrentIndex(i)}
             className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
               i === currentIndex ? "border-pink-500 ring-2 ring-pink-500/30" : "border-purple-200 hover:border-purple-400"
             }`}
           >
             <img src={img} alt={salesPlainText(`Thumb ${i + 1}`)} className="w-full h-full object-cover" />
           </button>
         )))}
       </div>
     </div>
   );
 };
 
 interface TemplateProps {
   page: SalesPage;
 }
 
 const DEFAULT_ORDER = ['hero', 'pricing', 'gallery', 'features', 'contact', 'reviews', 'extra1', 'extra2', 'extra3', 'checkout'];
 
 const Template03Fashion = ({ page }: TemplateProps) => {
   const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
   const hasTrackedCheckoutView = useRef(false);
 
   const scrollToCheckout = () => {
     document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
   };
 
   const product = page.products;
   const productPrice = product?.price || page.offer_price || 0;
   const productOriginalPrice = product?.original_price || null;
   const discountPercentage = productOriginalPrice && productOriginalPrice > productPrice 
     ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
     : 0;
 
   useEffect(() => {
     const productData = {
       product_id: product?.id,
       product_name: product?.name_bn || product?.name || page.title,
       price: productPrice,
       original_price: productOriginalPrice,
       quantity: 1,
       category: "Sales Page - Fashion",
     };
     trackPageView(page.title, productData);
     trackAddToCart(productData, page.title);
   }, [page.title, product, productPrice, productOriginalPrice, trackPageView, trackAddToCart]);
 
   useEffect(() => {
     const observer = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting && !hasTrackedCheckoutView.current) {
             hasTrackedCheckoutView.current = true;
              trackInitiateCheckout([{
                product_id: product?.id,
                product_name: product?.name_bn || product?.name || page.title,
                price: productPrice,
                original_price: productOriginalPrice,
                quantity: 1,
              }], page.title);
           }
         });
       },
       { threshold: 0.3 }
     );
     const checkoutElement = document.getElementById("checkout");
     if (checkoutElement) observer.observe(checkoutElement);
     return () => { if (checkoutElement) observer.unobserve(checkoutElement); };
   }, [page.title, product, productPrice, productOriginalPrice, trackInitiateCheckout]);
 
   const features = (page.feature_points && page.feature_points.length > 0) 
     ? page.feature_points 
     : [
         { text: page.feature_1_text, description: page.feature_1_description, icon: page.feature_1_icon },
         { text: page.feature_2_text, description: page.feature_2_description, icon: page.feature_2_icon },
         { text: page.feature_3_text, description: page.feature_3_description, icon: page.feature_3_icon },
         { text: page.feature_4_text, description: page.feature_4_description, icon: page.feature_4_icon },
         { text: page.feature_5_text, description: page.feature_5_description, icon: page.feature_5_icon },
         { text: page.feature_6_text, description: page.feature_6_description, icon: page.feature_6_icon },
       ].filter(f => f.text);
 
   const sectionOrder = page.section_order?.length > 0 ? page.section_order : DEFAULT_ORDER;
 
   const getFeatureIcon = (iconName: string, index: number) => {
     const iconMap: Record<string, React.ReactNode> = {
       palette: <Palette className="w-5 h-5" />,
       scissors: <Scissors className="w-5 h-5" />,
       users: <Users className="w-5 h-5" />,
       truck: <Truck className="w-5 h-5" />,
       shield: <Shield className="w-5 h-5" />,
       star: <Star className="w-5 h-5" />,
       gift: <Gift className="w-5 h-5" />,
       clock: <Clock className="w-5 h-5" />,
       package: <Package className="w-5 h-5" />,
     };
     const defaultIcons = [<Palette className="w-5 h-5" />, <Sparkles className="w-5 h-5" />, <Check className="w-5 h-5" />, <Users className="w-5 h-5" />, <Truck className="w-5 h-5" />, <Clock className="w-5 h-5" />];
     return iconMap[iconName?.toLowerCase()] || defaultIcons[index % defaultIcons.length];
   };
 
   // ===== HERO SECTION - Purple gradient with 2x2 product grid =====
   const renderHero = () => {
     if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;
     return (
       <section key="hero" className="relative overflow-hidden bg-gradient-to-b from-[#4c1d95] via-[#5b21b6] to-[#6d28d9] py-10 px-4">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto text-center">
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-400/40">
               <Sparkles className="w-4 h-4" />
               {renderSalesText(page.hero_badge_text || "সীমিত সময়ের অফার")}
             </span>
           </motion.div>
 
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mb-2">
             <h1 className="text-3xl md:text-4xl font-black text-white">
               মাত্র {renderSalesText(page.price_unit)}{renderSalesText(productPrice)} টাকায়
             </h1>
           </motion.div>
 
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-purple-200 mb-2">
             {renderSalesText(page.hero_subheadline || "৩ সেট প্রিমিয়াম থ্রি-পিস")}
           </motion.p>
           
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-sm text-purple-300/80 mb-6">
             {renderSalesText(page.hero_headline)}
           </motion.p>
 
           {/* 2x2 Product Grid with CTA buttons */}
           {renderSalesText(page.hero_images?.length > 0 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3 mb-6">
               {renderSalesText(page.hero_images.slice(0, 4).map((img, i) => (
                 <div key={i} className="relative rounded-xl overflow-hidden shadow-xl">
                   <img src={img} alt={salesPlainText(`Product ${i + 1}`)} className="w-full aspect-[3/4] object-cover" />
                   <button
                     onClick={scrollToCheckout}
                     className="absolute bottom-2 left-2 right-2 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-1"
                   >
                     <Zap className="w-4 h-4" /> অর্ডার করুন
                   </button>
                 </div>
               )))}
             </motion.div>
           ))}
 
           <p className="text-sm text-purple-300/70 flex items-center justify-center gap-2">
             <ArrowRight className="w-4 h-4 animate-bounce" />
             নিচে স্ক্রল করে আরো দেখুন
           </p>
         </div>
       </section>
     );
   };
 
   // ===== PRICING SECTION - Light pink gradient with discount badge =====
   const renderPricing = () => {
     if (!page.show_hero_section) return null;
     return (
       <section key="pricing" className="py-8 px-4 bg-gradient-to-b from-pink-50 via-purple-50 to-white">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           {/* Discount Badge */}
           {renderSalesText(discountPercentage > 0 && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center mb-4">
               <span className="inline-block px-5 py-2 rounded-full text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg">
                 {renderSalesText(discountPercentage)}% ছাড়
               </span>
               {renderSalesText(productOriginalPrice && (
                 <p className="text-gray-400 line-through mt-2">পূর্বের মূল্য: {renderSalesText(page.price_unit)}{renderSalesText(productOriginalPrice)}</p>
               ))}
             </motion.div>
           ))}
 
           <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-purple-600 font-medium mb-4">
             আজকের অফার মূল্য
           </motion.p>
 
           {/* Feature Cards */}
           <div className="space-y-3 mb-6">
             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
               <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                 <Truck className="w-5 h-5 text-purple-600" />
               </div>
               <span className="font-semibold text-gray-700">সারা বাংলাদেশে ডেলিভারি</span>
             </motion.div>
             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
               <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                 <Clock className="w-5 h-5 text-purple-600" />
               </div>
               <span className="font-semibold text-gray-700">ক্যাশ অন ডেলিভারি</span>
             </motion.div>
             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
               <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                 <Package className="w-5 h-5 text-purple-600" />
               </div>
               <span className="font-semibold text-gray-700">স্টক সীমিত</span>
             </motion.div>
           </div>
 
           <Button size="lg" onClick={scrollToCheckout} className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xl">
             {renderSalesText(page.cta_button_text || "অর্ডার করুন")}
           </Button>
         </div>
       </section>
     );
   };
 
   // ===== GALLERY SECTION - Light pink with carousel =====
   const renderGallery = () => {
     if (!page.show_gallery_section || !page.gallery_images?.length) return null;
      if (page.template_styles?.gallery?.design) return <SharedGallerySection key="gallery" page={page} onOrderClick={scrollToCheckout} />;
     return (
       <section key="gallery" className="py-8 px-4 bg-gradient-to-b from-white via-pink-50 to-purple-50">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5">
             <h2 className="text-2xl font-bold text-gray-800 mb-1">{renderSalesText(page.gallery_title || "আমাদের কালেকশন")}</h2>
             <p className="text-sm text-purple-500">{renderSalesText(page.gallery_subtitle || "যেমন দেখছেন তেমনই পাবেন")}</p>
           </motion.div>
           <GalleryCarousel images={page.gallery_images} productName={product?.name_bn} />
           <Button size="lg" onClick={scrollToCheckout} className="w-full h-12 mt-5 text-base font-bold rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xl">
             অর্ডার করতে ক্লিক করুন
           </Button>
         </div>
       </section>
     );
   };
 
   // ===== FEATURES SECTION - Dark purple with 2x3 grid =====
   const renderFeatures = () => {
     if (!page.show_features_section || !features.length) return null;
     return (
       <section key="features" className="py-8 px-4 bg-gradient-to-b from-[#4c1d95] to-[#5b21b6]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
             <h2 className="text-2xl font-bold text-white mb-1">{renderSalesText(page.features_headline || "কি কি থাকছে")}</h2>
             <p className="text-purple-300 text-sm">{renderSalesText(page.features_subheadline || "আমাদের বিশেষত্ব")}</p>
           </motion.div>
           <div className="grid grid-cols-2 gap-3">
             {renderSalesText(features.slice(0, 6).map((feature, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.08 }}
                 className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20"
               >
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                   i === 0 ? "bg-gradient-to-br from-pink-500 to-rose-500" : "bg-gradient-to-br from-purple-500 to-violet-600"
                 } shadow-lg text-white`}>
                   {renderSalesText(getFeatureIcon(feature.icon || '', i))}
                 </div>
                 <h3 className="font-bold text-white text-sm mb-1">{renderSalesText(feature.text)}</h3>
                 {renderSalesText(feature.description && <p className="text-xs text-purple-300/70 leading-relaxed">{renderSalesText(feature.description)}</p>)}
               </motion.div>
             )))}
           </div>
         </div>
       </section>
     );
   };
 
   const renderContact = () => page.show_contact_section ? <SharedContactSection key="contact" page={page} /> : null;

   const renderReviews = () => {
     if (!page.show_reviews_section || !page.review_images?.length) return null;
     return (
       <section key="reviews" className="py-8 px-4 bg-gradient-to-b from-[#4c1d95] to-[#5b21b6] overflow-hidden">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5">
             <h2 className="text-xl font-bold text-white mb-1">{renderSalesText(page.reviews_headline || "কাস্টমার ফিডব্যাক")}</h2>
             <p className="text-sm text-purple-300/60">{renderSalesText(page.reviews_subheadline)}</p>
           </motion.div>
           <ReviewCarousel images={page.review_images} />
         </div>
       </section>
     );
   };
 
    // ===== EXTRA SECTIONS - Template 05 Style =====
    const renderExtraSection = (sectionNumber: number) => {
      const showKey = `show_extra_section_${sectionNumber}` as keyof SalesPage;
      if (!page[showKey]) return null;

      const heading = (page as any)[`extra_section_${sectionNumber}_heading`] || '';
      const points: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const point = (page as any)[`extra_section_${sectionNumber}_point_${i}`];
        if (point) points.push(point);
      }
      const jsonPoints = (page as any)[`extra_section_${sectionNumber}_points`];
      if (Array.isArray(jsonPoints)) {
        jsonPoints.forEach((p: string) => { if (p && !points.includes(p)) points.push(p); });
      }
      if (!heading && points.length === 0) return null;

      const bgGradient = sectionNumber === 2 ? 'from-[#5b21b6] to-[#4c1d95]' : 'from-[#4c1d95] to-[#5b21b6]';

      const defaultHeadings: Record<number, string> = {
        1: 'কেন আমাদের উপর আস্থা রাখবেন?',
        2: 'আমাদের বিশেষত্ব',
        3: 'গ্রাহক সুবিধা',
      };

      return (
        <section
          key={`extra${sectionNumber}`}
          className={`py-8 px-4 bg-gradient-to-b ${bgGradient}`}
          style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}
        >
          <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Bordered heading like Template 05 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <h2
                className="text-[20px] md:text-[24px] font-bold leading-snug inline-block px-5 py-2"
                style={{
                  color: '#e9d5ff',
                  textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 2px 4px rgba(0,0,0,0.5)',
                  border: '2px solid #c084fc',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                }}
              >
                {renderSalesText(heading || defaultHeadings[sectionNumber])}
              </h2>
            </motion.div>

            {/* Glassmorphism cards like Template 05 */}
            <div className="space-y-3">
              {renderSalesText(points.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(4px)',
                    borderLeft: '3px solid #a855f7',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                      boxShadow: '0 2px 8px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className="text-[16px] md:text-[18px] font-medium leading-relaxed"
                    style={{
                      color: '#f3e8ff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                    
                  >{renderSalesText(point)}</p>
                </motion.div>
              )))}
            </div>

            {/* 3D CTA button like Template 05 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6"
            >
              <button
                onClick={scrollToCheckout}
                className="w-full max-w-md mx-auto block py-3 px-6 text-[21px] font-bold rounded-full border-0 cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #f472b6 0%, #ec4899 40%, #be185d 100%)',
                  color: '#ffffff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                👆 {renderSalesText(page.cta_button_text || "অর্ডার করতে ক্লিক করুন")}
              </button>
            </motion.div>
          </div>
        </section>
      );
    };

    const renderExtra1 = () => renderExtraSection(1);
    const renderExtra2 = () => renderExtraSection(2);
    const renderExtra3 = () => renderExtraSection(3);
 
   const renderCheckout = () => {
     if (!page.show_checkout_section) return null;
     return <CheckoutSection key="checkout" page={{ ...page, primary_color: '#a855f7', accent_color: '#ec4899' }} />;
   };
 
   const renderSection = (sectionId: string) => {
     switch (sectionId) {
       case 'hero': return renderHero();
       case 'pricing': return renderPricing();
       case 'gallery': return renderGallery();
       case 'features': return page.template_styles?.features?.design ? (page.show_features_section ? <SharedFeaturesSection key="features" page={page} /> : null) : renderFeatures();
       case 'contact': return renderContact();
       case 'reviews': return page.show_reviews_section ? <SharedReviewsSection key="reviews" page={page} /> : null;
       case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtra1();
       case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtra2();
       case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtra3();
       case 'checkout': return renderCheckout();
       default: return null;
     }
   };
 
   return (
     <div className="min-h-screen font-['Hind_Siliguri'] bg-gradient-to-b from-[#4c1d95] via-[#5b21b6] to-[#4c1d95]">
       {renderSalesText(sectionOrder.map(sectionId => <SectionAppearance key={sectionId} page={page} section={sectionId}>{renderSection(sectionId)}</SectionAppearance>))}
       <footer className="py-6 text-center text-sm bg-[#3b0764] space-y-2">
         {renderSalesText(page.footer_text && (
           <p className="text-purple-300/70 text-xs px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">{renderSalesText(page.footer_text)}</p>
         ))}
         <p className="text-purple-500/40 flex items-center justify-center gap-2">
           <Sparkles className="w-4 h-4" />
           © {renderSalesText(new Date().getFullYear())} - সকল অধিকার সংরক্ষিত
         </p>
       </footer>
     </div>
   );
 };
 
 export default Template03Fashion;