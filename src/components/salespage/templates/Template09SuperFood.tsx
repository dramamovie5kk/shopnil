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
import GallerySection from "../GallerySection";
import { usePixelTracking } from "@/hooks/usePixelTracking";

interface TemplateProps {
  page: SalesPage;
}

// ===== Review Carousel =====
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
    <div style={{ marginBottom: '15px', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
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
              style={{
                width: '100%',
                maxHeight: '350px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '8px',
              }}
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

// ===== TEMPLATE 09: SUPER FOOD =====
const Template09SuperFood = ({ page }: TemplateProps) => {
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
      category: "Sales Page - SuperFood 09",
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
    bg: page.background_color || '#7d0022',
    accent: page.accent_color || '#2ecc71',
    headline: page.headline_color || '#ffffff',
    button: page.button_color || '#ffffff',
    text: page.text_color || '#ffffff',
    primary: page.primary_color || '#7d0022',
  };

  // Helper: extract YouTube ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // ===== HERO SECTION (Super Food Card) =====
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
          background: '#f0f2f5',
          padding: '10px 10px 0px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* হেডার টেক্সট */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '40px 30px 20px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                lineHeight: 1.4,
                color: c.headline,
                margin: 0,
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_headline || 'গ্যারান্টি সহকারে উচ্চরক্তচাপ ও ফ্যাটি লিভার কমাবে')}
            </h1>
          </motion.div>

          {/* ফ্রি ডেলিভারি ব্যাজ */}
          {renderSalesText(page.hero_badge_text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              style={{ textAlign: 'center', paddingBottom: '10px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: c.accent,
                  color: '#003311',
                  padding: '5px 20px',
                  borderRadius: '50px',
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  animation: 'pulse09 2s infinite',
                }}
              >
                {renderSalesText(page.hero_badge_text)}
              </span>
            </motion.div>
          ))}

          {/* ভিডিও সেকশন */}
          {renderSalesText(heroVideoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '0 30px',
                margin: '25px 0',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                  border: '3px solid rgba(255,255,255,0.2)',
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
              </div>
            </motion.div>
          ))}

          {/* প্রোডাক্ট ইমেজ (ভিডিও না থাকলে) */}
          {renderSalesText(!heroVideoUrl && page.hero_images?.[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '0 30px', margin: '25px 0' }}
            >
              <div
                style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                  border: '3px solid rgba(255,255,255,0.2)',
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

          {/* ফুটার কন্টেন্ট: সাবহেডলাইন + CTA বাটন */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: '20px 30px 50px',
              textAlign: 'center',
            }}
          >
            {/* শর্ট টাইটেল */}
            {renderSalesText(page.hero_subheadline && (
              <p
                style={{
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '30px',
                  fontWeight: 500,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
              >
                {renderSalesText(page.hero_subheadline)}
              </p>
            ))}

            {/* CTA বাটন */}
            <button
              onClick={scrollToCheckout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: c.button,
                color: c.bg,
                textDecoration: 'none',
                padding: '18px 45px',
                fontSize: '24px',
                fontWeight: 700,
                borderRadius: '100px',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 15px 25px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
              }}
            >
              {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
              <span
                style={{
                  marginLeft: '12px',
                  background: c.bg,
                  color: 'white',
                  width: '35px',
                  height: '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: '18px',
                }}
              >
                🛒
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pulse Animation */}
        <style>{renderSalesText(`
          @keyframes pulse09 {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
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
          featureItems.push({ icon: fp.icon || '✅', text: fp.text, description: fp.description });
        }
      });
    } else {
      for (let i = 1; i <= 6; i++) {
        const text = (page as any)[`feature_${i}_text`];
        if (text && text.trim()) {
          featureItems.push({ icon: '✅', text });
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            backgroundColor: c.bg,
            color: '#ffffff',
            padding: '20px',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* ফিচার সেকশন ক্যারোসেল - হেডিং এর উপরে */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <FeatureImageCarousel images={page.feature_section_images} accentColor={c.accent} />
          ))}
          {/* Fallback: single image */}
          {renderSalesText((!page.feature_section_images || page.feature_section_images.length === 0) && page.feature_section_image && (
            <div style={{ marginBottom: '15px' }}>
              <img
                src={page.feature_section_image}
                alt="Feature"
                style={{
                  width: '100%',
                  maxHeight: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </div>
          ))}

          {/* হেডার টাইটেল - গ্রিন কালার */}
          <h2
            style={{
              color: c.accent,
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: '10px',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            {renderSalesText(page.features_headline || 'কেন বেছে নেবেন?')}
          </h2>

          {/* জিগজ্যাগ ডিভাইডার */}
          <div
            style={{
              width: '150px',
              height: '10px',
              margin: '15px auto',
              backgroundImage: `linear-gradient(135deg, transparent 25%, #fff 25%, #fff 50%, transparent 50%, transparent 75%, #fff 75%, #fff 100%), 
                                linear-gradient(225deg, transparent 25%, #fff 25%, #fff 50%, transparent 50%, transparent 75%, #fff 75%, #fff 100%)`,
              backgroundSize: '15px 15px',
              opacity: 0.8,
            }}
          />

          {/* ফিচার লিস্ট */}
          <div style={{ textAlign: 'left', margin: '20px 0' }}>
            {renderSalesText(featureItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  borderBottom: i < featureItems.length - 1 ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
                  padding: '12px 0',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    marginRight: '15px',
                    flexShrink: 0,
                    marginTop: '5px',
                    fontSize: '18px',
                  }}
                >
                  {renderSalesText(item.icon)}
                </span>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    margin: 0,
                    color: '#ffffff',
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderSalesText(item.text)}
                </p>
              </motion.div>
            )))}
          </div>

          {/* অর্ডার বাটন */}
          <button
            onClick={scrollToCheckout}
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: 'white',
              border: '3px solid #ffffff',
              padding: '12px 30px',
              fontSize: '22px',
              fontWeight: 700,
              borderRadius: '50px',
              textDecoration: 'none',
              marginTop: '20px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = c.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'white';
            }}
          >
            {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}{renderSalesText(' ')}
            <span style={{ marginLeft: '10px', fontSize: '18px' }}>🛒</span>
          </button>
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
          background: '#f0f2f5',
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
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
                    color: c.headline,
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
                      border: '2px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <iframe loading="lazy"
                      src={`https://www.youtube.com/embed/${vid}?rel=0`}
                      title="Review Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        border: 'none',
                      }}
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
                  borderRadius: '10px',
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
              border: '3px solid rgba(255,255,255,0.2)',
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

  // ===== GALLERY SECTION =====
  const renderGallery = () => {
    if (!page.show_gallery_section) return null;
    return (
      <div key="gallery" style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
        <GallerySection page={page} onOrderClick={scrollToCheckout} />
      </div>
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
            {/* Phone Button */}
            <a
              href={page.contact_phone_link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
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

            {/* WhatsApp Button */}
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

          {/* Availability */}
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
          padding: '0px 10px',
        }}
      >
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
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
        return renderer ? <SectionAppearance key={sectionId} page={page} section={sectionId}><div style={{ marginTop: '4px' }}>{renderSalesText(renderer())}</div></SectionAppearance> : null;
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

export default Template09SuperFood;
