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
  Truck,
  Package,
  CheckCircle,
  Zap,
} from "lucide-react";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import { usePixelTracking } from "@/hooks/usePixelTracking";

interface TemplateProps {
  page: SalesPage;
}

// ══════════════════════════════════════════════
// Color Helpers
// ══════════════════════════════════════════════
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - percent)));
  const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - percent)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const DEFAULT_ORDER = ['hero', 'video', 'gallery', 'features', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

// ══════════════════════════════════════════════
// Template 06: আতর — Premium Perfume/Attar
// ══════════════════════════════════════════════
const Template06Panjabi = ({ page }: TemplateProps) => {
  const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
  const hasTrackedCheckoutView = useRef(false);
  const checkoutRef = useRef<HTMLDivElement>(null);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const product = page.products;
  const productPrice = product?.price || page.offer_price || 0;
  const productOriginalPrice = product?.original_price || null;

  useEffect(() => {
    const productData = {
      product_id: product?.id,
      product_name: product?.name_bn || product?.name || page.title,
      price: productPrice,
      original_price: productOriginalPrice,
      quantity: 1,
     category: "Sales Page - Attar",
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
    const el = checkoutRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [page.title, product, productPrice, productOriginalPrice, trackInitiateCheckout]);

  // Dynamic colors - Perfume/Attar theme defaults (luminaessencebd.com inspired)
  // Background: warm cream, Headline1: dark, Headline2: red, Badge: red, Accent: green, Button: green
  const baseBtn = page.button_color || '#16a34a';
  const c = {
    primary: page.primary_color || '#1a1a2e',
    accent: page.accent_color || '#16a34a',
    bg: page.background_color || '#fdf2e9',
    text: page.text_color || '#1a1a2e',
    headline: page.headline_color || '#e53935',
    button: baseBtn,
    buttonLight: lightenColor(baseBtn, 0.2),
    buttonDark: darkenColor(baseBtn, 0.25),
    border: darkenColor(page.headline_color || '#e53935', 0.15),
    cardBg: darkenColor(page.primary_color || '#1a1a2e', 0.15),
    heroBg: page.background_color || '#fdf2e9',
  };

  const sectionOrder = page.section_order?.length > 0 ? page.section_order : DEFAULT_ORDER;

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

  // ── Reusable CTA Button (Green rounded style) ──
  const CTAButton = ({ className = "" }: { className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className={`text-center mt-6 px-4 ${className}`}
    >
      <button
        onClick={scrollToCheckout}
        className="w-full max-w-md mx-auto block py-3.5 px-6 text-[19px] font-bold rounded-full border-0 cursor-pointer transition-transform active:scale-95 text-white"
        style={{
          background: `linear-gradient(180deg, ${c.buttonLight} 0%, ${c.button} 40%, ${c.buttonDark} 100%)`,
          boxShadow: `0 6px 20px ${c.button}60`,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          animation: 'pulseGlow06 2.5s infinite',
        }}
      >
        🛒 {renderSalesText(page.cta_button_text || "অর্ডার করতে চাই")}
      </button>
    </motion.div>
  );

  // ── Section Heading (Template 05 bordered style) ──
  const SectionHeading = ({ text, subtitle }: { text: string; subtitle?: string | null }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-6"
    >
      <h2
        className="text-[20px] md:text-[24px] font-bold leading-snug inline-block px-5 py-2"
        style={{
          color: c.headline,
          border: `2px solid ${c.headline}40`,
          borderRadius: '8px',
          backgroundColor: `${c.headline}08`,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        {renderSalesText(text)}
      </h2>
      {renderSalesText(subtitle && (
        <p className="text-[15px] mt-2 font-medium" style={{ color: c.text, opacity: 0.8 }}>
          {renderSalesText(subtitle)}
        </p>
      ))}
    </motion.div>
  );

  // ── Slider Arrows ──
  const SliderArrows = ({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) => (
    <>
      <button
        onClick={onPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${c.accent}, ${c.primary})`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${c.accent}, ${c.primary})`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </>
  );

  // ── Slider Dots ──
  const SliderDots = ({ count, activeIndex, onSelect }: { count: number; activeIndex: number; onSelect: (i: number) => void }) => (
    <div className="flex justify-center gap-2 mt-4">
      {renderSalesText(Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className="transition-all duration-300"
          style={{
            width: activeIndex === idx ? '28px' : '10px',
            height: '10px',
            borderRadius: '5px',
            background: activeIndex === idx
              ? `linear-gradient(135deg, ${c.buttonLight}, ${c.button})`
              : 'rgba(255, 255, 255, 0.25)',
            boxShadow: activeIndex === idx ? `0 2px 8px ${c.button}80` : 'none',
          }}
        />
      )))}
    </div>
  );

  // ══════════════════════════════════════════════
  // HERO SECTION — Perfume Ad Card Style (exact match)
  // White card, orange tagline, two-color heading, price box with discount tag,
  // product image with overlays
  // ══════════════════════════════════════════════
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    const discountPercent = productOriginalPrice && productOriginalPrice > productPrice
      ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
      : 0;

    return (
      <section
        key="hero"
        className="relative overflow-hidden"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        {/* ─── White Ad Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '450px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '25px',
            overflow: 'hidden',
            textAlign: 'center',
            boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
          }}
        >
          {/* ─── Header Content ─── */}
          <div style={{ padding: '30px 20px 20px' }}>
            {/* Tagline Badge */}
            {renderSalesText(page.hero_badge_text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '12px' }}
              >
                <span
                  style={{
                    background: '#fff5f0',
                    color: '#d35400',
                    display: 'inline-block',
                    padding: '4px 18px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(page.hero_badge_text)}
                </span>
              </motion.div>
            ))}

            {/* Main Heading — Two Colors */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2
                style={{
                  fontSize: '28px',
                  color: c.primary || '#1a202c',
                  margin: '10px 0',
                  lineHeight: 1.4,
                  fontWeight: 700,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {renderSalesText(page.hero_headline)}
                {renderSalesText(page.hero_subheadline && (
                  <>
                    <br />
                    <span style={{ color: c.headline || '#e67e22' }}>
                      {renderSalesText(page.hero_subheadline)}
                    </span>
                  </>
                ))}
              </h2>
            </motion.div>

            {/* Delivery Badge — Green pill */}
            {renderSalesText(page.offer_details && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{ margin: '15px 0' }}
              >
                <span
                  style={{
                    background: c.accent || '#1abc9c',
                    color: '#fff',
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '50px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(page.offer_details)}
                </span>
              </motion.div>
            ))}

            {/* Price Area with Discount Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                position: 'relative',
                display: 'inline-block',
                marginTop: '15px',
              }}
            >
              {/* Discount Tag — Floating on top */}
              {renderSalesText((discountPercent > 0 || page.discount_text) && (
                <span
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    padding: '2px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    zIndex: 2,
                    whiteSpace: 'nowrap',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(page.discount_text || `${discountPercent}% অফ`)}
                </span>
              ))}

              {/* Price Box */}
              <div
                style={{
                  border: '2px solid #fdf2e9',
                  padding: '12px 30px',
                  borderRadius: '15px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  background: '#fffdfb',
                }}
              >
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#94a3b8',
                    fontSize: '20px',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(productOriginalPrice || productPrice)}{renderSalesText(page.price_unit || '৳')}
                </span>
                <span
                  style={{
                    color: c.accent || '#10b981',
                    fontSize: '28px',
                    fontWeight: 800,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(productPrice)}{renderSalesText(page.price_unit || '৳')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ─── Image Section with Overlays ─── */}
          {renderSalesText(page.hero_images?.[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'relative',
                padding: '0 15px 15px',
                marginTop: '10px',
              }}
            >
              <img
                src={page.hero_images[0]}
                alt={salesPlainText(page.hero_headline)}
                style={{
                  width: '100%',
                  borderRadius: '20px',
                  display: 'block',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                }}
              />

              {/* CTA Urgency Bar — Bottom overlay on image */}
              {renderSalesText(page.cta_urgency_text && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#ffffff',
                    padding: '12px',
                    position: 'absolute',
                    bottom: '35px',
                    left: '15px',
                    right: '15px',
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '1px',
                    borderBottomLeftRadius: '5px',
                    borderBottomRightRadius: '5px',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    textAlign: 'center',
                  }}
                >
                  {renderSalesText(page.cta_urgency_text)}
                </div>
              ))}
            </motion.div>
          ))}

          {/* ─── Order CTA Button inside card ─── */}
          <div style={{ padding: '5px 20px 25px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                background: `linear-gradient(180deg, ${c.buttonLight} 0%, ${c.button} 40%, ${c.buttonDark} 100%)`,
                boxShadow: `0 6px 20px ${c.button}60`,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                animation: 'pulseGlow06 2.5s infinite',
                transition: 'transform 0.15s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              🛒 {renderSalesText(page.cta_button_text || "অর্ডার করতে চাই")}
            </button>
          </div>
        </motion.div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // VIDEO SECTION
  // ══════════════════════════════════════════════
  const renderVideo = () => {
    if (!page.show_video_section || !page.video_url) return null;

    const getYoutubeId = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    const youtubeId = getYoutubeId(page.video_url);

    return (
      <section
        key="video"
        className="py-8 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          <SectionHeading text={page.video_title || 'প্রোডাক্ট ভিডিও'} subtitle={page.video_subtitle} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: `2px solid ${c.accent}60`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
              }}
            >
              {renderSalesText(youtubeId ? (
                <div className="aspect-video">
                  <iframe loading="lazy"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title={salesPlainText(page.video_title)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video">
                  <video src={page.video_url} controls className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
          <CTAButton />
        </div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // GALLERY SECTION — Emerald & Gold Card Style
  // ══════════════════════════════════════════════
  const renderGallery = () => {
    if (!page.show_gallery_section || !page.gallery_images?.length) return null;
    const images = page.gallery_images;

    const GallerySlider = () => {
      const [currentIndex, setCurrentIndex] = useState(0);
      const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

      const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
      const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

      return (
        <>
          {/* Gallery Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              maxWidth: '420px',
              margin: '0 auto',
              background: '#ffffff',
              border: '1px solid #eee',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            }}
          >
            {/* Gallery Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-4"
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: c.headline,
                  margin: '0 0 5px 0',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {renderSalesText(page.gallery_title || 'এক্সক্লুসিভ কালেকশন')}
              </h2>
              <p
                style={{
                  color: c.text,
                  margin: 0,
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  opacity: 0.7,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {renderSalesText(page.gallery_subtitle || 'প্রিমিয়াম কোয়ালিটি নিশ্চিত')}
              </p>
            </motion.div>

            {/* Main Image Wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative mb-4"
            >
              {/* Image Frame */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{
                  aspectRatio: '4/5',
                  borderRadius: '12px',
                  border: `2px solid ${c.headline}`,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f5f5f5',
                }}
                onClick={() => setFullscreenImage(images[currentIndex])}
              >
                <img
                  src={images[currentIndex]}
                  alt={salesPlainText(`Product ${currentIndex + 1}`)}
                  className="w-full h-full object-cover block transition-opacity duration-300"
                />

                {/* Zoom Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImage(images[currentIndex]);
                  }}
                  className="absolute top-3 right-3 flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    padding: '7px',
                    borderRadius: '50%',
                    border: `1px solid ${c.headline}`,
                    zIndex: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>

                {/* Counter Badge */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    padding: '5px 15px',
                    borderRadius: '9999px',
                    color: c.headline,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    zIndex: 10,
                    border: `1px solid ${c.headline}40`,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(currentIndex + 1)} / {renderSalesText(images.length)}
                </div>
              </div>

              {/* Navigation Arrows */}
              {renderSalesText(images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      left: '8px',
                      width: '36px',
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '50%',
                      border: `1px solid ${c.headline}`,
                      zIndex: 20,
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: c.headline }} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      right: '8px',
                      width: '36px',
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '50%',
                      border: `1px solid ${c.headline}`,
                      zIndex: 20,
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: c.headline }} />
                  </button>
                </>
              ))}
            </motion.div>

            {/* Thumbnails Row */}
            <div
              className="flex justify-center flex-wrap"
              style={{ gap: '10px', marginTop: '15px' }}
            >
              {renderSalesText(images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className="overflow-hidden p-0 transition-all"
                  style={{
                    width: 'calc(25% - 10px)',
                    maxWidth: '60px',
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    border: currentIndex === idx ? `2px solid ${c.headline}` : '2px solid #eee',
                    opacity: currentIndex === idx ? 1 : 0.6,
                    transform: currentIndex === idx ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: currentIndex === idx ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                    background: '#f5f5f5',
                    cursor: 'pointer',
                  }}
                >
                  <img src={img} alt={salesPlainText(`Thumbnail ${idx + 1}`)} className="w-full h-full object-cover" />
                </button>
              )))}
            </div>

            {/* Order Button */}
            <div className="text-center" style={{ marginTop: '20px' }}>
              <button
                onClick={scrollToCheckout}
                className="inline-block cursor-pointer transition-all active:scale-95 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(180deg, ${c.buttonLight} 0%, ${c.button} 40%, ${c.buttonDark} 100%)`,
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  borderRadius: '50px',
                  boxShadow: `0 4px 15px ${c.button}50`,
                  border: 'none',
                  minWidth: '180px',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                🛒 {renderSalesText(page.cta_button_text || 'অর্ডার করতে ক্লিক করুন')}
              </button>
            </div>
          </motion.div>

          {/* Fullscreen Modal */}
          {renderSalesText(fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenImage(null)}
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                background: 'rgba(4, 47, 36, 0.98)',
                padding: '15px',
              }}
            >
              <img
                src={fullscreenImage}
                alt="Full view"
                className="max-w-full object-contain"
                style={{
                  maxHeight: '90vh',
                  border: `2px solid ${c.headline || '#d4af37'}`,
                  borderRadius: '8px',
                }}
              />
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute flex items-center justify-center cursor-pointer"
                style={{
                  top: '20px',
                  right: '20px',
                  background: c.headline || '#fbbf24',
                  borderRadius: '50%',
                  border: 'none',
                  color: '#064e3b',
                  width: '40px',
                  height: '40px',
                  fontWeight: 'bold',
                  fontSize: '20px',
                }}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </>
      );
    };

    return (
      <section
        key="gallery"
        className="py-6 px-3"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <GallerySlider />
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // FEATURES SECTION
  // ══════════════════════════════════════════════
  const renderFeatures = () => {
    if (!page.show_features_section || !features.length) return null;

    const defaultIcons = [Truck, Shield, Package, Star, CheckCircle, Zap];

    return (
      <section
        key="features"
        className="py-8 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          <SectionHeading
            text={page.features_headline || 'কেন আমাদের থেকে কিনবেন?'}
            subtitle={page.features_subheadline}
          />

          <div className="grid grid-cols-2 gap-3">
            {renderSalesText(features.map((feature, idx) => {
              const Icon = defaultIcons[idx % defaultIcons.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${c.accent}30`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${c.accent}30, ${c.accent}10)`,
                      border: `1px solid ${c.accent}40`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: c.accent }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: c.text }}>{renderSalesText(feature.text)}</p>
                  {renderSalesText(feature.description && (
                    <p className="text-xs" style={{ color: `${c.text}80` }}>{renderSalesText(feature.description)}</p>
                  ))}
                </motion.div>
              );
            }))}
          </div>

          <CTAButton />
        </div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // REVIEWS SECTION — Template 05 slider style
  // ══════════════════════════════════════════════
  const renderReviews = () => {
    if (!page.show_reviews_section) return null;
    const reviews = page.review_images || [];
    const reviewVideoUrl = page.review_video_url;

    const ReviewSlider = () => {
      const [activeIndex, setActiveIndex] = useState(0);
      const touchStartX = useRef(0);
      const touchEndX = useRef(0);

      const nextSlide = () => setActiveIndex((prev) => (prev + 1) % reviews.length);
      const prevSlide = () => setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

      const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
      const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
      const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
      };

      if (reviews.length === 0) return null;

      return (
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              border: `3px solid ${c.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              backgroundColor: '#ffffff',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={reviews[activeIndex]}
              alt={salesPlainText(`Review ${activeIndex + 1}`)}
              className="w-full object-contain"
              style={{ maxHeight: '500px', minHeight: '250px' }}
            />
            {renderSalesText(reviews.length > 1 && <SliderArrows onPrev={prevSlide} onNext={nextSlide} />)}
            <div
              className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${c.accent}, ${c.primary})`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {renderSalesText(activeIndex + 1)} / {renderSalesText(reviews.length)}
            </div>
          </div>
          {renderSalesText(reviews.length > 1 && (
            <SliderDots count={reviews.length} activeIndex={activeIndex} onSelect={setActiveIndex} />
          ))}
        </motion.div>
      );
    };

    const getYoutubeId = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    return (
      <section
        key="reviews"
        className="py-8 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          <SectionHeading
            text={`★★★ ${page.reviews_headline || 'সম্মানিত কাস্টমারদের মতামত'} ★★★`}
            subtitle={page.reviews_subheadline}
          />

          {renderSalesText(reviewVideoUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mb-6">
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `3px solid ${c.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {renderSalesText(getYoutubeId(reviewVideoUrl) ? (
                  <div className="aspect-video">
                    <iframe loading="lazy"
                      src={`https://www.youtube.com/embed/${getYoutubeId(reviewVideoUrl)}?rel=0`}
                      title="Customer Review Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video">
                    <video src={reviewVideoUrl} controls className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <ReviewSlider />
          <CTAButton />
        </div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // CONTACT SECTION
  // ══════════════════════════════════════════════
  const renderContact = () => {
    if (!page.show_contact_section) return null;
    return (
      <section
        key="contact"
        className="py-10 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-bold mb-2"
            style={{ color: c.headline }}
          >
            {renderSalesText(page.contact_headline || "যোগাযোগ করুন")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6 text-sm md:text-base"
            style={{ color: c.text, opacity: 0.7 }}
          >
            {renderSalesText(page.contact_subheadline || "অর্ডার বা জিজ্ঞাসার জন্য কল করুন")}
          </motion.p>

          <div className="flex flex-col gap-3">
            {renderSalesText(page.contact_phone && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                href={page.contact_phone_link || `tel:${page.contact_phone}`}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-medium transition-transform active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${c.accent}, ${darkenColor(c.accent, 0.2)})`,
                  boxShadow: `0 4px 15px ${c.accent}50`,
                }}
              >
                <Phone className="w-5 h-5" />
                {renderSalesText(page.contact_phone)}
              </motion.a>
            ))}
            {renderSalesText(page.contact_whatsapp && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                href={getWhatsAppUrl(page.contact_whatsapp || "", page.contact_whatsapp_text || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-medium bg-green-500 transition-transform active:scale-95"
                style={{ boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)' }}
              >
                <MessageCircle className="w-5 h-5" />
                {renderSalesText(page.contact_whatsapp_text || "WhatsApp করুন")}
              </motion.a>
            ))}
          </div>

          {renderSalesText(page.contact_availability && (
            <p className="text-sm mt-4" style={{ color: c.text, opacity: 0.6 }}>
              {renderSalesText(page.contact_availability)}
            </p>
          ))}
        </div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // EXTRA SECTIONS — Template 05 Style (glassmorphism cards)
  // ══════════════════════════════════════════════
  const renderExtraSection = (sectionNum: 1 | 2 | 3) => {
    const heading = (page as any)[`extra_section_${sectionNum}_heading`] || '';

    const points: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const point = (page as any)[`extra_section_${sectionNum}_point_${i}`];
      if (point) points.push(point);
    }
    const jsonPoints = (page as any)[`extra_section_${sectionNum}_points`];
    if (Array.isArray(jsonPoints)) {
      jsonPoints.forEach((p: string) => { if (p && !points.includes(p)) points.push(p); });
    }

    const showSection = (page as any)[`show_extra_section_${sectionNum}`];
    if (!showSection || (!heading && points.length === 0)) return null;

    return (
      <section
        key={`extra${sectionNum}`}
        className="py-8 px-4"
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
          {renderSalesText(heading && <SectionHeading text={heading} />)}

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
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  borderLeft: `3px solid ${c.accent}`,
                }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${c.accent} 0%, ${c.primary} 100%)`,
                    boxShadow: `0 2px 8px ${c.accent}66`,
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p
                  className="text-[16px] md:text-[18px] font-medium leading-relaxed"
                  style={{
                    color: c.text,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                  
                >{renderSalesText(point)}</p>
              </motion.div>
            )))}
          </div>

          <CTAButton />
        </div>
      </section>
    );
  };

  // ══════════════════════════════════════════════
  // CHECKOUT — Template 05 wrapper style
  // ══════════════════════════════════════════════
  const renderCheckout = () => {
    if (!page.show_checkout_section) return null;
    return (
      <div
        key="checkout"
        ref={checkoutRef}
        style={{
          background: c.bg,
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <CheckoutSection page={page} />
      </div>
    );
  };

  // ══════════════════════════════════════════════
  // SECTION RENDERER
  // ══════════════════════════════════════════════
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return renderHero();
      case 'video': return renderVideo();
      case 'gallery': return renderGallery();
      case 'features': return renderFeatures();
      case 'reviews': return renderReviews();
      case 'contact': return renderContact();
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
        className="py-8 text-center text-sm"
        style={{
          background: c.bg,
          borderTop: `1px solid ${c.accent}15`,
        }}
      >
        <p style={{ color: `${c.text}60` }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>

      {/* Pulse Animation */}
      <style>{renderSalesText(`
        @keyframes pulseGlow06 {
          0% { box-shadow: 0 6px 20px ${c.button}60; }
          50% { box-shadow: 0 6px 20px ${c.button}60, 0 0 0 8px ${c.button}15; }
          100% { box-shadow: 0 6px 20px ${c.button}60; }
        }
      `)}</style>
    </div>
  );
};

export default Template06Panjabi;
