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

// ===== Review Carousel (Infinite Loop + Lightbox) =====
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
  const goPrev = () => { setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); startAutoplay(); };
  const goNext = () => { setCurrentIndex((prev) => (prev + 1) % images.length); startAutoplay(); };

  if (images.length === 0) return null;

  const getVisibleImages = () => {
    if (images.length === 1) return [images[0]];
    return [images[currentIndex % images.length], images[(currentIndex + 1) % images.length]];
  };

  const visibleImages = getVisibleImages();

  return (
    <>
      <div style={{ position: 'relative' }}>
        {renderSalesText(images.length > 2 && (
          <>
            <button onClick={goPrev} style={{ position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={goNext} style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        ))}
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
              <button key={i} onClick={() => goTo(i)} style={{ height: '8px', width: i === currentIndex % images.length ? '22px' : '8px', borderRadius: '4px', backgroundColor: i === currentIndex % images.length ? accentColor : `${accentColor}30`, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            )))}
          </div>
        ))}
      </div>
      {renderSalesText(lightboxImage && <ImageLightbox src={lightboxImage} alt="Review" onClose={() => setLightboxImage(null)} />)}
    </>
  );
};

// ===== Feature Image Carousel =====
const FeatureImageCarousel = ({ images, accentColor }: { images: string[]; accentColor: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % images.length); }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={{ marginBottom: '15px', position: 'relative', overflow: 'hidden', borderRadius: '15px' }}>
      <motion.div style={{ display: 'flex' }} animate={{ x: `-${currentIndex * 100}%` }} transition={{ duration: 0.5, ease: "easeInOut" }}>
        {renderSalesText(images.map((img, i) => (
          <div key={i} style={{ width: '100%', flexShrink: 0 }}>
            <img src={img} alt={salesPlainText(`Feature ${i + 1}`)} style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block', borderRadius: '15px' }} />
          </div>
        )))}
      </motion.div>
      {renderSalesText(images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          {renderSalesText(images.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} style={{ height: '8px', width: i === currentIndex ? '20px' : '8px', borderRadius: '4px', backgroundColor: i === currentIndex ? accentColor : `${accentColor}40`, border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          )))}
        </div>
      ))}
    </div>
  );
};

