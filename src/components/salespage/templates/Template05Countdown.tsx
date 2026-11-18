import SectionAppearance from '../SectionAppearance';
import ExtraSection from '../ExtraSection';
import { isExtraDesign } from '@/lib/extraSectionDesigns';
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { ArrowRight, Phone, MessageCircle, CheckCircle, Star, Truck, Shield, Package } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import SharedContactSection from "../ContactSection";
import SharedReviewsSection from "../SharedReviewsSection";
import SharedFeaturesSection from "../SharedFeaturesSection";
import SharedGallerySection from "../SharedGallerySection";
import { usePixelTracking } from "@/hooks/usePixelTracking";

interface TemplateProps {
  page: SalesPage;
}

// Helper: lighten a hex color
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

// Helper: darken a hex color
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - percent)));
  const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - percent)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

// Template 05: Health Template - Fully dynamic colors from admin
const Template05Countdown = ({ page }: TemplateProps) => {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { trackPageView } = usePixelTracking();

  useEffect(() => {
    trackPageView(page.title, {
      product_id: page.product_id || page.id,
      product_name: page.title,
      price: page.offer_price,
      quantity: 1,
      currency: 'BDT',
    });
  }, [page.id]);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // All colors derived from admin settings
  const baseBtn = page.button_color || page.accent_color || '#e8c84a';
  const colors = {
    primary: page.primary_color || '#0d6b1e',
    accent: page.accent_color || '#1a8a2e',
    background: page.background_color || '#0a4a15',
    text: page.text_color || '#ffffff',
    headline: (page as any).headline_color || '#ffff00',
    button: baseBtn,
    buttonLight: lightenColor(baseBtn, 0.2),
    buttonDark: darkenColor(baseBtn, 0.25),
    border: darkenColor((page as any).headline_color || '#ffff00', 0.15),
    cardBg: darkenColor(page.primary_color || '#0d6b1e', 0.15),
  };

  const sections: Record<string, React.ReactNode> = {
    hero: page.show_hero_section && (page.template_styles?.hero?.design ? <SharedHeroSection page={page} onOrderClick={scrollToCheckout} /> : <HeroHealth page={page} colors={colors} onOrderClick={scrollToCheckout} />),
    ...Object.fromEntries(([1, 2, 3] as const).map(number => [`extra${number}`, page[`show_extra_section_${number}`] && (isExtraDesign(page.template_styles?.[`extra${number}`]?.design) ? <ExtraSection page={page} number={number} /> : <ExtraBenefitsSection page={page} colors={colors} sectionNumber={number} onOrderClick={scrollToCheckout} />)])),
    gallery: page.show_gallery_section && page.gallery_images?.length > 0 && (page.template_styles?.gallery?.design ? <SharedGallerySection page={page} onOrderClick={scrollToCheckout} /> : <GallerySection page={page} colors={colors} onOrderClick={scrollToCheckout} />),
    features: page.show_features_section && (page.template_styles?.features?.design ? <SharedFeaturesSection page={page} /> : <FeaturesSection page={page} colors={colors} />),
    reviews: page.show_reviews_section && (page.review_images?.length > 0 || page.review_video_url) && <SharedReviewsSection page={page} legacyColors={{ sectionBg: colors.background, headingText: colors.text, subtitleText: colors.headline, imageBorder: colors.border, videoBorder: colors.border }} />,
    contact: page.show_contact_section && <SharedContactSection page={page} />,
    checkout: <div ref={checkoutRef}>{page.show_checkout_section && <CheckoutSection page={page} />}</div>,
  };
  const order = page.section_order?.length ? page.section_order : Object.keys(sections);
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
      {order.map(id => <SectionAppearance key={id} page={page} section={id}>{sections[id]}</SectionAppearance>)}

      <footer className="py-8 text-center" style={{ backgroundColor: colors.background }}>
        <p className="text-sm" style={{ color: colors.text, opacity: 0.6 }}>
          {renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}
        </p>
      </footer>
    </div>
  );
};

