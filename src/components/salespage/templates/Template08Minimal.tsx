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

interface TemplateProps {
  page: SalesPage;
}

// ===== Countdown Timer (Minimal Style) =====
const CountdownTimer = ({
  endDate,
  labels,
  accentColor,
}: {
  endDate: string | null;
  labels: { days: string; hours: string; minutes: string; seconds: string };
  accentColor: string;
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const end = endDate ? new Date(endDate).getTime() : Date.now() + 24 * 60 * 60 * 1000;
      const diff = Math.max(0, end - Date.now());
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

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div
      style={{
        background: '#f8f8f8',
        padding: '8px 4px',
        borderRadius: '8px',
        minWidth: '60px',
        textAlign: 'center',
        border: '1px solid #e5e5e5',
      }}
    >
      <span style={{ display: 'block', fontSize: '22px', fontWeight: 700, color: accentColor, lineHeight: 1 }}>
        {renderSalesText(value.toString().padStart(2, '0'))}
      </span>
      <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', marginTop: '4px', display: 'block', letterSpacing: '0.5px' }}>
        {renderSalesText(label)}
      </label>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
      <TimeUnit value={timeLeft.days} label={labels.days} />
      <TimeUnit value={timeLeft.hours} label={labels.hours} />
      <TimeUnit value={timeLeft.minutes} label={labels.minutes} />
      <TimeUnit value={timeLeft.seconds} label={labels.seconds} />
    </div>
  );
};

