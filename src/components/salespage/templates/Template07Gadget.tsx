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

// ===== Countdown Timer (Dark Style) =====
const CountdownTimer = ({
  endDate,
  labels,
}: {
  endDate: string | null;
  labels: { days: string; hours: string; minutes: string; seconds: string };
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
        background: 'linear-gradient(180deg, #444, #222)',
        padding: '8px',
        borderRadius: '10px',
        minWidth: '70px',
        border: '1px solid #555',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '24px',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {renderSalesText(value.toString().padStart(2, '0'))}
      </span>
      <label
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          color: '#bbb',
          marginTop: '5px',
          display: 'block',
          letterSpacing: '1px',
        }}
      >
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

// ===== TEMPLATE 07: GADGET =====
const Template07Gadget = ({ page }: TemplateProps) => {
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
      category: "Sales Page - Gadget 07",
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
    bg: page.background_color || '#ffffff',
    primary: page.primary_color || '#1a1a1a',
    accent: page.accent_color || '#ffbe0b',
    headline: page.headline_color || '#d90429',
    button: page.button_color || '#d90429',
    text: page.text_color || '#2d3436',
  };

  const darkenHex = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
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
          background: c.bg,
          padding: '20px 15px',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            background: c.bg,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            textAlign: 'center',
            border: '1px solid #eee',
          }}
        >
          {/* ১. ডার্ক হেডার ব্যানার — ছোট টাইটেল + কাউন্টডাউন */}
          <div
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.primary}dd)`,
              color: '#ffffff',
              padding: '20px 10px',
            }}
          >
            {/* ছোট টাইটেল / ব্যাজ */}
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                margin: '0 0 15px 0',
                fontSize: '20px',
                fontWeight: 700,
                color: c.accent,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_badge_text || "⏰ অফার শেষ হতে সময় বাকি")}
            </motion.h3>

            {/* কাউন্টডাউন টাইমার */}
            {renderSalesText(page.show_countdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CountdownTimer
                  endDate={page.countdown_end_date}
                  labels={{
                    days: page.countdown_label_days || "Days",
                    hours: page.countdown_label_hours || "Hours",
                    minutes: page.countdown_label_minutes || "Minutes",
                    seconds: page.countdown_label_seconds || "Seconds",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* ২. কন্টেন্ট বডি — হোয়াইট এরিয়া */}
          <div style={{ padding: '25px 20px' }}>
            {/* মেইন হেডলাইন */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                color: c.headline,
                fontSize: '26px',
                fontWeight: 700,
                marginBottom: '8px',
                lineHeight: 1.3,
                fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              }}
            >
              {renderSalesText(page.hero_headline || "প্রিমিয়াম গ্যাজেট")}
            </motion.h1>

            {/* প্রোডাক্ট নেম ব্যাজ */}
            {renderSalesText(page.hero_subheadline && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  color: '#1b4d3e',
                  fontSize: '20px',
                  fontWeight: 600,
                  background: '#f0fff4',
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: '10px',
                  margin: '15px 0',
                  border: '1px dashed #2d6a4f',
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
                
              >{renderSalesText(page.hero_subheadline)}</motion.div>
            ))}

            {/* Price Display */}
            {renderSalesText(page.offer_price > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                style={{ marginTop: '10px', marginBottom: '5px' }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    background: `${c.headline}08`,
                    border: `1.5px dashed ${c.headline}40`,
                  }}
                >
                  {renderSalesText(page.original_price && page.original_price > page.offer_price && (
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: '#999',
                        fontSize: '1.1rem',
                      }}
                    >
                      {renderSalesText(page.price_unit)}{renderSalesText(page.original_price)}
                    </span>
                  ))}
                  <span
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: c.headline,
                    }}
                  >
                    {renderSalesText(page.price_unit)}{renderSalesText(page.offer_price)}
                  </span>
                  {renderSalesText(page.discount_text && (
                    <span
                      style={{
                        background: c.headline,
                        color: '#fff',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {renderSalesText(page.discount_text)}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* প্রোডাক্ট ইমেজ */}
            {renderSalesText(page.hero_images?.[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ margin: '20px 0' }}
              >
                <div
                  style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                    border: '1px solid #ddd',
                  }}
                >
                  <img
                    src={page.hero_images[0]}
                    alt={salesPlainText(page.hero_headline)}
                    style={{
                      width: '100%',
                      display: 'block',
                      transition: 'transform 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
              </motion.div>
            ))}

            {/* অর্ডার বাটন */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ marginTop: '10px' }}
            >
              <button
                onClick={scrollToCheckout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%',
                  background: `linear-gradient(to right, ${c.button}, ${darkenHex(c.button, 0.3)})`,
                  color: '#ffffff',
                  border: 'none',
                  padding: '18px',
                  fontSize: '22px',
                  fontWeight: 700,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: `0 10px 20px ${c.button}50`,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  animation: 'pulse07 2s infinite',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${c.button}, ${darkenHex(c.button, 0.3)})`;
                  e.currentTarget.style.boxShadow = `0 10px 20px ${c.button}50`;
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {renderSalesText(page.cta_button_text || "🛒 অর্ডার করতে ক্লিক করুন")}
              </button>
            </motion.div>
          </div>
        </motion.div>

        <style>{renderSalesText(`
          @keyframes pulse07 {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }
        `)}</style>
      </section>
    );
  };

  // ===== FEATURES SECTION (কেন কিনবেন) =====
  const renderFeatures = () => {
    if (!page.show_features_section) return null;

    // Use feature_points JSON array, fallback to individual fields
    const featureItems: { icon: string; text: string }[] = [];
    if (page.feature_points && Array.isArray(page.feature_points) && page.feature_points.length > 0) {
      (page.feature_points as any[]).forEach((fp: any) => {
        if (fp.text && fp.text.trim()) {
          featureItems.push({ icon: fp.icon || '✓', text: fp.text });
        }
      });
    } else {
      // Fallback to old feature_X_text fields
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
          padding: '20px 15px',
          background: c.bg,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: c.primary || '#800000',
            padding: '40px 25px',
            borderRadius: '20px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Title with golden underline */}
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
                background: c.accent || '#ffcc00',
                borderRadius: '2px',
                display: 'block',
              }}
            />
          </h2>

          {/* Feature Section Images */}
          {renderSalesText(page.feature_section_images && page.feature_section_images.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              {renderSalesText(page.feature_section_images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ marginBottom: idx < page.feature_section_images.length - 1 ? '10px' : '0' }}
                >
                  <img
                    src={img}
                    alt={salesPlainText(`Feature ${idx + 1}`)}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      display: 'block',
                      border: `1px solid rgba(255,255,255,0.15)`,
                    }}
                  />
                </motion.div>
              )))}
            </div>
          ))}

          {/* Single Feature Image (legacy) */}
          {renderSalesText(!page.feature_section_images?.length && page.feature_section_image && (
            <div style={{ marginBottom: '25px' }}>
              <img
                src={page.feature_section_image}
                alt="Feature"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  display: 'block',
                  border: `1px solid rgba(255,255,255,0.15)`,
                }}
              />
            </div>
          ))}

          {/* Feature List */}
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
                  e.currentTarget.style.borderColor = c.accent || '#ffcc00';
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
                    background: c.accent || '#ffcc00',
                    color: c.primary || '#800000',
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: `0 0 10px ${c.accent || '#ffcc00'}66`,
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

          {/* CTA Button */}
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
                e.currentTarget.style.background = c.accent || '#ffcc00';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${c.accent || '#ffcc00'}66`;
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

  // ===== SPECIFICATION SECTION (টেকনিক্যাল স্পেসিফিকেশন) =====
  const renderSpecification = () => {
    if (!(page as any).show_spec_section) return null;

    const specItems: SpecItem[] = Array.isArray((page as any).spec_items) ? (page as any).spec_items : [];
    if (specItems.length === 0) return null;

    const heading = (page as any).spec_section_heading || 'টেকনিক্যাল স্পেসিফিকেশন';

    // Find last item that should span full width (odd item if total is odd)
    const hasFullWidthLast = specItems.length % 2 !== 0;

    return (
      <section
        key="spec"
        style={{
          fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
          padding: '20px 15px',
          background: c.bg,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: c.primary || '#800000',
            padding: '40px 25px',
            borderRadius: '20px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Title with golden underline */}
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
            {renderSalesText(heading)}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: c.accent || '#ffcc00',
                borderRadius: '2px',
                display: 'block',
              }}
            />
          </h2>

          {/* 2-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {renderSalesText(specItems.map((item, index) => {
              const isLastAndFullWidth = hasFullWidthLast && index === specItems.length - 1;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    ...(isLastAndFullWidth ? { gridColumn: 'span 2' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = c.accent || '#ffcc00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: c.accent || '#ffcc00',
                      fontWeight: 500,
                      marginBottom: '4px',
                      fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    }}
                  >
                    {renderSalesText(item.label)}
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      color: '#fff',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                    }}
                  >
                    {renderSalesText(item.value)}
                  </span>
                </motion.div>
              );
            }))}
          </div>

          {/* CTA Button */}
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
                e.currentTarget.style.background = c.accent || '#ffcc00';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${c.accent || '#ffcc00'}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
              }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'এখনই অর্ডার করুন')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  };

  // ===== REVIEWS SECTION =====
  const renderReviews = () => {
    if (!page.show_reviews_section || !page.review_images?.length) return null;

    const getYoutubeId = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    const reviewVideoUrl = (page as any).review_video_url;
    const youtubeId = reviewVideoUrl ? getYoutubeId(reviewVideoUrl) : null;

    return (
      <section
        key="reviews"
        className="py-8 px-4"
        style={{
          background: c.bg,
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
            <span className="text-sm font-medium" style={{ color: c.headline }}>
              {renderSalesText(page.reviews_subheadline || "কাস্টমার ফিডব্যাক")}
            </span>
            <h2 className="text-xl font-bold mt-1" style={{ color: c.text }}>
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
                style={{ border: `2px solid ${c.headline}30`, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
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

          {/* Review Images */}
          <ReviewCarousel images={page.review_images} accentColor={c.headline} />

          {/* CTA */}
          <div className="text-center mt-6">
            <button
              onClick={scrollToCheckout}
              className="w-full max-w-[320px] mx-auto block py-3.5 rounded-full text-base font-extrabold transition-transform active:scale-95"
              style={{
                background: `linear-gradient(to right, ${c.button}, ${darkenHex(c.button, 0.3)})`,
                color: '#ffffff',
                boxShadow: `0 4px 15px ${c.button}50`,
              }}
            >
              {renderSalesText(page.cta_button_text || "🛒 অর্ডার করতে ক্লিক করুন")}
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
          padding: '20px 15px',
          background: c.bg,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: c.primary || '#800000',
            padding: '40px 25px',
            borderRadius: '20px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Title with golden underline */}
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
            {renderSalesText(heading || defaultHeadings[sectionNumber])}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: c.accent || '#ffcc00',
                borderRadius: '2px',
                display: 'block',
              }}
            />
          </h2>

          {/* Points List */}
          <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {renderSalesText(points.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = c.accent || '#ffcc00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div
                  style={{
                    background: c.accent || '#ffcc00',
                    color: c.primary || '#800000',
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: `0 0 10px ${c.accent || '#ffcc00'}66`,
                    marginTop: '2px',
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    lineHeight: 1.5,
                    fontWeight: 500,
                    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  }}
                  
                >{renderSalesText(point)}</span>
              </motion.div>
            )))}
          </div>

          {/* CTA Button */}
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
                e.currentTarget.style.background = c.accent || '#ffcc00';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              🛒 {renderSalesText(page.cta_button_text || 'অর্ডার করতে চাই')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  };

  const renderExtra1 = () => renderExtraSection(1);
  const renderExtra2 = () => renderExtraSection(2);
  const renderExtra3 = () => renderExtraSection(3);

  // ===== CHECKOUT SECTION =====
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
        style={{ background: c.bg, borderTop: `1px solid #eee` }}
      >
        <p style={{ color: '#999' }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </div>
    </div>
  );
};

export default Template07Gadget;