// ══════════════════════════════════════════════
// Reusable CTA Button - uses dynamic colors
// ══════════════════════════════════════════════
const CTAButton = ({ colors, onClick, text }: { colors: any; onClick: () => void; text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.3 }}
    className="text-center mt-6 px-4"
  >
    <button
      onClick={onClick}
      className="w-full max-w-md mx-auto block py-3 px-6 text-[21px] font-bold rounded-full border-0 cursor-pointer"
      style={{
        background: `linear-gradient(180deg, ${colors.buttonLight} 0%, ${colors.button} 40%, ${colors.buttonDark} 100%)`,
        color: '#ffffff',
        textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
        boxShadow: `0 4px 16px ${colors.button}80, inset 0 1px 0 rgba(255,255,255,0.3)`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      👆 {renderSalesText(text)}
    </button>
  </motion.div>
);

// ══════════════════════════════════════════════
// Reusable Section Heading - uses dynamic headline/border colors
// ══════════════════════════════════════════════
const SectionHeading = ({ colors, text, subtitle }: { colors: any; text: string; subtitle?: string | null }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center mb-6"
  >
    <h2
      className="text-[20px] md:text-[24px] font-bold leading-snug inline-block px-5 py-2"
      style={{
        color: colors.headline,
        textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 2px 4px rgba(0,0,0,0.5)',
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      {renderSalesText(text)}
    </h2>
    {renderSalesText(subtitle && (
      <p className="text-[15px] mt-2 font-medium" style={{ color: colors.text, opacity: 0.8 }}>
        {renderSalesText(subtitle)}
      </p>
    ))}
  </motion.div>
);

// ══════════════════════════════════════════════
// Slider Navigation Arrows - uses dynamic accent color
// ══════════════════════════════════════════════
const SliderArrows = ({ colors, onPrev, onNext }: { colors: any; onPrev: () => void; onNext: () => void }) => (
  <>
    <button
      onClick={onPrev}
      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button
      onClick={onNext}
      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </>
);

// ══════════════════════════════════════════════
// Slider Dots - uses dynamic button/accent colors
// ══════════════════════════════════════════════
const SliderDots = ({ colors, count, activeIndex, onSelect }: { colors: any; count: number; activeIndex: number; onSelect: (i: number) => void }) => (
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
            ? `linear-gradient(135deg, ${colors.buttonLight}, ${colors.button})`
            : 'rgba(255, 255, 255, 0.3)',
          boxShadow: activeIndex === idx ? `0 2px 8px ${colors.button}80` : 'none',
        }}
      />
    )))}
  </div>
);