// ===== Review Carousel (from Template 05) =====
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
              <div className="grid grid-cols-2 gap-2">
                {renderSalesText(slideImages.map((img, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${accentColor}20` }}
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
                backgroundColor: i === currentIndex ? accentColor : `${accentColor}30`,
              }}
            />
          )))}
        </div>
      ))}
    </div>
  );
};

// ===== TEMPLATE 08: MINIMAL GADGET =====
const Template08Minimal = ({ page }: TemplateProps) => {
  const { trackAddToCart, trackInitiateCheckout, trackPageView } = usePixelTracking();
  const hasTrackedCheckoutView = useRef(false);

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
      category: "Sales Page - Minimal 08",
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

  // Dynamic colors — promo card palette (matching user's design)
  const c = {
    bg: page.background_color || '#fdfde0',
    primary: page.primary_color || '#f39c12',
    accent: page.accent_color || '#e67e22',
    headline: page.headline_color || '#333333',
    button: page.button_color || '#ff0000',
    text: page.text_color || '#333333',
  };

  // Helper: extract YouTube ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // ===== HERO SECTION (Promo Card Design) =====
  const renderHero = () => {
    if (!page.show_hero_section) return null;
    if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={scrollToCheckout} />;

    const heroVideoUrl = page.hero_video_url;
    const youtubeId = heroVideoUrl ? getYoutubeId(heroVideoUrl) : null;

    return (
      <section
        key="hero"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f5f5f5',
          padding: '10px',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: c.bg,
            border: `2px solid ${c.accent}`,
            borderRadius: '15px',
            overflow: 'hidden',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}
        >
          {/* ===== হেডার সেকশন (Orange Header) ===== */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: c.primary,
              padding: '20px 15px',
              color: '#fff',
            }}
          >
            <h1
              style={{
                fontSize: '22px',
                lineHeight: 1.4,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_headline || 'প্রোমোশনাল অফার')}
            </h1>
          </motion.div>

          {/* ===== কন্টেন্ট সেকশন ===== */}
          <div style={{ padding: '15px' }}>
            {/* টাইটেল (গাঢ় কালার) */}
            {renderSalesText(page.hero_subheadline && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    color: c.headline,
                    marginBottom: '4px',
                    fontWeight: 600,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                  
                >{renderSalesText(page.hero_subheadline)}</p>
              </motion.div>
            ))}
            {/* সাবটাইটেল (হাইলাইট কালার) */}
            {renderSalesText(page.hero_badge_text && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    color: c.text,
                    display: 'block',
                    marginTop: '5px',
                    marginBottom: '10px',
                    fontWeight: 700,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                  
                >{renderSalesText(page.hero_badge_text)}</span>
              </motion.div>
            ))}

            {/* ভিডিও */}
            {renderSalesText(heroVideoUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  margin: '15px 0',
                  borderRadius: '10px',
                  border: '4px solid #000',
                  background: '#000',
                }}
              >
                {renderSalesText(youtubeId ? (
                  <iframe loading="lazy"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title="Product Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : (
                  <video
                    src={heroVideoUrl}
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </motion.div>
            ))}

            {/* প্রোডাক্ট ইমেজ (ভিডিও না থাকলে) */}
            {renderSalesText(!heroVideoUrl && page.hero_images?.[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                style={{ margin: '15px 0' }}
              >
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${c.accent}`,
                  }}
                >
                  <img
                    src={page.hero_images[0]}
                    alt={salesPlainText(page.hero_headline)}
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              </motion.div>
            ))}

            {/* অফার বক্স */}
            {renderSalesText(page.offer_details && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  border: `2px solid ${c.accent}`,
                  backgroundColor: 'transparent',
                  margin: '15px auto',
                  padding: '20px 10px',
                  borderRadius: '12px',
                  width: '90%',
                }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: 1.8,
                    color: '#000',
                    margin: 0,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                  
                >{renderSalesText(page.offer_details)}</p>
              </motion.div>
            ))}

            {/* অর্ডার বাটন */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={scrollToCheckout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.button,
                  color: 'white',
                  padding: '12px 30px',
                  fontSize: '22px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderRadius: '50px',
                  margin: '10px 0 20px 0',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 15px ${c.button}66`,
                  width: '85%',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg
                  style={{ marginRight: '12px', fill: 'white', width: '24px', height: '24px' }}
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  // ===== FEATURES SECTION (Product Card Style) =====
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

    // Feature card bg color (light green default like the HTML)
    const featureCardBg = page.feature_card_bg_color || '#e9f9e6';
    const featureIconBg = page.feature_icon_bg_color || c.primary;

    return (
      <section
        key="features"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          background: '#f4f4f4',
          padding: '10px',
        }}
      >
        <div
          style={{
            maxWidth: '450px',
            margin: '0 auto',
            background: featureCardBg,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '2px solid #fff',
          }}
        >
          {/* প্রোডাক্ট ইমেজ */}
          {renderSalesText((() => {
            const featureImage = (page as any).feature_section_image || page.hero_images?.[0] || page.gallery_images?.[0] || page.products?.image_url;
            return featureImage ? (
              <div style={{ width: '100%', lineHeight: 0 }}>
                <img
                  src={featureImage}
                  alt={salesPlainText(page.features_headline || 'Product')}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ) : null;
          })())}

          {/* অরেঞ্জ হেডার ব্যানার */}
          <div
            style={{
              backgroundColor: featureIconBg,
              color: 'white',
              textAlign: 'center',
              padding: '15px 10px',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.features_headline || 'কেন বেছে নেবেন?')}
          </div>

          {/* ফিচার লিস্ট */}
          <div>
            {renderSalesText(featureItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: index < featureItems.length - 1 ? '1px solid #d1e7cf' : 'none',
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: 600,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {/* চেকবক্স আইকন */}
                <span
                  style={{
                    backgroundColor: featureIconBg,
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span>{renderSalesText(item.text)}</span>
              </motion.div>
            )))}
          </div>

          {/* অর্ডার বাটন */}
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                backgroundColor: c.button,
                color: 'white',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px 40px',
                borderRadius: '50px',
                fontSize: '22px',
                fontWeight: 700,
                transition: 'transform 0.2s, background-color 0.2s',
                boxShadow: `0 4px 10px ${c.button}4D`,
                width: '90%',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg
                style={{ marginRight: '12px', fill: 'white', width: '24px', height: '24px' }}
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ===== SPECIFICATION SECTION =====
  const renderSpecification = () => {
    if (!(page as any).show_spec_section) return null;
    const specItems: SpecItem[] = Array.isArray((page as any).spec_items) ? (page as any).spec_items : [];
    if (specItems.length === 0) return null;
    const heading = (page as any).spec_section_heading || 'স্পেসিফিকেশন';

    return (
      <section
        key="spec"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          padding: '30px 16px',
          background: c.bg,
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: c.headline,
              marginBottom: '20px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(heading)}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            {renderSalesText(specItems.map((item, index) => {
              const isLastOdd = specItems.length % 2 !== 0 && index === specItems.length - 1;
              return (
                <div
                  key={index}
                  style={{
                    background: '#f9f9f9',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                    ...(isLastOdd ? { gridColumn: 'span 2' } : {}),
                  }}
                >
                  <span style={{ fontSize: '11px', color: c.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {renderSalesText(item.label)}
                  </span>
                  <p style={{ fontSize: '15px', color: c.headline, fontWeight: 600, marginTop: '2px', lineHeight: 1.3 }}>
                    {renderSalesText(item.value)}
                  </p>
                </div>
              );
            }))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: c.button,
                color: '#fff',
                padding: '14px 36px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'এখনই অর্ডার করুন')}
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ===== REVIEWS SECTION (Template 05 Style) =====
  const renderReviews = () => {
    const hasReviewImages = page.review_images && page.review_images.length > 0;
    const reviewVideoUrl = (page as any).review_video_url;
    if (!page.show_reviews_section || (!hasReviewImages && !reviewVideoUrl)) return null;

    const getYoutubeId = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    const youtubeId = reviewVideoUrl ? getYoutubeId(reviewVideoUrl) : null;

    return (
      <section
        key="reviews"
        className="py-8 px-4"
        style={{
          background: '#f9f9f9',
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        }}
      >
        <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <span className="text-sm font-medium" style={{ color: c.accent }}>
              {renderSalesText(page.reviews_subheadline || "কাস্টমার ফিডব্যাক")}
            </span>
            <h2 className="text-xl font-bold mt-1" style={{ color: c.headline }}>
              {renderSalesText(page.reviews_headline || "গ্রাহকদের মতামত")}
            </h2>
          </motion.div>

          {/* Review Video */}
          {renderSalesText(reviewVideoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #eee', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                {renderSalesText(youtubeId ? (
                  <div className="aspect-video">
                    <iframe loading="lazy"
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
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

          {/* Review Images Carousel */}
          {renderSalesText(hasReviewImages && (
            <ReviewCarousel images={page.review_images!} accentColor={c.accent} />
          ))}

          {/* CTA */}
          <div className="text-center mt-6">
            <button
              onClick={scrollToCheckout}
              className="w-full max-w-[320px] mx-auto block py-3.5 rounded-xl text-base font-extrabold transition-all active:scale-95"
              style={{
                background: c.button,
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.cta_button_text || "🛒 অর্ডার করুন")}
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ===== CONTACT SECTION =====
  const renderContact = () => {
    if (!page.show_contact_section) return null;
    return (
      <div key="contact" style={{ background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
        <ContactSection page={page} />
      </div>
    );
  };

  // ===== VIDEO SECTION =====
  const renderVideo = () => {
    if (!page.show_video_section || !page.video_url) return null;
    return (
      <div key="video" style={{ background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
        <VideoSection page={page} />
      </div>
    );
  };

  // ===== GALLERY SECTION =====
  const renderGallery = () => {
    if (!page.show_gallery_section) return null;
    return (
      <div key="gallery" style={{ background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
        <GallerySection page={page} onOrderClick={scrollToCheckout} />
      </div>
    );
  };

  // ===== EXTRA SECTIONS =====
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

    const defaultHeadings: Record<number, string> = {
      1: 'কেন আমাদের উপর আস্থা রাখবেন?',
      2: 'আমাদের বিশেষত্ব',
      3: 'গ্রাহক সুবিধা',
    };

    return (
      <section
        key={`extra${sectionNumber}`}
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          padding: '30px 16px',
          background: sectionNumber % 2 === 0 ? c.bg : '#f9f9f9',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: c.headline,
              marginBottom: '20px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(heading || defaultHeadings[sectionNumber])}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {renderSalesText(points.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#fff',
                  borderRadius: '10px',
                  border: '1px solid #eee',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; }}
              >
                <span
                  style={{
                    background: c.accent,
                    color: '#fff',
                    width: '22px',
                    height: '22px',
                    minWidth: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  ✓
                </span>
                <span
                  style={{ fontSize: '16px', fontWeight: 500, color: c.headline, lineHeight: 1.5 }}
                  
                >{renderSalesText(point)}</span>
              </motion.div>
            )))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={scrollToCheckout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: c.button,
                color: '#fff',
                padding: '14px 36px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderExtra1 = () => renderExtraSection(1);
  const renderExtra2 = () => renderExtraSection(2);
  const renderExtra3 = () => renderExtraSection(3);

  // ===== CHECKOUT SECTION (Template 05 Style) =====
  const renderCheckout = () => {
    if (!page.show_checkout_section) return null;
    return (
      <div key="checkout" style={{ background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
        <CheckoutSection page={page} />
      </div>
    );
  };

  // ===== SECTION ORDER RENDERER =====
  const sectionOrder = page.section_order?.length > 0
    ? page.section_order
    : ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return renderHero();
      case 'video': return renderVideo();
      case 'gallery': return renderGallery();
      case 'features': return renderFeatures();
      case 'spec': return renderSpecification();
      case 'reviews': return renderReviews();
      case 'contact': return renderContact();
      case 'extra1': return isExtraDesign(page.template_styles?.extra1?.design) ? <ExtraSection key="extra1" page={page} number={1} /> : renderExtra1();
      case 'extra2': return isExtraDesign(page.template_styles?.extra2?.design) ? <ExtraSection key="extra2" page={page} number={2} /> : renderExtra2();
      case 'extra3': return isExtraDesign(page.template_styles?.extra3?.design) ? <ExtraSection key="extra3" page={page} number={3} /> : renderExtra3();
      case 'checkout': return renderCheckout();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: c.bg, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
      {renderSalesText(sectionOrder.map(sectionId => (
        <SectionAppearance key={sectionId} page={page} section={sectionId}><div>{renderSalesText(renderSection(sectionId))}</div></SectionAppearance>
      )))}

      {/* Footer */}
      <div
        className="py-8 text-center text-sm"
        style={{ background: c.bg, borderTop: '1px solid #eee' }}
      >
        <p style={{ color: '#999' }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>
    </div>
  );
};

export default Template08Minimal;
