import SectionAppearance from '../SectionAppearance';
import ExtraSection from '../ExtraSection';
import { isExtraDesign } from '@/lib/extraSectionDesigns';
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getWhatsAppUrl } from "@/lib/utils";
import { SalesPage } from "@/types/salesPage";
import {
  Check,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
  Zap,
  Cpu,
  Wifi,
  Battery,
  MonitorSmartphone,
  Headphones,
  Camera,
  Bluetooth,
  Volume2,
  Clock
} from "lucide-react";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import SharedContactSection from "../ContactSection";
import SharedReviewsSection from "../SharedReviewsSection";
import SharedFeaturesSection from "../SharedFeaturesSection";
import SharedGallerySection from "../SharedGallerySection";
import { usePixelTracking } from "@/hooks/usePixelTracking";

// ===== Review Carousel - Dynamic Colors =====
const ReviewCarousel = ({ images, accentColor }: { images: string[]; accentColor: string }) => {
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
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {renderSalesText(slideImages.map((img, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${accentColor}30` }}
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
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === currentIndex ? '24px' : '10px',
                backgroundColor: i === currentIndex ? accentColor : `${accentColor}40`,
              }}
            />
          )))}
        </div>
      ))}
    </div>
  );
};

// ===== Gallery Carousel with Thumbnails - Dynamic Colors =====
const GalleryCarousel = ({ images, productName, accentColor, textColor }: { images: string[]; productName?: string; accentColor: string; textColor: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentColor}30`, background: 'rgba(0,0,0,0.2)' }}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={salesPlainText(`Product ${currentIndex + 1}`)}
          className="w-full aspect-square object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        {renderSalesText(productName && (
          <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', border: `1px solid ${accentColor}30` }}>
            <p className="font-semibold text-sm" style={{ color: accentColor }}>{renderSalesText(productName)}</p>
          </div>
        ))}
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${accentColor}30` }}
        >
          <ChevronLeft className="w-6 h-6" style={{ color: accentColor }} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${accentColor}30` }}
        >
          <ChevronRight className="w-6 h-6" style={{ color: accentColor }} />
        </button>
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-sm font-medium" style={{ color: accentColor }}>{renderSalesText(currentIndex + 1)}/{renderSalesText(images.length)}</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {renderSalesText(images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
            style={{
              border: i === currentIndex ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.1)',
              boxShadow: i === currentIndex ? `0 0 8px ${accentColor}40` : 'none',
            }}
          >
            <img src={img} alt={salesPlainText(`Thumb ${i + 1}`)} className="w-full h-full object-cover" />
          </button>
        )))}
      </div>
    </div>
  );
};

// ===== Countdown Timer - Exact Match =====
const CountdownTimer = ({
  endDate,
  labels,
  colors
}: {
  endDate: string | null;
  labels: { days: string; hours: string; minutes: string; seconds: string };
  colors: { primary: string; accent: string; headline: string };
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          background: `${colors.primary}e6`,
          border: `1px solid ${colors.accent}60`,
          borderRadius: '10px',
          padding: '10px 5px',
          width: '72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: `0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 ${colors.accent}15`,
        }}
      >
        <span style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.headline || '#fbbf24', lineHeight: 1 }}>
          {renderSalesText(value.toString().padStart(2, '0'))}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#d1d5db', marginTop: '4px', fontWeight: 400 }}>{renderSalesText(label)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
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