// ══════════════════════════════════════════════
// Extra Benefits Section
// ══════════════════════════════════════════════
const ExtraBenefitsSection = ({ page, colors, sectionNumber, onOrderClick }: { page: SalesPage; colors: any; sectionNumber: number; onOrderClick: () => void }) => {
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

  return (
    <section
      className="py-8 px-4"
      style={{
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.background} 100%)`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        {renderSalesText(heading && <SectionHeading colors={colors} text={heading} />)}

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
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(4px)',
                borderLeft: `3px solid ${colors.accent}`,
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                  boxShadow: `0 2px 8px ${colors.accent}66`,
                }}
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p
                className="text-[16px] md:text-[18px] font-medium leading-relaxed"
                style={{
                  color: colors.text,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
                
              >{renderSalesText(point)}</p>
            </motion.div>
          )))}
        </div>

        <CTAButton colors={colors} onClick={onOrderClick} text={page.cta_button_text || "অর্ডার করতে ক্লিক করুন"} />
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
// Hero Section
// ══════════════════════════════════════════════
const HeroHealth = ({ page, colors, onOrderClick }: { page: SalesPage; colors: any; onOrderClick: () => void }) => {
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const videoUrl = page.hero_video_url || page.video_url;
  const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.primary} 100%)`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      <div className="relative z-10 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <h1
            className="text-[25px] md:text-[28px] lg:text-[32px] font-bold leading-snug inline-block px-5 py-2"
            style={{
              color: colors.headline,
              textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 2px 6px rgba(0,0,0,0.6)',
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            }}
          >
            {renderSalesText(page.hero_headline)}
          </h1>
        </motion.div>

        {/* Sub-headline */}
        {renderSalesText(page.hero_subheadline && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-center mb-6 px-2">
            <p
              className="text-[20px] md:text-[20px] lg:text-[22px] leading-relaxed font-semibold"
              style={{ color: colors.text, fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}
              
            >{renderSalesText(page.hero_subheadline)}</p>
          </motion.div>
        ))}

        {/* Video */}
        {renderSalesText(videoUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="mb-6">
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: `3px solid ${colors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {renderSalesText(youtubeId ? (
                <div className="aspect-video">
                  <iframe loading="lazy"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title={salesPlainText(page.hero_headline)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video">
                  <video src={videoUrl} controls className="w-full h-full object-cover" poster={page.hero_images?.[0]} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Product Image fallback */}
        {renderSalesText(!videoUrl && page.hero_images?.[0] && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="mb-6">
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: `3px solid ${colors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <img src={page.hero_images[0]} alt={salesPlainText(page.hero_headline)} className="w-full object-contain" style={{ maxHeight: '400px' }} />
            </div>
          </motion.div>
        ))}

        {/* CTA Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center px-4">
          <button
            onClick={onOrderClick}
            className="w-full max-w-md mx-auto block py-3 px-6 text-[21px] font-bold rounded-full border-0 cursor-pointer"
            style={{
              background: `linear-gradient(180deg, ${colors.buttonLight} 0%, ${colors.button} 40%, ${colors.buttonDark} 100%)`,
              color: '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
              boxShadow: `0 4px 16px ${colors.button}80, inset 0 1px 0 rgba(255,255,255,0.3)`,
              fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
            }}
          >
            👆 {renderSalesText(page.cta_button_text || "অর্ডার করতে ক্লিক করুন")}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
// Gallery Section
// ══════════════════════════════════════════════
const GallerySection = ({ page, colors, onOrderClick }: { page: SalesPage; colors: any; onOrderClick: () => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = page.gallery_images || [];
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
  };

  return (
    <section
      className="py-8 px-4"
      style={{
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.background} 100%)`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <SectionHeading
          colors={colors}
          text={page.gallery_title || 'আমাদের সার্টিফিকেট ও ল্যাব রিপোর্ট'}
          subtitle={page.gallery_subtitle}
        />

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              border: `3px solid ${colors.border}`,
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
              src={images[activeIndex]}
              alt={salesPlainText(`Certificate ${activeIndex + 1}`)}
              className="w-full object-contain"
              style={{ maxHeight: '500px', minHeight: '280px' }}
            />

            {renderSalesText(images.length > 1 && <SliderArrows colors={colors} onPrev={prevSlide} onNext={nextSlide} />)}

            <div
              className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {renderSalesText(activeIndex + 1)} / {renderSalesText(images.length)}
            </div>
          </div>

          {renderSalesText(images.length > 1 && (
            <SliderDots colors={colors} count={images.length} activeIndex={activeIndex} onSelect={setActiveIndex} />
          ))}
        </motion.div>

        <CTAButton colors={colors} onClick={onOrderClick} text={page.cta_button_text || "অর্ডার করতে ক্লিক করুন"} />
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
// Features Section
// ══════════════════════════════════════════════
const FeaturesSection = ({ page, colors }: { page: SalesPage; colors: any }) => {
  const features = [
    { icon: Truck, text: page.feature_1_text || "সারাদেশে ডেলিভারি", desc: page.feature_1_description },
    { icon: Shield, text: page.feature_2_text || "১০০% অরিজিনাল প্রোডাক্ট", desc: page.feature_2_description },
    { icon: Package, text: page.feature_3_text || "ক্যাশ অন ডেলিভারি", desc: page.feature_3_description },
    { icon: CheckCircle, text: page.feature_4_text || "সম্পূর্ণ টাকা ফেরত গ্যারান্টি", desc: page.feature_4_description },
  ].filter(f => f.text);

  return (
    <section className="py-10 px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: colors.headline }}>
            {renderSalesText(page.features_headline || "কেন আমাদের থেকে কিনবেন?")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {renderSalesText(features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: colors.accent }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium" style={{ color: colors.text }}>{renderSalesText(feature.text)}</p>
            </motion.div>
          )))}
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
// Reviews Section
// ══════════════════════════════════════════════
const ReviewsSection = ({ page, colors, onOrderClick }: { page: SalesPage; colors: any; onOrderClick: () => void }) => {
  const reviews = page.review_images || [];
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

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const reviewVideoUrl = (page as any).review_video_url;
  const youtubeId = reviewVideoUrl ? getYoutubeId(reviewVideoUrl) : null;

  return (
    <section
      className="py-8 px-4"
      style={{
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.background} 100%)`,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
      }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <SectionHeading
          colors={colors}
          text={`★★★ ${page.reviews_headline || "সম্মানিত কাস্টমারদের মতামত"} ★★★`}
          subtitle={page.reviews_subheadline}
        />

        {/* Review Video */}
        {renderSalesText(reviewVideoUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mb-6">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: `3px solid ${colors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
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

        {/* Image Slider */}
        {renderSalesText(reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                border: `3px solid ${colors.border}`,
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

              {renderSalesText(reviews.length > 1 && <SliderArrows colors={colors} onPrev={prevSlide} onNext={nextSlide} />)}

              <div
                className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {renderSalesText(activeIndex + 1)} / {renderSalesText(reviews.length)}
              </div>
            </div>

            {renderSalesText(reviews.length > 1 && (
              <SliderDots colors={colors} count={reviews.length} activeIndex={activeIndex} onSelect={setActiveIndex} />
            ))}
          </motion.div>
        ))}

        <CTAButton colors={colors} onClick={onOrderClick} text={page.cta_button_text || "অর্ডার করতে ক্লিক করুন"} />
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
// Contact Section
// ══════════════════════════════════════════════
export default Template05Countdown;
