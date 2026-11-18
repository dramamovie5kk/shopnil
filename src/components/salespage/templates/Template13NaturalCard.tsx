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

// ===== TEMPLATE 13: Natural Card (সবুজ কার্ভড কার্ড ডিজাইন) =====
const Template13NaturalCard = ({ page }: TemplateProps) => {
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
      category: "Sales Page - Natural Card 13",
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

  // Dynamic colors from editor
  const c = {
    bg: page.background_color || '#f0f0f0',
    primary: page.primary_color || '#044b1c',
    accent: page.accent_color || '#ffcc00',
    headline: page.headline_color || '#ffffff',
    button: page.button_color || '#ffcc00',
    text: page.text_color || '#ffffff',
  };

  const darkenHex = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  // ===== HERO SECTION - কার্ভড কার্ড ডিজাইন =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    const heroImages = page.hero_images?.filter(img => img && img.trim()) || [];

    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: isMobile ? 'auto' : '100vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: c.primary,
            borderRadius: isMobile ? '20px' : '24px',
            textAlign: 'center',
            color: c.text,
            paddingBottom: '60px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          }}
        >
          {/* হেডিং */}
          <div style={{ padding: '40px 25px 30px 25px' }}>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: isMobile ? '28px' : '34px',
                lineHeight: 1.3,
                fontWeight: 700,
                color: c.headline,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_headline || 'আপনার প্রোডাক্টের হেডলাইন')}
              {renderSalesText(page.hero_subheadline && (
                <>
                  {renderSalesText(' ')}
                  <span style={{ color: c.accent }}>{renderSalesText(page.hero_subheadline)}</span>
                </>
              ))}
            </motion.h2>
          </div>

          {/* ইমেজ - ডানে বামে মার্জিন সহ */}
          {renderSalesText(heroImages.length > 0 && (
            <HeroImageSlider images={heroImages} />
          ))}

          {/* CTA বাটন */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={scrollToCheckout}
              style={{
                backgroundColor: c.button,
                color: '#000',
                textDecoration: 'none',
                padding: '15px 50px',
                fontSize: isMobile ? '22px' : '26px',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'inline-block',
                marginTop: '40px',
                boxShadow: `0 6px 0px ${darkenHex(c.button, 0.3)}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 9px 0px ${darkenHex(c.button, 0.3)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 6px 0px ${darkenHex(c.button, 0.3)}`;
              }}
            >
              {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
            </button>
          </motion.div>
        </motion.div>
      </section>
    );
  };

  // ===== Hero Image Slider =====
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          margin: isMobile ? '0 40px' : '0 60px',
          height: isMobile ? '300px' : '380px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        <motion.img
          key={currentSlide}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={images[currentSlide]}
          alt={salesPlainText(`Product ${currentSlide + 1}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {renderSalesText(images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px',
          }}>
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
      </motion.div>
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
          background: c.bg,
          padding: '40px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: c.primary,
              marginBottom: '8px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}>
              {renderSalesText(page.features_headline || 'কি কি থাকছে?')}
            </h2>
            {renderSalesText(page.features_subheadline && (
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#666',
                marginBottom: '24px',
              }}>
                {renderSalesText(page.features_subheadline)}
              </p>
            ))}
          </motion.div>

          {/* Feature Section Images */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {renderSalesText(page.feature_section_images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ marginBottom: '12px' }}
                >
                  <img src={img} alt={salesPlainText(`Feature ${idx + 1}`)} style={{
                    width: '100%', borderRadius: '16px', 
                    border: `2px solid ${c.primary}20`,
                  }} />
                </motion.div>
              )))}
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {renderSalesText(featureItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: c.primary,
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}
              >
                <span style={{
                  fontSize: '28px',
                  minWidth: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${c.accent}30`,
                  borderRadius: '10px',
                }}>
                  {renderSalesText(item.icon)}
                </span>
                <div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: c.text,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}>
                    {renderSalesText(item.text)}
                  </span>
                  {renderSalesText(item.description && (
                    <p style={{
                      fontSize: '13px',
                      color: `${c.text}bb`,
                      marginTop: '2px',
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
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                backgroundColor: c.button,
                color: '#000',
                padding: '12px 40px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 4px 0px ${darkenHex(c.button, 0.3)}`,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ===== SPEC SECTION =====
  const renderSpecSection = () => {
    if (!page.show_spec_section) return null;
    const specItems = page.spec_items || [];
    if (specItems.length === 0) return null;

    return (
      <section
        key="spec"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '40px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: 700,
            color: c.primary,
            marginBottom: '20px',
          }}>
            {renderSalesText(page.spec_section_heading || 'স্পেসিফিকেশন')}
          </h2>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          }}>
            {renderSalesText(specItems.map((item: SpecItem, i: number) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: i < specItems.length - 1 ? '1px solid #eee' : 'none',
                background: i % 2 === 0 ? '#f9f9f9' : '#fff',
              }}>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>{renderSalesText(item.label)}</span>
                <span style={{ color: '#555', fontSize: '14px' }}>{renderSalesText(item.value)}</span>
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
    const reviewImages = page.review_images?.filter(img => img && img.trim()) || [];
    if (reviewImages.length === 0 && !page.review_video_url) return null;

    return (
      <section
        key="reviews"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '40px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: c.primary,
              marginBottom: '6px',
            }}>
              {renderSalesText(page.reviews_headline || 'কাস্টমার ফিডব্যাক')}
            </h2>
            {renderSalesText(page.reviews_subheadline && (
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#666',
                marginBottom: '20px',
              }}>
                {renderSalesText(page.reviews_subheadline)}
              </p>
            ))}
          </motion.div>

          {/* Review Video */}
          {renderSalesText(page.review_video_url && (
            <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden' }}>
              <iframe loading="lazy"
                src={page.review_video_url.replace('watch?v=', 'embed/')}
                style={{ width: '100%', height: isMobile ? '220px' : '280px', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}

          {/* Review Image Carousel */}
          {renderSalesText(reviewImages.length > 0 && (
            <ReviewCarousel images={reviewImages} accentColor={c.primary} />
          ))}
        </div>
      </section>
    );
  };

  // ===== EXTRA SECTIONS (1, 2, 3) =====
  const renderExtraSection = (num: 1 | 2 | 3) => {
    const show = (page as any)[`show_extra_section_${num}`];
    if (!show) return null;
    const heading = (page as any)[`extra_section_${num}_heading`] || '';
    const pointsArray = (page as any)[`extra_section_${num}_points`] || [];
    const points: string[] = [];

    if (Array.isArray(pointsArray) && pointsArray.length > 0) {
      pointsArray.forEach((p: string) => { if (p && p.trim()) points.push(p); });
    } else {
      for (let i = 1; i <= 6; i++) {
        const pt = (page as any)[`extra_section_${num}_point_${i}`];
        if (pt && pt.trim()) points.push(pt);
      }
    }

    if (points.length === 0 && !heading) return null;

    return (
      <section
        key={`extra${num}`}
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: c.bg,
          padding: '40px 15px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {renderSalesText(heading && (
            <h2 style={{
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: c.primary,
              marginBottom: '20px',
            }}>
              {renderSalesText(heading)}
            </h2>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {renderSalesText(points.map((pt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: c.primary,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: c.text,
                }}
              >
                <span style={{
                  fontSize: '18px',
                  minWidth: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${c.accent}30`,
                  borderRadius: '8px',
                }}>
                  ✅
                </span>
                <span style={{ fontSize: '15px', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>{renderSalesText(pt)}</span>
              </motion.div>
            )))}
          </div>
        </div>
      </section>
    );
  };

  // ===== SECTION ORDER RENDERER =====
  const sectionOrder = page.section_order || ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

  const renderSectionByKey = (key: string) => {
    switch (key) {
      case 'hero': return renderHero();
      case 'video':
        if (!page.show_video_section || !page.video_url) return null;
        return <div key="video" style={{ background: c.bg }}><VideoSection page={page} /></div>;
      case 'gallery':
        if (!page.show_gallery_section) return null;
        return <div key="gallery" style={{ background: c.bg }}><GallerySection page={page} onOrderClick={scrollToCheckout} /></div>;
      case 'features': return renderFeatures();
      case 'spec': return renderSpecSection();
      case 'reviews': return renderReviews();
      case 'contact':
        if (!page.show_contact_section) return null;
        return <div key="contact" style={{ background: c.bg }}><ContactSection page={page} /></div>;
      case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtraSection(1);
      case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtraSection(2);
      case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtraSection(3);
      case 'checkout':
        if (!page.show_checkout_section) return null;
        return <div key="checkout" id="checkout" style={{ background: c.bg }}><CheckoutSection page={page} /></div>;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />

      {renderSalesText(sectionOrder.map((key) => <SectionAppearance key={key} page={page} section={key}>{renderSectionByKey(key)}</SectionAppearance>))}

      {/* Footer */}
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          background: c.primary,
          color: `${c.text}99`,
          fontSize: '13px',
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <p>{renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}</p>
      </div>
    </div>
  );
};

export default Template13NaturalCard;
