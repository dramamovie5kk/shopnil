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
const ImageLightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          fontSize: '28px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}
      >
        ✕
      </button>
      <motion.img
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        src={src}
        alt={salesPlainText(alt)}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '8px',
          cursor: 'default',
        }}
      />
    </motion.div>
  );
};

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

  // Pause autoplay when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      startAutoplay();
    }
  }, [lightboxImage]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    startAutoplay();
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    startAutoplay();
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    startAutoplay();
  };

  if (images.length === 0) return null;

  // Show 2 images per view
  const getVisibleImages = () => {
    if (images.length === 1) return [images[0]];
    const idx1 = currentIndex % images.length;
    const idx2 = (currentIndex + 1) % images.length;
    return [images[idx1], images[idx2]];
  };

  const visibleImages = getVisibleImages();

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Navigation arrows */}
        {renderSalesText(images.length > 2 && (
          <>
            <button
              onClick={goPrev}
              style={{
                position: 'absolute',
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ‹
            </button>
            <button
              onClick={goNext}
              style={{
                position: 'absolute',
                right: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ›
            </button>
          </>
        ))}

        {/* Images grid */}
        <div style={{ display: 'grid', gridTemplateColumns: visibleImages.length > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>
          {renderSalesText(visibleImages.map((img, i) => (
            <div
              key={`${currentIndex}-${i}`}
              onClick={() => setLightboxImage(img)}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${accentColor}20`,
                cursor: 'zoom-in',
              }}
            >
              <motion.img
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={img}
                alt={salesPlainText(`Review ${i + 1}`)}
                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )))}
        </div>

        {/* Dots */}
        {renderSalesText(images.length > 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
            {renderSalesText(images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  height: '8px',
                  width: i === currentIndex % images.length ? '22px' : '8px',
                  borderRadius: '4px',
                  backgroundColor: i === currentIndex % images.length ? accentColor : `${accentColor}30`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            )))}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {renderSalesText(lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          alt="Review"
          onClose={() => setLightboxImage(null)}
        />
      ))}
    </>
  );
};

// ===== Feature Image Carousel =====
const FeatureImageCarousel = ({ images, accentColor }: { images: string[]; accentColor: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={{ marginBottom: '15px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      <motion.div
        style={{ display: 'flex' }}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {renderSalesText(images.map((img, i) => (
          <div key={i} style={{ width: '100%', flexShrink: 0 }}>
            <img
              src={img}
              alt={salesPlainText(`Feature ${i + 1}`)}
              style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block', borderRadius: '12px' }}
            />
          </div>
        )))}
      </motion.div>
      {renderSalesText(images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          {renderSalesText(images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                height: '8px',
                width: i === currentIndex ? '20px' : '8px',
                borderRadius: '4px',
                backgroundColor: i === currentIndex ? accentColor : `${accentColor}40`,
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


// ===== TEMPLATE 10: SUPER FOOD 2 =====
const Template10SuperFood2 = ({ page }: TemplateProps) => {
  const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
  const hasTrackedCheckoutView = useRef(false);
  const isMobile = useIsMobile();

  // Mobile-aware styles
  const sectionPadding = isMobile ? '0px' : '0px 10px';
  const sectionPaddingTop = isMobile ? '0px' : '10px 10px 0px';
  const cardRadius = isMobile ? '0px' : '24px';
  const cardRadiusSmall = isMobile ? '0px' : '16px';

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
      category: "Sales Page - SuperFood2 10",
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
    bg: page.background_color || '#065f46',
    accent: page.accent_color || '#22c55e',
    headline: page.headline_color || '#ffffff',
    button: page.button_color || '#16a34a',
    text: page.text_color || '#ffffff',
    primary: page.primary_color || '#047857',
  };

  // Helper: extract YouTube ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // ===== HERO SECTION (text only: badge, headline, description, CTA) =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f0f2f5',
          padding: sectionPaddingTop,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            position: 'relative',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Decorative leaf */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle, ${c.accent}20, transparent)`,
              borderRadius: '50%',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, padding: '50px 30px 40px' }}>
            {/* Badge */}
            {renderSalesText(page.hero_badge_text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '20px' }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: c.accent,
                    padding: '8px 20px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {renderSalesText(page.hero_badge_text)}
                </span>
              </motion.div>
            ))}

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: '32px',
                lineHeight: 1.3,
                color: c.headline,
                margin: '0 0 16px',
                fontWeight: 700,
                textAlign: 'center',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_headline || 'সুস্বাস্থ্য নিশ্চিত করুন')}
              {renderSalesText(page.discount_text && (
                <>
                  <br />
                  <span style={{ color: c.accent }}>
                    {renderSalesText(page.discount_text)}
                  </span>
                </>
              ))}
            </motion.h1>

            {/* Subheadline */}
            {renderSalesText(page.hero_subheadline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.85)',
                  textAlign: 'center',
                  marginBottom: '30px',
                  lineHeight: 1.6,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {renderSalesText(page.hero_subheadline)}
              </motion.p>
            ))}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <button
                onClick={scrollToCheckout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: c.accent,
                  color: '#ffffff',
                  padding: '16px 40px',
                  fontSize: '20px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 8px 25px ${c.accent}50`,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px ${c.accent}70`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${c.accent}50`;
                }}
              >
                {renderSalesText(page.cta_button_text || 'এখনই কিনুন')}
                <span style={{ fontSize: '20px' }}>→</span>
              </button>
            </motion.div>

            {/* Product Grid inside Hero */}
            {renderSalesText((() => {
              const heroGridImages = page.hero_images || [];
              const prices = page.gallery_product_prices || [];
              if (heroGridImages.length === 0) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginTop: '30px' }}
                >
                  {/* Section Title */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                      <div style={{ height: '2px', width: '40px', background: c.accent, borderRadius: '2px' }} />
                      <h2 style={{
                        fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0,
                        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                      }}>
                        {renderSalesText(page.gallery_title || 'আমাদের প্রডাক্ট সমূহ')}
                      </h2>
                      <div style={{ height: '2px', width: '40px', background: c.accent, borderRadius: '2px' }} />
                    </div>
                  </div>
                  {/* 2-column Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {renderSalesText(heroGridImages.map((img, i) => {
                      const itemPrice = prices[i] ?? page.offer_price;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer',
                          }}
                          onClick={scrollToCheckout}
                        >
                          <div style={{ position: 'relative' }}>
                            <img src={img} alt={salesPlainText(`Product ${i + 1}`)}
                              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                            />
                            {renderSalesText(itemPrice > 0 && (
                              <div style={{
                                position: 'absolute', bottom: '8px', left: '8px',
                                background: c.accent, color: '#ffffff',
                                padding: '4px 12px', borderRadius: '8px',
                                fontSize: '14px', fontWeight: 700,
                                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              }}>
                                {renderSalesText(page.price_unit || '৳')} {renderSalesText(itemPrice)}
                              </div>
                            ))}
                          </div>
                          <div style={{ padding: '10px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); scrollToCheckout(); }}
                              style={{
                                width: '100%', background: c.accent, color: '#ffffff',
                                padding: '10px', fontSize: '14px', fontWeight: 600,
                                borderRadius: '10px', border: 'none', cursor: 'pointer',
                                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                              }}
                            >
                              অর্ডার করুন
                            </button>
                          </div>
                        </motion.div>
                      );
                    }))}
                  </div>
                </motion.div>
              );
            })())}
          </div>
        </div>
      </section>
    );
  };

  // ===== GALLERY SECTION (simple image showcase, separate from hero product grid) =====
  const renderGallery = () => {
    if (!page.show_gallery_section) return null;
    const galleryImages = page.gallery_images || [];
    if (galleryImages.length === 0) return null;

    return (
      <section
        key="gallery"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '30px 20px',
          }}
        >
          {/* Section Heading */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {renderSalesText(page.gallery_subtitle && (
              <p style={{
                fontSize: '13px', color: c.accent, textTransform: 'uppercase',
                letterSpacing: '2px', marginBottom: '8px', fontWeight: 600,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}>
                {renderSalesText(page.gallery_subtitle)}
              </p>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ height: '2px', width: '40px', background: c.accent, borderRadius: '2px' }} />
              <h2 style={{
                fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}>
                {renderSalesText(page.gallery_title || 'গ্যালারি')}
              </h2>
              <div style={{ height: '2px', width: '40px', background: c.accent, borderRadius: '2px' }} />
            </div>
          </div>

          {/* Simple Image Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {renderSalesText(galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <img
                  src={img}
                  alt={salesPlainText(`Gallery ${i + 1}`)}
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                />
              </motion.div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== FEATURES SECTION (Template 07 style with Template 10 colors) =====
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
        if (text && text.trim()) {
          featureItems.push({ icon: '✓', text });
        }
      }
    }
    if (featureItems.length === 0) return null;

    return (
      <section
        key="features"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.primary || c.bg,
            padding: '40px 25px',
            borderRadius: cardRadius,
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Feature images carousel */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <FeatureImageCarousel images={page.feature_section_images} accentColor={c.accent} />
          ))}
          {renderSalesText((!page.feature_section_images || page.feature_section_images.length === 0) && page.feature_section_image && (
            <div style={{ marginBottom: '15px' }}>
              <img
                src={page.feature_section_image}
                alt="Feature"
                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
              />
            </div>
          ))}

          {/* Title with accent underline */}
          <h2
            style={{
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '30px',
              color: '#fff',
              position: 'relative',
              paddingBottom: '10px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.features_headline || 'কেন কিনবেন?')}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: c.accent,
                borderRadius: '2px',
                display: 'block',
              }}
            />
          </h2>

          {/* Feature List - T07 style cards */}
          <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {renderSalesText(featureItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px',
                  marginBottom: '18px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.borderColor = c.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Check Icon */}
                <div
                  style={{
                    background: c.accent,
                    color: c.primary || c.bg,
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: `0 0 10px ${c.accent}66`,
                    marginTop: '2px',
                  }}
                >
                  ✓
                </div>

                {/* Feature Text */}
                <span
                  style={{
                    fontSize: '18px',
                    lineHeight: 1.5,
                    fontWeight: 500,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(item.text)}
                </span>
              </motion.div>
            )))}
          </div>

          {/* CTA Button - T07 style black button */}
          <div style={{ textAlign: 'center', marginTop: '35px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: '#000000',
                color: '#ffffff',
                padding: '16px 40px',
                fontSize: '22px',
                fontWeight: 700,
                borderRadius: '50px',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = c.accent;
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${c.accent}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
              }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
            </button>
          </div>
        </motion.div>
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
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '30px 25px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: c.headline,
              textAlign: 'center',
              marginBottom: '20px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.spec_section_heading || 'টেকনিক্যাল স্পেসিফিকেশন')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {renderSalesText(page.spec_items.map((item: SpecItem, i: number) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    color: c.accent,
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(item.label)}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    margin: 0,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(item.value)}
                </p>
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

    const getYoutubeIdLocal = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    return (
      <section
        key="reviews"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '30px 25px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: c.headline,
              textAlign: 'center',
              marginBottom: '20px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.reviews_headline || 'কাস্টমার রিভিউ')}
          </h2>

          {renderSalesText(hasVideo && (
            <div style={{ marginBottom: '20px' }}>
              {renderSalesText((() => {
                const vid = getYoutubeIdLocal(page.review_video_url!);
                return vid ? (
                  <div
                    style={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `2px solid ${c.accent}30`,
                    }}
                  >
                    <iframe loading="lazy"
                      src={`https://www.youtube.com/embed/${vid}?rel=0`}
                      title="Review Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                ) : null;
              })())}
            </div>
          ))}

          {renderSalesText(hasImages && (
            <ReviewCarousel images={page.review_images!} accentColor={c.accent} />
          ))}
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
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '30px 25px',
          }}
        >
          {renderSalesText(heading && (
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: c.headline,
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(heading)}
            </h2>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {renderSalesText(points.map((point: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span style={{ fontSize: '18px', color: c.accent }}>✅</span>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: c.headline,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(point)}
                </span>
              </motion.div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== VIDEO SECTION =====
  const renderVideo = () => {
    if (!page.show_video_section || !page.video_url) return null;

    const youtubeIdVideo = getYoutubeId(page.video_url);

    return (
      <section
        key="video"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '25px',
          }}
        >
          {renderSalesText(page.video_title && (
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: c.headline,
                textAlign: 'center',
                marginBottom: '15px',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.video_title)}
            </h2>
          ))}

          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              borderRadius: '15px',
              overflow: 'hidden',
              border: `2px solid ${c.accent}30`,
            }}
          >
            {renderSalesText(youtubeIdVideo ? (
              <iframe loading="lazy"
                src={`https://www.youtube.com/embed/${youtubeIdVideo}?rel=0`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <video
                src={page.video_url}
                controls
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ))}
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
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: '30px 25px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: c.headline,
              textAlign: 'center',
              marginBottom: '20px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.contact_headline || 'যোগাযোগ করুন')}
          </h2>

          {renderSalesText(page.contact_subheadline && (
            <p
              style={{
                fontSize: '15px',
                color: c.accent,
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.contact_subheadline)}
            </p>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Phone */}
            <a
              href={page.contact_phone_link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: c.accent,
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'transform 0.2s',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '18px' }}>📞</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>ফোন অর্ডার</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(page.contact_phone)}</p>
              </div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                কল করুন
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${(page.contact_whatsapp || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'transform 0.2s',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '18px' }}>💬</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>হোয়াটসঅ্যাপ</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(page.contact_whatsapp_text)}</p>
              </div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                মেসেজ করুন
              </span>
            </a>
          </div>

          {renderSalesText(page.contact_availability && (
            <div style={{ textAlign: 'center', marginTop: '18px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
                <span
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(page.contact_availability)}
                </span>
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
          background: '#f0f2f5',
          padding: sectionPadding,
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${c.bg}, ${c.primary})`,
            borderRadius: cardRadius,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <CheckoutSection page={page} />
        </div>
      </section>
    );
  };

  // ===== SECTION ORDER RENDERING =====
  const sectionOrder = page.section_order || ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

  const sectionMap: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    video: renderVideo,
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
    <div style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif", background: '#f0f2f5', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;500;700&display=swap" rel="stylesheet" />

      {renderSalesText(sectionOrder.map((sectionId) => {
        if (sectionId.startsWith('cs-')) return <SectionAppearance key={sectionId} page={page} section={sectionId}>{null}</SectionAppearance>;
        const renderer = sectionMap[sectionId];
        return renderer ? <SectionAppearance key={sectionId} page={page} section={sectionId}><div>{renderSalesText(renderer())}</div></SectionAppearance> : null;
      }))}

      {/* Footer */}
      <div
        style={{
          padding: '30px 15px',
          textAlign: 'center',
          background: '#f0f2f5',
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>
    </div>
  );
};

export default Template10SuperFood2;