const Template04Gadget = ({ page }: TemplateProps) => {
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
      category: "Sales Page - Gadget",
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
    if (checkoutElement) observer.observe(checkoutElement);
    return () => { if (checkoutElement) observer.unobserve(checkoutElement); };
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
      cpu: <Cpu className="w-5 h-5" />, wifi: <Wifi className="w-5 h-5" />, battery: <Battery className="w-5 h-5" />,
      monitor: <MonitorSmartphone className="w-5 h-5" />, headphones: <Headphones className="w-5 h-5" />,
      camera: <Camera className="w-5 h-5" />, bluetooth: <Bluetooth className="w-5 h-5" />,
      volume: <Volume2 className="w-5 h-5" />, zap: <Zap className="w-5 h-5" />,
      shield: <Shield className="w-5 h-5" />, star: <Star className="w-5 h-5" />, clock: <Clock className="w-5 h-5" />,
    };
    const defaultIcons = [<Cpu className="w-5 h-5" />, <Battery className="w-5 h-5" />, <Wifi className="w-5 h-5" />, <Bluetooth className="w-5 h-5" />, <Volume2 className="w-5 h-5" />, <Camera className="w-5 h-5" />];
    return iconMap[iconName?.toLowerCase()] || defaultIcons[index % defaultIcons.length];
  };

  // Dynamic colors from page settings
  const c = {
    primary: page.primary_color || '#064e3b',
    accent: page.accent_color || '#d4af37',
    headline: page.headline_color || '#fde68a',
    button: page.button_color || '#d4af37',
    bg: page.background_color || '#065f46',
    text: page.text_color || '#ffffff',
  };

  // Helper: lighten a hex color
  const lightenHex = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xFF) + Math.round(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(255 * amount));
    const b = Math.min(255, (num & 0xFF) + Math.round(255 * amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  // Reusable CTA button
  const CTAButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={scrollToCheckout}
      className={`w-full max-w-[320px] md:max-w-[380px] mx-auto block py-3.5 md:py-4 rounded-full text-base md:text-lg font-extrabold transition-transform active:scale-95 ${className}`}
      style={{
        background: c.button,
        color: c.primary,
        boxShadow: `0 4px 15px ${c.button}50`,
        animation: 'pulseGlow04 2s infinite',
      }}
    >
      {renderSalesText(page.cta_button_text || "অর্ডার করতে এখানে ক্লিক করুন 🛒")}
    </button>
  );

  // ===== HERO SECTION =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;
    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '20px 15px 40px 15px',
          boxSizing: 'border-box' as const,
          width: '100%',
          color: 'white',
          position: 'relative' as const,
          overflow: 'hidden' as const,
        }}
      >


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '420px',
            margin: '0 auto',
            background: 'rgba(0, 0, 0, 0.18)',
            border: `1.5px solid ${c.accent}80`,
            borderRadius: '24px',
            padding: '32px 22px',
            textAlign: 'center' as const,
            boxShadow: `0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 ${c.accent}20`,
            position: 'relative' as const,
            overflow: 'hidden' as const,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* শিরোনাম */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: '1.15rem',
              color: c.headline,
              margin: '0 0 22px 0',
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '1.5px',
              textShadow: `0 0 20px ${c.accent}30`,
            }}
          >
            {renderSalesText(page.hero_badge_text || "✨ ধামাকা ক্লিয়ারেন্স অফার ✨")}
          </motion.h2>

          {/* অফার হাইলাইট বক্স */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              marginBottom: '28px',
              background: `${c.accent}10`,
              padding: '22px 14px',
              borderRadius: '14px',
              border: `1.5px dashed ${c.accent}60`,
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '2rem',
                fontWeight: 800,
                color: c.headline,
                textShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                marginBottom: '6px',
                lineHeight: 1.2,
              }}
            >
              {renderSalesText(page.discount_text || `মাত্র ${page.price_unit}${productPrice} টাকায়`)}
            </span>
            <span
              style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.92)',
                fontWeight: 500,
                display: 'block',
                lineHeight: 1.4,
              }}
            >
              {renderSalesText(page.offer_details || page.hero_headline)}
            </span>
          </motion.div>

          {/* কাউন্টডাউন টাইমার */}
          {renderSalesText(page.show_countdown && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CountdownTimer
                endDate={page.countdown_end_date}
                colors={c}
                labels={{
                  days: page.countdown_label_days || "দিন",
                  hours: page.countdown_label_hours || "ঘণ্টা",
                  minutes: page.countdown_label_minutes || "মিনিট",
                  seconds: page.countdown_label_seconds || "সেকেন্ড",
                }}
              />
            </motion.div>
          ))}

          {/* CTA বাটন */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={scrollToCheckout}
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '290px',
                margin: '0 auto 16px auto',
                background: c.button,
                color: c.primary,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1.15rem',
                padding: '15px 0',
                borderRadius: '50px',
                boxShadow: `0 4px 15px ${c.button}40`,
                border: 'none',
                animation: 'pulseGlow04 2.5s infinite',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {renderSalesText(page.cta_button_text || "অর্ডার করতে এখানে ক্লিক করুন 🛒")}
            </button>

            <p
              style={{
                fontSize: '0.95rem',
                color: `${c.headline}cc`,
                fontWeight: 500,
                marginTop: '8px',
                fontStyle: 'italic',
                letterSpacing: '0.3px',
              }}
            >
              {renderSalesText(page.cta_urgency_text || "⚠️ অফারটি শেষ হওয়ার আগেই লুফে নিন!")}
            </p>
          </motion.div>
        </motion.div>

        {/* Pulse Animation - softer */}
        <style>{renderSalesText(`
          @keyframes pulseGlow04 {
            0% { box-shadow: 0 4px 15px ${c.button}40; }
            50% { box-shadow: 0 4px 15px ${c.button}40, 0 0 0 6px ${c.button}15; }
            100% { box-shadow: 0 4px 15px ${c.button}40; }
          }
        `)}</style>
      </section>
    );
  };

  // ===== GALLERY SECTION - Emerald & Gold Theme =====
  const renderGallery = () => {
    if (!page.show_gallery_section || !page.gallery_images?.length) return null;
    if (page.template_styles?.gallery?.design) return <SharedGallerySection key="gallery" page={page} onOrderClick={scrollToCheckout} />;
    const images = page.gallery_images;

    return (
      <section
        key="gallery"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '30px 15px',
          boxSizing: 'border-box' as const,
          width: '100%',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          {/* শিরোনাম - রেফারেন্সের মত বড় ও বোল্ড */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '20px' }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                color: c.text,
                margin: '0 0 6px 0',
                fontWeight: 800,
                lineHeight: 1.3,
              }}
            >
              {renderSalesText(page.gallery_title || "আমাদের কালেকশন")}
            </h2>
            <p style={{ fontSize: '0.95rem', color: `${c.text}aa`, margin: 0, fontWeight: 400 }}>
              {renderSalesText(page.gallery_subtitle || "যেমন দেখছেন, তেমনই পাবেন")}
            </p>
          </motion.div>

          {/* 2-কলাম গ্রিড - কন্টেইনার ছাড়া, সরাসরি গ্রিড */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {renderSalesText(images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: `2px solid ${c.accent}`,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.3), 0 0 8px ${c.accent}20`,
                  position: 'relative' as const,
                  background: 'rgba(0,0,0,0.15)',
                }}
              >
                <img
                  src={img}
                  alt={salesPlainText(`Product ${idx + 1}`)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* অর্ডার বাটন ওভারলে */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  }}
                >
                  <button
                    onClick={scrollToCheckout}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: c.button,
                      color: c.primary,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    }}
                  >
                    🛒 অর্ডার করুন
                  </button>
                </div>
              </motion.div>
            )))}
          </div>

        </div>
      </section>
    );
  };

  // ===== FEATURES SECTION =====
  const renderFeatures = () => {
    if (!page.show_features_section || !features.length) return null;
    return (
      <section key="features" className="py-8 md:py-14 px-4" style={{ background: c.bg }}>
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-8"
          >
            <span className="text-sm md:text-base font-medium" style={{ color: c.headline }}>
              {renderSalesText(page.features_subheadline || "স্পেসিফিকেশন")}
            </span>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mt-1" style={{ color: c.text }}>
              {renderSalesText(page.features_headline || "কেন এই প্রোডাক্ট বেছে নেবেন?")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {renderSalesText(features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl p-4 md:p-5 transition-colors"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${c.accent}30`,
                }}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${c.accent}20`, border: `1px solid ${c.accent}40` }}
                >
                  <span style={{ color: c.accent }}>{renderSalesText(getFeatureIcon(feature.icon || '', index))}</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1" style={{ color: c.text }}>{renderSalesText(feature.text)}</h3>
                {renderSalesText(feature.description && (
                  <p className="text-xs md:text-sm" style={{ color: `${c.text}99` }}>{renderSalesText(feature.description)}</p>
                ))}
              </motion.div>
            )))}
          </div>

          <div className="text-center mt-6 md:mt-8">
            <CTAButton />
          </div>
        </div>
      </section>
    );
  };

  const renderContact = () => page.show_contact_section ? <SharedContactSection key="contact" page={page} /> : null;

  // ===== REVIEWS SECTION =====
  const renderReviews = () => {
    if (!page.show_reviews_section || !page.review_images?.length) return null;
    return (
      <section
        key="reviews"
        className="py-8 md:py-14 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5 md:mb-8"
          >
            <span className="text-sm md:text-base font-medium" style={{ color: c.headline }}>
              {renderSalesText(page.reviews_subheadline || "কাস্টমার ফিডব্যাক")}
            </span>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mt-1" style={{ color: c.text }}>
              {renderSalesText(page.reviews_headline || "গ্রাহকদের মতামত")}
            </h2>
          </motion.div>

          <ReviewCarousel images={page.review_images} accentColor={c.accent} />

          <div className="text-center mt-5 md:mt-8">
            <CTAButton />
          </div>
        </div>
      </section>
    );
  };

  // ===== EXTRA SECTION RENDERER =====
  const renderExtraSection = (sectionNum: 1 | 2 | 3) => {
    const showSection = page[`show_extra_section_${sectionNum}` as keyof SalesPage];
    const heading = page[`extra_section_${sectionNum}_heading` as keyof SalesPage] as string;
    const points = (page[`extra_section_${sectionNum}_points` as keyof SalesPage] as { text: string }[]) || [];

    const fallbackPoints = [
      page[`extra_section_${sectionNum}_point_1` as keyof SalesPage],
      page[`extra_section_${sectionNum}_point_2` as keyof SalesPage],
      page[`extra_section_${sectionNum}_point_3` as keyof SalesPage],
      page[`extra_section_${sectionNum}_point_4` as keyof SalesPage],
      page[`extra_section_${sectionNum}_point_5` as keyof SalesPage],
      page[`extra_section_${sectionNum}_point_6` as keyof SalesPage],
    ].filter(Boolean) as string[];

    const allPoints = points.length > 0 ? points.map(p => p.text) : fallbackPoints;
    if (!showSection || !heading) return null;

    return (
      <section
        key={`extra${sectionNum}`}
        className="py-8 md:py-14 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-5 md:p-8"
            style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${c.accent}30` }}
          >
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2" style={{ color: c.text }}>
              <Zap className="w-5 h-5 md:w-6 md:h-6" style={{ color: c.accent }} />
              {renderSalesText(heading)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {renderSalesText(allPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 md:p-4 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.15)', border: `1px solid ${c.accent}20` }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${c.accent}20` }}
                  >
                    <Check className="w-3 h-3" style={{ color: c.accent }} />
                  </div>
                  <span className="text-sm md:text-base" style={{ color: `${c.text}cc` }}>{renderSalesText(point)}</span>
                </div>
              )))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // ===== CHECKOUT SECTION =====
  const renderCheckout = () => {
    if (!page.show_checkout_section) return null;
    return (
      <div
        key="checkout"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <CheckoutSection page={page} />
      </div>
    );
  };

  // ===== SECTION RENDERER =====
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return renderHero();
      case 'gallery': return renderGallery();
      case 'features': return page.template_styles?.features?.design ? (page.show_features_section ? <SharedFeaturesSection key="features" page={page} /> : null) : renderFeatures();
      case 'contact': return renderContact();
      case 'reviews': return page.show_reviews_section ? <SharedReviewsSection key="reviews" page={page} /> : null;
      case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtraSection(1);
      case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtraSection(2);
      case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtraSection(3);
      case 'checkout': return renderCheckout();
      default: return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: c.bg,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      {renderSalesText(sectionOrder.map(sectionId => <SectionAppearance key={sectionId} page={page} section={sectionId}>{renderSection(sectionId)}</SectionAppearance>))}

      {/* Footer */}
      <div
        className="py-8 md:py-10 text-center text-sm md:text-base"
        style={{
          background: c.bg,
          borderTop: `1px solid ${c.accent}15`,
        }}
      >
        <p style={{ color: `${c.text}60` }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>
    </div>
  );
};

export default Template04Gadget;