// ===== Hero Image Slider (Infinite Loop) =====
const HeroImageSlider = ({ images, alt, accentColor, isMobile }: { images: string[]; alt: string; accentColor: string; isMobile: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // For infinite loop: clone first image at the end
  const extendedImages = images.length > 1 ? [...images, images[0]] : images;

  const imgHeight = isMobile ? '400px' : '550px';

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex === images.length) {
      // At clone slide, wait for transition then jump to real first
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      // Re-enable transition after instant jump
      if (!isTransitioning) {
        const timeout = setTimeout(() => setIsTransitioning(true), 50);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, images.length, isTransitioning]);

  const goTo = (index: number) => { setIsTransitioning(true); setCurrentIndex(index); startAutoplay(); };
  const goPrev = () => { setIsTransitioning(true); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); startAutoplay(); };
  const goNext = () => { setIsTransitioning(true); setCurrentIndex((prev) => prev + 1); startAutoplay(); };

  const realIndex = currentIndex % images.length;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={salesPlainText(alt)}
        style={{
          width: '100%',
          maxHeight: imgHeight,
          objectFit: 'cover',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      {/* Slider */}
      <div style={{ overflow: 'hidden', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
          }}
        >
          {renderSalesText(extendedImages.map((img, i) => (
            <div key={i} style={{ width: '100%', flexShrink: 0 }}>
              <img
                src={img}
                alt={salesPlainText(`${alt} ${(i % images.length) + 1}`)}
                style={{
                  width: '100%',
                  height: imgHeight,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
          width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
      >‹</button>
      <button
        onClick={goNext}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
          width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
          fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
      >›</button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
        {renderSalesText(images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              height: '8px',
              width: i === realIndex ? '22px' : '8px',
              borderRadius: '4px',
              backgroundColor: i === realIndex ? accentColor : `${accentColor}40`,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        )))}
      </div>
    </div>
  );
};

// ===== TEMPLATE 11: SUPER FOOD 3 =====
const Template11SuperFood3 = ({ page }: TemplateProps) => {
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
      category: "Sales Page - SuperFood3 11",
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
    accent: page.accent_color || '#ffa502',
    headline: page.headline_color || '#ffffff',
    button: page.button_color || '#ff4757',
    text: page.text_color || '#ffffff',
    primary: page.primary_color || '#ff4757',
  };

  // Card styling constants
  const cardRadius = '20px';
  const sectionGap = '8px';
  const pagePadding = isMobile ? '8px' : '12px';

  // Helper: extract YouTube ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // ===== HERO SECTION =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg} 0%, #1e293b 100%)`,
          color: 'white',
          padding: isMobile ? '30px 15px' : '60px 25px',
          textAlign: 'center',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Offer Badge - Pulse animation */}
          {renderSalesText(page.hero_badge_text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginBottom: '15px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: c.primary,
                  color: 'white',
                  padding: '6px 15px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  animation: 'pulse-badge 2s infinite',
                }}
              >
                {renderSalesText(page.hero_badge_text)}
              </span>
            </motion.div>
          ))}

          {/* Countdown Timer */}
          {renderSalesText(page.show_countdown && <CountdownTimer page={page} colors={c} />)}

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: isMobile ? '26px' : '45px',
              lineHeight: 1.3,
              margin: '10px 0 20px',
              fontWeight: 700,
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              color: c.headline,
              padding: isMobile ? '0 10px' : '0 30px',
            }}
          >
            {renderSalesText(page.hero_headline || 'আপনার প্রিমিয়াম প্রোডাক্টের আকর্ষণীয় নাম দিন')}
          </motion.h1>

          {/* Short Description */}
          {renderSalesText(page.hero_subheadline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '15px',
                color: '#94a3b8',
                maxWidth: '600px',
                margin: '0 auto 30px',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                lineHeight: 1.6,
              }}
            >
              {renderSalesText(page.hero_subheadline)}
            </motion.p>
          ))}

          {/* Hero Image Slider */}
          {renderSalesText(page.hero_images && page.hero_images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginTop: '30px' }}
            >
              <HeroImageSlider
                images={page.hero_images}
                alt={salesPlainText(page.hero_headline || 'Product')}
                accentColor={c.accent}
                isMobile={isMobile}
              />
            </motion.div>
          ))}

          {/* Video in Hero */}
          {renderSalesText(page.show_video_section && page.video_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: '20px' }}
            >
              {renderSalesText((() => {
                const vid = getYoutubeId(page.video_url);
                if (vid) {
                  return (
                    <div style={{
                      position: 'relative', paddingBottom: '56.25%', height: 0,
                      borderRadius: '15px', overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    }}>
                      <iframe loading="lazy"
                        src={`https://www.youtube.com/embed/${vid}?rel=0`}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  );
                }
                return (
                  <div style={{
                    position: 'relative', paddingBottom: '56.25%', height: 0,
                    borderRadius: '15px', overflow: 'hidden',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  }}>
                    <video
                      src={page.video_url}
                      controls
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                );
              })())}
            </motion.div>
          ))}

          {/* Urgency Text + CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: '30px' }}
          >
            {/* Urgency Text above button */}
            {renderSalesText(page.cta_urgency_text && (
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: c.accent,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                marginBottom: '12px',
                animation: 'pulse-badge 2s infinite',
              }}>
                ⚡ {renderSalesText(page.cta_urgency_text)}
              </p>
            ))}
            <button
              onClick={scrollToCheckout}
              style={{
                display: isMobile ? 'block' : 'inline-block',
                background: `linear-gradient(45deg, ${c.primary}, ${c.primary}cc)`,
                color: 'white',
                padding: isMobile ? '16px 20px' : '18px 50px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '12px',
                margin: '0 auto',
                maxWidth: '300px',
                width: isMobile ? '100%' : 'auto',
                cursor: 'pointer',
                textAlign: 'center',
                border: 'none',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                boxShadow: `0 8px 25px ${c.primary}50`,
                transition: '0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {renderSalesText(page.cta_button_text || 'অর্ডার করুন')} →
            </button>
          </motion.div>
        </div>
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
          featureItems.push({ icon: fp.icon || '✅', text: fp.text, description: fp.description });
        }
      });
    } else {
      for (let i = 1; i <= 6; i++) {
        const text = (page as any)[`feature_${i}_text`];
        const icon = (page as any)[`feature_${i}_icon`];
        const desc = (page as any)[`feature_${i}_description`];
        if (text && text.trim()) {
          featureItems.push({ icon: icon || '✅', text, description: desc });
        }
      }
    }
    if (featureItems.length === 0) return null;

    return (
      <section
        key="features"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          padding: isMobile ? '30px 15px' : '40px 25px',
          background: `linear-gradient(180deg, ${c.bg} 0%, #1e293b 100%)`,
          color: 'white',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Feature images carousel */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <FeatureImageCarousel images={page.feature_section_images} accentColor={c.primary} />
          ))}
          {renderSalesText((!page.feature_section_images || page.feature_section_images.length === 0) && page.feature_section_image && (
            <div style={{ marginBottom: '15px' }}>
              <img
                src={page.feature_section_image}
                alt="Feature"
                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '15px', display: 'block' }}
              />
            </div>
          ))}

          <h2 style={{
            fontSize: isMobile ? '22px' : '28px',
            textAlign: 'center',
            marginBottom: '30px',
            color: c.headline,
            fontWeight: 700,
            fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          }}>
            {renderSalesText(page.features_headline || 'কেন আমাদের প্রোডাক্টটি সেরা?')}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '15px' : '25px',
          }}>
            {renderSalesText(featureItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'center' : 'center',
                  flexDirection: isMobile ? 'row' : 'column',
                  gap: '15px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: isMobile ? '15px' : '30px',
                  borderRadius: '15px',
                  textAlign: isMobile ? 'left' : 'center',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  fontSize: '24px',
                  color: c.primary,
                  minWidth: '40px',
                  textAlign: 'center',
                }}>
                  {renderSalesText(item.icon)}
                </span>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#ffffff',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}>
                    {renderSalesText(item.text)}
                  </h3>
                  {renderSalesText(item.description && (
                    <p style={{
                      margin: '4px 0 0',
                      fontSize: '13px',
                      color: '#94a3b8',
                      fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    }}>
                      {renderSalesText(item.description)}
                    </p>
                  ))}
                </div>
              </motion.div>
            )))}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                display: isMobile ? 'block' : 'inline-block',
                background: `linear-gradient(45deg, ${c.primary}, ${c.primary}cc)`,
                color: 'white',
                padding: isMobile ? '16px 20px' : '18px 50px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '12px',
                margin: '0 auto',
                maxWidth: '300px',
                width: isMobile ? '100%' : 'auto',
                cursor: 'pointer',
                textAlign: 'center',
                border: 'none',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                boxShadow: `0 8px 25px ${c.primary}50`,
                transition: '0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {renderSalesText(page.cta_button_text || 'অর্ডার করুন')} →
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ===== GALLERY SECTION =====
  const renderGallery = () => {
    if (!page.show_gallery_section) return null;
    const galleryImages = page.gallery_images || [];
    if (galleryImages.length === 0) return null;

    return (
      <section
        key="gallery"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, #1e293b, ${c.bg})`,
          padding: isMobile ? '30px 15px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            {renderSalesText(page.gallery_subtitle && (
              <p style={{ fontSize: '13px', color: c.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: 600, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
                {renderSalesText(page.gallery_subtitle)}
              </p>
            ))}
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
              {renderSalesText(page.gallery_title || 'গ্যালারি')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {renderSalesText(galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                }}
              >
                <img src={img} alt={salesPlainText(`Gallery ${i + 1}`)} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
              </motion.div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== SPEC SECTION =====
  const renderSpec = () => {
    if (!page.show_spec_section || !page.spec_items || page.spec_items.length === 0) return null;

    return (
      <section
        key="spec"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg}, #1e293b)`,
          padding: isMobile ? '30px 15px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: c.headline, textAlign: 'center', marginBottom: '25px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
            {renderSalesText(page.spec_section_heading || 'টেকনিক্যাল স্পেসিফিকেশন')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {renderSalesText(page.spec_items.map((item: SpecItem, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <p style={{ fontSize: '11px', color: c.accent, margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(item.label)}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(item.value)}</p>
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
    const hasImages = page.review_images && page.review_images.length > 0;
    const hasVideo = page.review_video_url;
    if (!hasImages && !hasVideo) return null;

    return (
      <section
        key="reviews"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, #1e293b, ${c.bg})`,
          padding: isMobile ? '30px 15px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '25px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
            {renderSalesText(page.reviews_headline || 'কাস্টমার রিভিউ')}
          </h2>

          {renderSalesText(hasVideo && (() => {
            const vid = getYoutubeId(page.review_video_url!);
            return vid ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '15px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                <iframe loading="lazy" src={`https://www.youtube.com/embed/${vid}?rel=0`} title="Review Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            ) : null;
          })())}

          {renderSalesText(hasImages && <ReviewCarousel images={page.review_images!} accentColor={c.accent} />)}
        </div>
      </section>
    );
  };

  // ===== EXTRA SECTIONS =====
  const renderExtraSection = (num: 1 | 2 | 3) => {
    const show = (page as any)[`show_extra_section_${num}`];
    if (!show) return null;

    const heading = (page as any)[`extra_section_${num}_heading`] || '';
    const pointsArr = (page as any)[`extra_section_${num}_points`] as string[] || [];
    const legacyPoints: string[] = [];
    if (!pointsArr || pointsArr.length === 0) {
      for (let i = 1; i <= 6; i++) {
        const p = (page as any)[`extra_section_${num}_point_${i}`];
        if (p && p.trim()) legacyPoints.push(p);
      }
    }
    const points = pointsArr.length > 0 ? pointsArr : legacyPoints;
    if (!heading && points.length === 0) return null;

    return (
      <section
        key={`extra${num}`}
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg}, #1e293b)`,
          padding: isMobile ? '30px 15px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {renderSalesText(heading && (
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: c.headline, textAlign: 'center', marginBottom: '20px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
              {renderSalesText(heading)}
            </h2>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {renderSalesText(points.map((point: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ fontSize: '18px', color: c.accent }}>✅</span>
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#ffffff', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
                  {renderSalesText(point)}
                </span>
              </motion.div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== CONTACT SECTION =====
  const renderContact = () => {
    if (!page.show_contact_section) return null;

    return (
      <section
        key="contact"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, #1e293b, ${c.bg})`,
          padding: isMobile ? '30px 15px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#ffffff', textAlign: 'center', marginBottom: '25px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
            {renderSalesText(page.contact_headline || 'যোগাযোগ করুন')}
          </h2>

          {renderSalesText(page.contact_subheadline && (
            <p style={{ fontSize: '15px', color: c.accent, textAlign: 'center', marginBottom: '20px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
              {renderSalesText(page.contact_subheadline)}
            </p>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href={page.contact_phone_link}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                background: c.primary, borderRadius: '12px', textDecoration: 'none', transition: 'transform 0.2s',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                <span style={{ fontSize: '18px' }}>📞</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>ফোন অর্ডার</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(page.contact_phone)}</p>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>কল করুন</span>
            </a>

            <a
              href={`https://wa.me/${(page.contact_whatsapp || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)', borderRadius: '12px', textDecoration: 'none', transition: 'transform 0.2s',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                <span style={{ fontSize: '18px' }}>💬</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>হোয়াটসঅ্যাপ</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(page.contact_whatsapp_text)}</p>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>মেসেজ করুন</span>
            </a>
          </div>

          {renderSalesText(page.contact_availability && (
            <div style={{ textAlign: 'center', marginTop: '18px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(page.contact_availability)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ===== CHECKOUT SECTION =====
  const renderCheckout = () => {
    if (!page.show_checkout_section) return null;

    return (
      <section
        key="checkout"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: `linear-gradient(180deg, ${c.bg}, #1e293b)`,
          padding: isMobile ? '20px 10px' : '40px 25px',
          borderRadius: cardRadius,
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CheckoutSection page={page} />
        </div>
      </section>
    );
  };

  // ===== SECTION ORDER RENDERING =====
  const sectionOrder = page.section_order || ['hero', 'features', 'gallery', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

  const sectionMap: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    video: () => null, // Video is embedded in hero
    gallery: renderGallery,
    features: renderFeatures,
    spec: renderSpec,
    reviews: renderReviews,
    contact: renderContact,
    extra1: () => isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtraSection(1),
    extra2: () => isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtraSection(2),
    extra3: () => isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtraSection(3),
    checkout: renderCheckout,
  };

  return (
    <div style={{ 
      fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif", 
      background: '#f0ebe3', 
      minHeight: '100vh',
      padding: pagePadding,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{renderSalesText(`
        @keyframes pulse-badge {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `)}</style>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: sectionGap,
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {renderSalesText(sectionOrder.map((sectionId) => {
          if (sectionId.startsWith('cs-')) return <SectionAppearance key={sectionId} page={page} section={sectionId}>{null}</SectionAppearance>;
          const renderer = sectionMap[sectionId];
          return renderer ? <SectionAppearance key={sectionId} page={page} section={sectionId}><div>{renderSalesText(renderer())}</div></SectionAppearance> : null;
        }))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 15px', textAlign: 'center',
        marginTop: sectionGap,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>
    </div>
  );
};

// ===== COUNTDOWN TIMER COMPONENT =====
const CountdownTimer = ({ page, colors }: { page: SalesPage; colors: any }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endDate = page.countdown_end_date
      ? new Date(page.countdown_end_date)
      : new Date(Date.now() + 86400000);

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [page.countdown_end_date]);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  const items = [
    { value: timeLeft.days, label: page.countdown_label_days || 'দিন' },
    { value: timeLeft.hours, label: page.countdown_label_hours || 'ঘণ্টা' },
    { value: timeLeft.minutes, label: page.countdown_label_minutes || 'মিনিট' },
    { value: timeLeft.seconds, label: page.countdown_label_seconds || 'সেকেন্ড' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{ marginBottom: '20px' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        maxWidth: '350px',
        margin: '0 auto',
      }}>
        {renderSalesText(items.map((item, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '10px 5px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <span style={{
              display: 'block', fontSize: '20px', fontWeight: 800, color: '#fff',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}>
              {renderSalesText(formatNum(item.value))}
            </span>
            <label style={{
              fontSize: '11px', color: '#cbd5e1', display: 'block',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}>
              {renderSalesText(item.label)}
            </label>
          </div>
        )))}
      </div>
    </motion.div>
  );
};

export default Template11SuperFood3;
