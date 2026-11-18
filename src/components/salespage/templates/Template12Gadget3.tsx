import SectionAppearance from '../SectionAppearance';
import ExtraSection from '../ExtraSection';
import { isExtraDesign } from '@/lib/extraSectionDesigns';
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SalesPage, SpecItem } from "@/types/salesPage";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import ContactSection from "../ContactSection";
import VideoSection from "../VideoSection";
import GallerySection from "../GallerySection";
import { usePixelTracking } from "@/hooks/usePixelTracking";
import { useIsMobile } from "@/hooks/use-mobile";

interface TemplateProps {
  page: SalesPage;
}

// ===== Image Lightbox =====
const ImageLightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', cursor: 'zoom-out',
    }}
  >
    <button
      onClick={onClose}
      style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
        fontSize: '28px', width: '44px', height: '44px', borderRadius: '50%',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      }}
    >✕</button>
    <motion.img
      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
      src={src} alt={salesPlainText(alt)}
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', cursor: 'default' }}
    />
  </motion.div>
);

// ===== Review Carousel =====
const ReviewCarousel = ({ images, accentColor }: { images: string[]; accentColor: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  useEffect(() => {
    if (lightboxImage) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      startAutoplay();
    }
  }, [lightboxImage]);

  const goTo = (index: number) => { setCurrentIndex(index); startAutoplay(); };

  if (images.length === 0) return null;

  const getVisibleImages = () => {
    if (images.length === 1) return [images[0]];
    return [images[currentIndex % images.length], images[(currentIndex + 1) % images.length]];
  };

  const visibleImages = getVisibleImages();

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: visibleImages.length > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>
          {renderSalesText(visibleImages.map((img, i) => (
            <div key={`${currentIndex}-${i}`} onClick={() => setLightboxImage(img)} style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${accentColor}20`, cursor: 'zoom-in' }}>
              <motion.img initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} src={img} alt={salesPlainText(`Review ${i + 1}`)} style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
            </div>
          )))}
        </div>
        {renderSalesText(images.length > 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
            {renderSalesText(images.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ height: '8px', width: i === currentIndex ? '22px' : '8px', borderRadius: '4px', backgroundColor: i === currentIndex ? accentColor : `${accentColor}40`, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            )))}
          </div>
        ))}
      </div>
      {renderSalesText(lightboxImage && <ImageLightbox src={lightboxImage} alt="Review" onClose={() => setLightboxImage(null)} />)}
    </>
  );
};

// ===== TEMPLATE 12: GADGET 3 (Fullscreen BG Image Hero) =====
const Template12Gadget3 = ({ page }: TemplateProps) => {
  const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
  const hasTrackedCheckoutView = useRef(false);
  const isMobile = useIsMobile();

  const scrollToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
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
      category: "Sales Page - Gadget 12",
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
    const el = document.getElementById("checkout");
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [page.title, product, productPrice, productOriginalPrice, trackInitiateCheckout]);

  // Dynamic colors
  const c = {
    bg: page.background_color || '#0f172a',
    primary: page.primary_color || '#1a1a1a',
    accent: page.accent_color || '#ff4757',
    headline: page.headline_color || '#ffffff',
    button: page.button_color || '#ff4757',
    text: page.text_color || '#ffffff',
  };

  const darkenHex = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  // ===== TOP NAV BAR =====
  const renderTopBar = () => (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: c.primary || 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.accent}20`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
          {renderSalesText(page.title || 'GadgetStore')}
        </span>
        <a
          href={`tel:${(page.contact_phone_link || page.contact_phone || '').replace(/[^0-9+]/g, '')}`}
          style={{
            background: `linear-gradient(135deg, ${c.button}, ${darkenHex(c.button, -0.2)})`,
            color: 'white',
            border: 'none',
            padding: '8px 22px',
            borderRadius: '25px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            boxShadow: `0 2px 12px ${c.button}40`,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📞 {renderSalesText(page.contact_phone || '01XXXXXXXXX')}
        </a>
      </div>
    </div>
  );

  // ===== HERO IMAGE SLIDER =====
  const HeroImageSlider = ({ images }: { images: string[] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (images.length <= 1) return;
      sliderInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => { if (sliderInterval.current) clearInterval(sliderInterval.current); };
    }, [images.length]);

    if (images.length === 0) return null;

    return (
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', margin: '0 12px 24px' }}>
        <motion.img
          key={currentSlide}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={images[currentSlide]}
          alt={salesPlainText(`Product ${currentSlide + 1}`)}
          style={{ width: '100%', height: isMobile ? '380px' : '480px', objectFit: 'cover', display: 'block' }}
        />
        {renderSalesText(images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
            {renderSalesText(images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentSlide(i); if (sliderInterval.current) clearInterval(sliderInterval.current); }}
                style={{
                  width: i === currentSlide ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            )))}
          </div>
        ))}
      </div>
    );
  };

  // ===== HERO SECTION =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    const heroImages = page.hero_images?.filter(img => img && img.trim()) || [];
    const heroVideoUrl = page.hero_video_url;

    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg} 0%, #1e293b 50%, ${c.bg} 100%)`,
          padding: '40px 8px 36px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          {/* Animated Badge */}
          {renderSalesText(page.hero_badge_text && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: `${c.button}26`,
                  border: `1px solid ${c.button}4D`,
                  borderRadius: '25px',
                  padding: '6px 20px',
                  marginBottom: '20px',
                  animation: 'pulse12 2s infinite',
                }}
              >
                <span style={{ color: c.button, fontSize: '14px', fontWeight: 600 }}>
                  🔥 {renderSalesText(page.hero_badge_text)}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Headline with gradient highlighted text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: isMobile ? '28px' : '34px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.45,
              marginBottom: '14px',
              padding: '0 4px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              letterSpacing: '-0.3px',
            }}
          >
            {renderSalesText(page.hero_headline || 'আপনার প্রোডাক্টের আকর্ষণীয় হেডলাইন')}{renderSalesText(' ')}
            {renderSalesText(page.hero_subheadline && (
              <span
                style={{
                  background: `linear-gradient(135deg, ${c.button}, ${c.accent || '#ffde59'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {renderSalesText(page.hero_subheadline)}
              </span>
            ))}
          </motion.h1>

          {/* Description */}
          {renderSalesText(page.offer_details && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: '15px',
                color: '#b0bec5',
                lineHeight: 1.75,
                marginBottom: '20px',
                padding: '0 8px',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.offer_details)}
            </motion.p>
          ))}

          {/* Hero Images Slider */}
          {renderSalesText(heroImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <HeroImageSlider images={heroImages} />
            </motion.div>
          ))}

          {/* Hero Video */}
          {renderSalesText(heroVideoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', margin: '0 12px 24px' }}
            >
              <iframe loading="lazy"
                src={heroVideoUrl.replace('watch?v=', 'embed/')}
                style={{ width: '100%', height: isMobile ? '220px' : '280px', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          ))}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <button
              onClick={scrollToCheckout}
              style={{
                width: 'auto',
                margin: '0 auto',
                display: 'block',
                background: `linear-gradient(135deg, ${c.button}, ${darkenHex(c.button, -0.2)})`,
                color: 'white',
                border: 'none',
                padding: '12px 40px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 10px 30px ${c.button}66`,
                transition: 'all 0.3s',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 15px 35px ${c.button}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${c.button}66`;
              }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'এখনই অর্ডার করুন')} →
            </button>
          </motion.div>
        </div>

        {/* Pulse animation keyframes */}
        <style>{renderSalesText(`
          @keyframes pulse12 {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.03); }
          }
        `)}</style>
      </section>
    );
  };

  // ===== FEATURES SECTION =====
  const renderFeatures = () => {
    if (!page.show_features_section) return null;

    const featureItems: { icon: string; text: string; description?: string }[] = [];
    if (page.feature_points && Array.isArray(page.feature_points) && page.feature_points.length > 0) {
      (page.feature_points as any[]).forEach((fp: any) => {
        if (fp.text && fp.text.trim()) {
          featureItems.push({ icon: fp.icon || '✓', text: fp.text, description: fp.description });
        }
      });
    } else {
      for (let i = 1; i <= 6; i++) {
        const text = (page as any)[`feature_${i}_text`];
        const icon = (page as any)[`feature_${i}_icon`];
        const desc = (page as any)[`feature_${i}_description`];
        if (text && text.trim()) featureItems.push({ icon: icon || '✓', text, description: desc });
      }
    }

    if (featureItems.length === 0) return null;

    return (
      <section
        key="features"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg} 0%, #1e293b 100%)`,
          padding: '40px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '24px' }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: c.headline, marginBottom: '6px' }}>
              {renderSalesText(page.features_headline || 'কেন কিনবেন?')}
            </h2>
            {renderSalesText(page.features_subheadline && (
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                {renderSalesText(page.features_subheadline)}
              </p>
            ))}
          </motion.div>

          {/* Feature Images (if any) */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {renderSalesText(page.feature_section_images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={salesPlainText(`Feature ${i + 1}`)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                />
              )))}
            </div>
          ))}

          {/* Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            {renderSalesText(featureItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{renderSalesText(item.icon)}</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>{renderSalesText(item.text)}</h3>
                  {renderSalesText(item.description && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>{renderSalesText(item.description)}</p>
                  ))}
                </div>
              </motion.div>
            )))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ marginTop: '24px' }}
          >
            <button
              onClick={scrollToCheckout}
              style={{
                width: 'auto',
                margin: '0 auto',
                display: 'block',
                background: `linear-gradient(to right, ${c.button}, ${darkenHex(c.button, 0.3)})`,
                color: '#ffffff',
                border: 'none',
                padding: '12px 40px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: `0 8px 20px ${c.button}50`,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.cta_button_text || "🛒 এখনই অর্ডার করুন")}
            </button>
          </motion.div>
        </div>
      </section>
    );
  };

  // ===== EXTRA SECTIONS =====
  const renderExtraSection = (num: 1 | 2 | 3) => {
    const show = (page as any)[`show_extra_section_${num}`];
    if (!show) return null;
    const heading = (page as any)[`extra_section_${num}_heading`] || '';
    const points: string[] = (page as any)[`extra_section_${num}_points`] || [];
    const legacyPoints: string[] = [];
    if (points.length === 0) {
      for (let i = 1; i <= 6; i++) {
        const p = (page as any)[`extra_section_${num}_point_${i}`];
        if (p && p.trim()) legacyPoints.push(p);
      }
    }
    const allPoints = points.length > 0 ? points : legacyPoints;
    if (allPoints.length === 0 && !heading) return null;

    return (
      <section
        key={`extra-${num}`}
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '30px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {renderSalesText(heading && (
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: c.headline, textAlign: 'center', marginBottom: '16px' }}>
              {renderSalesText(heading)}
            </h2>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderSalesText(allPoints.map((point, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                }}
              >
                <span style={{ color: c.accent, fontWeight: 700, fontSize: '16px' }}>✓</span>
                {renderSalesText(point)}
              </div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== SPEC SECTION =====
  const renderSpecSection = () => {
    if (!page.show_spec_section) return null;
    const items: SpecItem[] = Array.isArray(page.spec_items) ? page.spec_items : [];
    if (items.length === 0) return null;

    return (
      <section
        key="spec"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '30px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: c.headline, textAlign: 'center', marginBottom: '16px' }}>
            {renderSalesText(page.spec_section_heading || 'স্পেসিফিকেশন')}
          </h2>
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {renderSalesText(items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>
                  {renderSalesText(item.label)}
                </div>
                <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '13px' }}>
                  {renderSalesText(item.value)}
                </div>
              </div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== REVIEWS SECTION =====
  const renderReviews = () => {
    if (!page.show_reviews_section) return null;
    const images = page.review_images || [];
    if (images.length === 0) return null;

    return (
      <section
        key="reviews"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, #1e293b, ${c.bg})`,
          padding: '30px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '20px' }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: c.headline }}>
              {renderSalesText(page.reviews_headline || 'কাস্টমার ফিডব্যাক')}
            </h2>
            {renderSalesText(page.reviews_subheadline && (
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                {renderSalesText(page.reviews_subheadline)}
              </p>
            ))}
          </motion.div>

          {/* Review Video */}
          {renderSalesText(page.review_video_url && (
            <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe loading="lazy"
                src={page.review_video_url.replace('watch?v=', 'embed/')}
                style={{ width: '100%', height: isMobile ? '200px' : '280px', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}

          <ReviewCarousel images={images} accentColor={c.accent} />
        </div>
      </section>
    );
  };

  // ===== SECTION RENDERER =====
  const sectionOrder = page.section_order || ['hero', 'video', 'gallery', 'features', 'extra1', 'extra2', 'extra3', 'spec', 'reviews', 'contact', 'checkout'];

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return renderHero();
      case 'video':
        if (!page.show_video_section || !page.video_url) return null;
        return (
          <div key="video" style={{ background: c.bg }}>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 15px' }}>
              <VideoSection page={page} />
            </div>
          </div>
        );
      case 'gallery':
        if (!page.show_gallery_section) return null;
        return (
          <div key="gallery" style={{ background: c.bg }}>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 15px' }}>
              <GallerySection page={page} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'features': return renderFeatures();
      case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtraSection(1);
      case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtraSection(2);
      case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtraSection(3);
      case 'spec': return renderSpecSection();
      case 'reviews': return renderReviews();
      case 'contact':
        if (!page.show_contact_section) return null;
        return (
          <div key="contact" style={{ background: c.bg }}>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 15px' }}>
              <ContactSection page={page} />
            </div>
          </div>
        );
      case 'checkout':
        if (!page.show_checkout_section) return null;
        return (
          <div key="checkout" style={{ background: c.bg }}>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 15px' }}>
              <CheckoutSection page={page} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif", background: c.bg, minHeight: '100vh' }}>
      {renderSalesText(renderTopBar())}
      {renderSalesText(sectionOrder.map((sectionId) => <SectionAppearance key={sectionId} page={page} section={sectionId}>{renderSection(sectionId)}</SectionAppearance>))}

      {/* Footer */}
      <div
        style={{
          padding: '30px 15px',
          textAlign: 'center',
          background: `linear-gradient(180deg, ${c.bg}, #000000)`,
          color: '#94a3b8',
          fontSize: '13px',
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <p>{renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}</p>
      </div>
    </div>
  );
};

export default Template12Gadget3;
