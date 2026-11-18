import SectionAppearance from '../SectionAppearance';
import Template02DefaultHero from '../Template02DefaultHero';
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
   Eye,
   Zap,
   Flame
 } from "lucide-react";
 import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import SharedContactSection from "../ContactSection";
import SharedReviewsSection from "../SharedReviewsSection";
import ReviewVideo from "../ReviewVideo";
import SharedFeaturesSection from "../SharedFeaturesSection";
import SharedGallerySection from "../SharedGallerySection";
import Template02Sections from '../Template02Sections';
import { isTemplate02Design, template02Sections } from '@/lib/template02Designs';
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
                   <div
                     key={imgIndex}
                     className="rounded-xl overflow-hidden border border-green-500/20"
                   >
                     <img
                       src={img}
                       alt={salesPlainText(`Review ${slideIndex * imagesPerSlide + imgIndex + 1}`)}
                       className="w-full h-auto object-cover"
                     />
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
               className={`w-2.5 h-2.5 rounded-full transition-all ${
                 i === currentIndex
                   ? "bg-green-400 w-6"
                   : "bg-green-400/30"
               }`}
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
 
   const goToPrev = () => {
     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
   };
 
   const goToNext = () => {
     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
   };
 
   return (
     <div className="space-y-3">
       {/* Main Image with Navigation */}
       <div className="relative rounded-2xl overflow-hidden bg-white">
         <motion.img
           key={currentIndex}
           src={images[currentIndex]}
           alt={salesPlainText(`Product ${currentIndex + 1}`)}
      className="w-full aspect-square object-cover"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.3 }}
         />
         
         {/* Product Name Overlay */}
         {renderSalesText(productName && (
           <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
             <p className="text-white font-semibold text-sm">{renderSalesText(productName)}</p>
           </div>
         ))}
         
         {/* Navigation Arrows */}
         <button
           onClick={goToPrev}
           className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
         >
           <ChevronLeft className="w-6 h-6 text-gray-700" />
         </button>
         <button
           onClick={goToNext}
           className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
         >
           <ChevronRight className="w-6 h-6 text-gray-700" />
         </button>
         
         {/* Pagination */}
         <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
           <p className="text-white text-sm font-medium">{renderSalesText(currentIndex + 1)}/{renderSalesText(images.length)}</p>
         </div>
       </div>
       
       {/* Thumbnails */}
       <div className="flex gap-2 overflow-x-auto pb-2">
         {renderSalesText(images.map((img, i) => (
           <button
             key={i}
             onClick={() => setCurrentIndex(i)}
             className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
               i === currentIndex
                 ? "border-green-500 ring-2 ring-green-500/30"
                 : "border-white/20 hover:border-white/40"
             }`}
           >
             <img src={img} alt={salesPlainText(`Thumb ${i + 1}`)} className="w-full h-full object-cover" />
           </button>
         )))}
       </div>
     </div>
   );
 };
 
 // Countdown Timer Component
 const CountdownTimer = ({ 
   endDate, 
   labels 
 }: { 
   endDate: string | null; 
   labels: { days: string; hours: string; minutes: string; seconds: string };
 }) => {
   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
 
   useEffect(() => {
     const calculateTime = () => {
       const end = endDate ? new Date(endDate).getTime() : Date.now() + 24 * 60 * 60 * 1000;
       const now = Date.now();
       const diff = Math.max(0, end - now);
 
       setTimeLeft({
         days: Math.floor(diff / (1000 * 60 * 60 * 24)),
         hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
         minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
         seconds: Math.floor((diff % (1000 * 60)) / 1000),
       });
     };
 
     calculateTime();
     const interval = setInterval(calculateTime, 1000);
     return () => clearInterval(interval);
   }, [endDate]);
 
   const TimeBox = ({ value, label }: { value: number; label: string }) => (
     <div className="flex flex-col items-center">
       <div className="w-14 h-14 bg-[#0a3d1f] rounded-xl flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-900/50">
         <span className="text-2xl font-bold text-white">{renderSalesText(value.toString().padStart(2, '0'))}</span>
       </div>
       <span className="text-xs text-green-300/70 mt-1.5 font-medium">{renderSalesText(label)}</span>
     </div>
   );
 
   return (
     <div className="flex items-center justify-center gap-3">
       <TimeBox value={timeLeft.days} label={labels.days} />
       <TimeBox value={timeLeft.hours} label={labels.hours} />
       <TimeBox value={timeLeft.minutes} label={labels.minutes} />
       <TimeBox value={timeLeft.seconds} label={labels.seconds} />
     </div>
   );
 };
 
 interface TemplateProps {
   page: SalesPage;
 }
 
 const DEFAULT_ORDER = ['hero', 'gallery', 'features', 'contact', 'reviews', 'extra1', 'extra2', 'extra3', 'checkout'];
 
 const Template02Clothing = ({ page }: TemplateProps) => {
   const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
   const hasTrackedCheckoutView = useRef(false);
 
   const scrollToCheckout = () => {
     document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
   };
 
   const product = page.products;
   const productPrice = product?.price || page.offer_price || 0;
   const productOriginalPrice = product?.original_price || null;
 
   // Track events on page load
   useEffect(() => {
     const productData = {
       product_id: product?.id,
       product_name: product?.name_bn || product?.name || page.title,
       price: productPrice,
       original_price: productOriginalPrice,
       quantity: 1,
       category: "Sales Page - Clothing",
     };
 
     trackPageView(page.title, productData);
     trackAddToCart(productData, page.title);
   }, [page.title, product, productPrice, productOriginalPrice, trackPageView, trackAddToCart]);
 
   // Track InitiateCheckout when checkout section comes into view
   useEffect(() => {
     const observer = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting && !hasTrackedCheckoutView.current) {
             hasTrackedCheckoutView.current = true;
             const productData = {
               product_id: product?.id,
               product_name: product?.name_bn || product?.name || page.title,
               price: productPrice,
               original_price: productOriginalPrice,
               quantity: 1,
             };
             trackInitiateCheckout([productData], page.title);
           }
         });
       },
       { threshold: 0.3 }
     );
 
     const checkoutElement = document.getElementById("checkout");
     if (checkoutElement) {
       observer.observe(checkoutElement);
     }
 
     return () => {
       if (checkoutElement) {
         observer.unobserve(checkoutElement);
       }
     };
   }, [page.title, product, productPrice, productOriginalPrice, trackInitiateCheckout]);
 
   // Features from JSONB or fallback
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
 
   // Feature icons mapping
   const getFeatureIcon = (iconName: string, index: number) => {
     const iconMap: Record<string, React.ReactNode> = {
       palette: <Palette className="w-5 h-5" />,
       scissors: <Scissors className="w-5 h-5" />,
       users: <Users className="w-5 h-5" />,
       eye: <Eye className="w-5 h-5" />,
       truck: <Truck className="w-5 h-5" />,
       zap: <Zap className="w-5 h-5" />,
       shield: <Shield className="w-5 h-5" />,
       star: <Star className="w-5 h-5" />,
       gift: <Gift className="w-5 h-5" />,
     };
     
     const defaultIcons = [
       <Palette className="w-5 h-5" />,
       <Scissors className="w-5 h-5" />,
       <Users className="w-5 h-5" />,
       <Eye className="w-5 h-5" />,
       <Truck className="w-5 h-5" />,
       <Zap className="w-5 h-5" />,
     ];
     
     return iconMap[iconName?.toLowerCase()] || defaultIcons[index % defaultIcons.length];
   };
 
   // ===== HERO SECTION (New Design from Screenshot 1) =====
   const renderHero = () => {
     if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;
    if (page.template_styles?.hero?.t2d_legacy !== '1') return <Template02DefaultHero key="hero" page={page} onOrderClick={scrollToCheckout} />;
     return (
    <section key="hero" className="relative overflow-hidden bg-gradient-to-b from-[#041f10] to-[#052e16] py-10 px-4">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto text-center">
           {/* Badge */}
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-4"
           >
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/40">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               <Flame className="w-4 h-4" />
               {renderSalesText(page.hero_badge_text || "স্টক ক্লিয়ারেন্স সেল লাইভ")}
               <Flame className="w-4 h-4" />
             </span>
           </motion.div>
 
           {/* Price */}
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.1 }}
             className="mb-2"
           >
             <h1 className="text-3xl md:text-4xl font-black text-green-400">
               মাত্র {renderSalesText(page.price_unit)}{renderSalesText(productPrice)} টাকায়
             </h1>
           </motion.div>
 
           {/* Subheadline */}
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-lg text-white/80 mb-6"
           >
             {renderSalesText(page.hero_subheadline || "৫ সেট প্রিমিয়াম থ্রি-পিস")}
           </motion.p>
 
           {/* Countdown */}
           {renderSalesText(page.show_countdown && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="mb-6"
             >
               <p className="text-sm text-green-300/70 mb-3 flex items-center justify-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                 অফার শেষ হতে বাকি
               </p>
               <CountdownTimer
                 endDate={page.countdown_end_date}
                 labels={{
                   days: page.countdown_label_days || "দিন",
                   hours: page.countdown_label_hours || "ঘণ্টা",
                   minutes: page.countdown_label_minutes || "মিনিট",
                   seconds: page.countdown_label_seconds || "সেকেন্ড",
                 }}
               />
             </motion.div>
           ))}
 
           {/* CTA Button */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
           >
            <Button
              size="lg"
              onClick={scrollToCheckout}
              className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
               {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}
               <ArrowRight className="ml-2 h-6 w-6" />
             </Button>
             <p className="text-sm text-yellow-400/80 mt-3 flex items-center justify-center gap-2">
               <Zap className="w-4 h-4" />
               {renderSalesText(page.cta_urgency_text || "সীমিত স্টক! মিস করবেন না")}
             </p>
           </motion.div>
         </div>
       </section>
     );
   };
 
   // ===== GALLERY SECTION (New Design from Screenshot 2) =====
   const renderGallery = () => {
     if (!page.show_gallery_section || !page.gallery_images?.length) return null;
      if (page.template_styles?.gallery?.design) return <SharedGallerySection key="gallery" page={page} onOrderClick={scrollToCheckout} />;
     return (
    <section key="gallery" className="py-8 px-4 bg-gradient-to-b from-[#052e16] to-[#0a3d1f]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-5"
           >
             <span className="text-orange-400 text-sm font-medium">
               {renderSalesText(page.gallery_subtitle || "আমাদের কালেকশন")}
             </span>
             <h2 className="text-xl font-bold text-white mt-1">
               {renderSalesText(page.gallery_title || "যেমন দেখছেন, তেমনই পাবেন")}
             </h2>
           </motion.div>
 
           {/* Gallery Carousel with Thumbnails */}
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
           >
             <GalleryCarousel 
               images={page.gallery_images} 
               productName={product?.name_bn || "ফ্লোরাল প্রিন্ট"} 
             />
           </motion.div>
 
           {/* CTA Button */}
           <Button
             size="lg"
             onClick={scrollToCheckout}
             className="w-full h-14 mt-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl"
           >
             {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}
           </Button>
         </div>
       </section>
     );
   };
 
   // ===== FEATURES SECTION (New Grid Design from Screenshot 3) =====
   const renderFeatures = () => {
     if (!page.show_features_section || !features.length) return null;
     return (
       <section key="features" className="py-8 px-4 bg-gradient-to-b from-[#052e16] to-[#0a3d1f]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-6"
           >
             <h2 className="text-2xl font-bold text-white mb-1">
               {renderSalesText(page.features_headline || "কি কি থাকছে?")}
             </h2>
             <p className="text-green-300/70 text-sm">
               {renderSalesText(page.features_subheadline || "আমাদের বিশেষত্ব ও গ্যারান্টি")}
             </p>
           </motion.div>
 
           {/* 2x3 Grid of Feature Cards */}
           <div className="grid grid-cols-2 gap-3">
             {renderSalesText(features.slice(0, 6).map((feature, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.08 }}
                 className="bg-[#0f4a2a] rounded-2xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all group"
               >
                 {/* Icon */}
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                   i === 0 ? "bg-gradient-to-br from-orange-500 to-amber-600" : "bg-gradient-to-br from-green-600 to-emerald-700"
                 } shadow-lg`}>
                   {renderSalesText(getFeatureIcon(feature.icon || '', i))}
                 </div>
                 
                 {/* Text */}
                 <h3 className="font-bold text-white text-sm mb-1">
                   {renderSalesText(feature.text)}
                 </h3>
                 {renderSalesText(feature.description && (
                   <p className="text-xs text-green-300/60 leading-relaxed">
                     {renderSalesText(feature.description)}
                   </p>
                 ))}
               </motion.div>
             )))}
           </div>
         </div>
       </section>
     );
   };
 
   const renderContact = () => page.show_contact_section ? <SharedContactSection key="contact" page={page} /> : null;

   // ===== REVIEWS SECTION (Same as Template01) =====
   const renderReviews = () => {
     if (page.template_styles?.reviews?.design) return page.show_reviews_section ? <SharedReviewsSection key="reviews" page={page} /> : null;
     if (!page.show_reviews_section || (!page.review_images?.length && !page.review_video_url)) return null;
     return (
       <section key="reviews" className="py-8 px-4 bg-gradient-to-b from-[#052e16] to-[#0a3d1f] overflow-hidden">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-5"
           >
             <h2 className="text-xl font-bold text-white mb-1">{renderSalesText(page.reviews_headline || "কাস্টমার ফিডব্যাক")}</h2>
             <p className="text-sm text-green-300/60">{renderSalesText(page.reviews_subheadline)}</p>
           </motion.div>
           {renderSalesText(page.review_video_url && <ReviewVideo url={page.review_video_url} title={salesPlainText(page.reviews_headline || "কাস্টমার ফিডব্যাক")} />)}
           {renderSalesText(!!page.review_images?.length && <ReviewCarousel images={page.review_images} />)}
         </div>
       </section>
     );
   };
 
   // ===== EXTRA SECTIONS (Same as Template01) =====
   const renderExtra1 = () => {
     if (!page.show_extra_section_1) return null;
     const points = (page.extra_section_1_points && page.extra_section_1_points.length > 0) 
       ? page.extra_section_1_points 
       : [page.extra_section_1_point_1, page.extra_section_1_point_2, page.extra_section_1_point_3, page.extra_section_1_point_4, page.extra_section_1_point_5, page.extra_section_1_point_6].filter(Boolean);
     if (points.length === 0) return null;
     return (
       <section key="extra1" className="py-8 px-4 bg-gradient-to-b from-[#0a3d1f] to-[#052e16]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg mb-3">
               <Shield className="w-5 h-5" />
               <h2 className="text-lg font-bold">{renderSalesText(page.extra_section_1_heading || "কেন আমাদের উপর আস্থা রাখবেন?")}</h2>
             </div>
           </motion.div>
           <div className="space-y-3">
             {renderSalesText(points.map((point, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2.5 py-2.5 px-3 bg-white/95 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                   <Check className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-green-800 text-base">{renderSalesText(point)}</p>
                 </div>
               </motion.div>
             )))}
           </div>
           <Button size="lg" onClick={scrollToCheckout} className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-2xl shadow-green-500/40">
             {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}<ArrowRight className="ml-2 h-5 w-5" />
           </Button>
         </div>
       </section>
     );
   };
 
   const renderExtra2 = () => {
     if (!page.show_extra_section_2) return null;
     const points = (page.extra_section_2_points && page.extra_section_2_points.length > 0) 
       ? page.extra_section_2_points 
       : [page.extra_section_2_point_1, page.extra_section_2_point_2, page.extra_section_2_point_3, page.extra_section_2_point_4, page.extra_section_2_point_5, page.extra_section_2_point_6].filter(Boolean);
     if (points.length === 0) return null;
     return (
       <section key="extra2" className="py-8 px-4 bg-gradient-to-b from-[#052e16] to-[#0a3d1f]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg mb-3">
               <Star className="w-5 h-5" />
               <h2 className="text-lg font-bold">{renderSalesText(page.extra_section_2_heading || "আমাদের বিশেষত্ব")}</h2>
             </div>
           </motion.div>
           <div className="space-y-3">
             {renderSalesText(points.map((point, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2.5 py-2.5 px-3 bg-white/95 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                   <Check className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-green-800 text-base">{renderSalesText(point)}</p>
                 </div>
               </motion.div>
             )))}
           </div>
           <Button size="lg" onClick={scrollToCheckout} className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-2xl shadow-green-500/40">
             {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}<ArrowRight className="ml-2 h-5 w-5" />
           </Button>
         </div>
       </section>
     );
   };
 
   const renderExtra3 = () => {
     if (!page.show_extra_section_3) return null;
     const points = (page.extra_section_3_points && page.extra_section_3_points.length > 0) 
       ? page.extra_section_3_points 
       : [page.extra_section_3_point_1, page.extra_section_3_point_2, page.extra_section_3_point_3, page.extra_section_3_point_4, page.extra_section_3_point_5, page.extra_section_3_point_6].filter(Boolean);
     if (points.length === 0) return null;
     return (
       <section key="extra3" className="py-8 px-4 bg-gradient-to-b from-[#0a3d1f] to-[#052e16]">
         <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg mb-3">
               <Gift className="w-5 h-5" />
               <h2 className="text-lg font-bold">{renderSalesText(page.extra_section_3_heading || "গ্রাহক সুবিধা")}</h2>
             </div>
           </motion.div>
           <div className="space-y-3">
             {renderSalesText(points.map((point, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2.5 py-2.5 px-3 bg-white/95 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                   <Check className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-green-800 text-base">{renderSalesText(point)}</p>
                 </div>
               </motion.div>
             )))}
           </div>
           <Button size="lg" onClick={scrollToCheckout} className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-2xl shadow-green-500/40">
             {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}<ArrowRight className="ml-2 h-5 w-5" />
           </Button>
         </div>
       </section>
     );
   };
 
   // ===== CHECKOUT SECTION (Same as Template01) =====
   const renderCheckout = () => {
     if (!page.show_checkout_section) return null;
     return <CheckoutSection key="checkout" page={{ ...page, primary_color: '#16a34a', accent_color: '#22c55e' }} />;
   };
 
   const renderSection = (sectionId: string) => {
     const section = template02Sections.find(s => s === sectionId);
     if (section && isTemplate02Design(page.template_styles?.[section]?.design)) {
       const visibility = { hero: page.show_hero_section, gallery: page.show_gallery_section, features: page.show_features_section, reviews: page.show_reviews_section, contact: page.show_contact_section };
       return visibility[section] ? <Template02Sections key={section} page={page} section={section} onOrderClick={scrollToCheckout} /> : null;
     }
     switch (sectionId) {
       case 'hero': return renderHero();
       case 'gallery': return renderGallery();
       case 'features': return page.template_styles?.features?.design ? (page.show_features_section ? <SharedFeaturesSection key="features" page={page} /> : null) : renderFeatures();
       case 'contact': return renderContact();
       case 'reviews': return renderReviews();
       case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtra1();
       case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtra2();
       case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtra3();
       case 'checkout': return renderCheckout();
       default: return null;
     }
  };

  return (
    <div className="min-h-screen font-['Hind_Siliguri'] bg-gradient-to-b from-[#052e16] via-[#0a3d1f] to-[#052e16]">
      {renderSalesText(sectionOrder.map(sectionId => <SectionAppearance key={sectionId} page={page} section={sectionId}>{renderSection(sectionId)}</SectionAppearance>))}
      <footer className="py-6 text-center text-sm bg-[#041f10] space-y-2">
        {renderSalesText(page.footer_text && (
          <p className="text-green-300/70 text-xs px-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
            {renderSalesText(page.footer_text)}
          </p>
        ))}
        <p className="text-green-500/40 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          © {renderSalesText(new Date().getFullYear())} - সকল অধিকার সংরক্ষিত
        </p>
      </footer>
    </div>
  );
 };
 
 export default Template02Clothing;