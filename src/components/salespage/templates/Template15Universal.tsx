import SectionAppearance from '../SectionAppearance';
import { salesPlainText } from '@/lib/salesRichText';
import { customTemplateSectionOrder } from '@/lib/salesSectionDesignAvailability';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Play, ChevronDown, Star } from "lucide-react";
import { SalesPage } from "@/types/salesPage";
import { CustomSection } from "@/components/admin/CustomSectionEditor";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";
import ContactSection from "../ContactSection";
import SharedReviewsSection from "../SharedReviewsSection";
import SharedFeaturesSection from "../SharedFeaturesSection";
import GallerySection from "../GallerySection";
import { Button } from '@/components/ui/button';
import { Universal15CustomSection } from '../CustomSectionContent';
export { Universal15CustomSection } from '../CustomSectionContent';

interface Template15Props {
  page: SalesPage;
}

// Default styles for the universal template
const defaultStyles = {
  global: {
    backgroundColor: "#f4f4f4",
    maxWidth: "650",
    sectionGap: "5",
    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
  },
  hero: {
    backgroundColor: "#f0fdf4",
    headerBgColor: "#065f46",
    headerTextColor: "#ffffff",
    subheadlineColor: "#16a34a",
    borderRadius: "15",
    cardPadding: "15",
    videoBorderColor: "#4ade80",
    videoBorderWidth: "4",
    offerTextColor: "#16a34a",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
    ctaBorderColor: "#ffffff",
    ctaBorderWidth: "2",
    ctaFontSize: "20",
  },
  features: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    itemBgColor: "rgba(255,255,255,0.1)",
    itemTextColor: "#ffffff",
    itemDescColor: "rgba(255,255,255,0.6)",
    checkBgColor: "#4ade80",
    checkIconColor: "#065f46",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
    ctaBorderColor: "#ffffff",
  },
  reviews: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    imageBorderColor: "#4ade80",
    imageBorderWidth: "3",
  },
  contact: {
    borderRadius: "15",
  },
  checkout: {
    borderRadius: "15",
  },
  extra: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    itemBgColor: "rgba(255,255,255,0.1)",
    itemTextColor: "#ffffff",
    checkBgColor: "#4ade80",
    checkIconColor: "#065f46",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
    ctaBorderColor: "#ffffff",
  },
  gallery: {
    borderRadius: "15",
  },
  video: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    videoBorderColor: "#4ade80",
    videoBorderWidth: "3",
  },
  countdown: {
    backgroundColor: "#064e3b",
    borderRadius: "15",
    textColor: "#ffffff",
    numberBgColor: "rgba(255,255,255,0.15)",
    numberColor: "#ffffff",
    labelColor: "rgba(255,255,255,0.7)",
  },
  footer: {
    backgroundColor: "#065f46",
    textColor: "#ffffff",
  },
};

// Merge user styles with defaults
const getStyles = (page: SalesPage) => {
  const ts = (page.template_styles || {}) as Record<string, Record<string, string>>;
  const merged: Record<string, Record<string, string>> = {};
  for (const key of Object.keys(defaultStyles)) {
    merged[key] = { ...(defaultStyles as any)[key], ...(ts[key] || {}) };
  }
  return merged;
};

const Template15Universal = ({ page }: Template15Props) => {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [checkoutBounds, setCheckoutBounds] = useState<{ width: number; left: number }>();
  const s = getStyles(page);

  useEffect(() => {
    const root = pageRef.current;
    const card = checkoutRef.current?.querySelector('.checkout-container');
    if (!root || !card) return;
    const update = () => {
      const rect = card.getBoundingClientRect();
      const next = { width: rect.width, left: rect.left - root.getBoundingClientRect().left };
      if (next.width > 0) setCheckoutBounds(previous => previous?.width === next.width && previous.left === next.left ? previous : next);
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(card);
    window.addEventListener('resize', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [page]);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Build section order including custom sections
  const customSections = ((page.template_styles as any)?.customSections || []) as CustomSection[];
  const sectionOrder = customTemplateSectionOrder(page.section_order, customSections.map(c => c.id));

  const wrapSection = (key: string, content: React.ReactNode) => (
    <div key={key} className="px-3 md:px-4">
      <div className="mx-auto" style={{ maxWidth: `${s.global.maxWidth}px` }}>
        {renderSalesText(content)}
      </div>
    </div>
  );

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return page.show_hero_section !== false && (
          page.template_styles?.hero?.design ? <SharedHeroSection key="hero" page={page} onOrderClick={scrollToCheckout} /> : <Universal15Hero key="hero" page={page} s={s} onOrderClick={scrollToCheckout} getYoutubeEmbedUrl={getYoutubeEmbedUrl} />
        );
      case 'countdown':
        return page.show_countdown && wrapSection('countdown',
          <Universal15Countdown page={page} s={s} />
        );
      case 'video':
        return page.show_video_section && page.video_url && wrapSection('video',
          <Universal15Video page={page} s={s} getYoutubeEmbedUrl={getYoutubeEmbedUrl} />
        );
      case 'gallery':
        return page.show_gallery_section && wrapSection('gallery',
          <div style={{ borderRadius: `${s.gallery.borderRadius}px`, overflow: 'hidden' }}>
            <GallerySection page={page} onOrderClick={scrollToCheckout} />
          </div>
        );
      case 'features':
        return page.show_features_section && wrapSection('features',
           page.template_styles?.features?.design ? <SharedFeaturesSection page={page} /> : <Universal15Features page={page} s={s} onOrderClick={scrollToCheckout} />
        );
      case 'reviews':
        return page.show_reviews_section && wrapSection('reviews',
          <Universal15Reviews page={page} s={s} />
        );
      case 'contact':
        return page.show_contact_section && wrapSection('contact',
          <div style={{ borderRadius: `${s.contact.borderRadius}px`, overflow: 'hidden' }}>
            <ContactSection page={page} />
          </div>
        );
      case 'extra1':
        return page.show_extra_section_1 && wrapSection('extra1',
          <Universal15Extra page={page} s={s} sectionNumber={1} onOrderClick={scrollToCheckout} />
        );
      case 'extra2':
        return page.show_extra_section_2 && wrapSection('extra2',
          <Universal15Extra page={page} s={s} sectionNumber={2} onOrderClick={scrollToCheckout} />
        );
      case 'extra3':
        return page.show_extra_section_3 && wrapSection('extra3',
          <Universal15Extra page={page} s={s} sectionNumber={3} onOrderClick={scrollToCheckout} />
        );
      case 'checkout':
        return page.show_checkout_section !== false && (
          <div key="checkout" ref={checkoutRef} id="checkout">
            <div className="mx-auto" style={{ maxWidth: `${s.global.maxWidth}px` }}>
              <div style={{ borderRadius: `${s.checkout.borderRadius}px`, overflow: 'hidden' }}>
                <CheckoutSection page={page} />
              </div>
            </div>
          </div>
        );
      default:
        // Check for custom sections (cs-xxx)
        if (sectionKey.startsWith('cs-')) {
          const customSections = ((page.template_styles as any)?.customSections || []) as CustomSection[];
          const cs = customSections.find(c => c.id === sectionKey);
          if (cs) {
            // Align desktop sections to the actual checkout card, including side gaps.
            return (
              <div key={sectionKey} className={cs.type === 'html' ? 'w-full' : 'w-full custom-checkout-aligned-section'}>
                <Universal15CustomSection section={cs} s={s} onOrderClick={scrollToCheckout} />
              </div>
            );
          }
        }
        return null;
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen" style={{
      '--custom-checkout-width': checkoutBounds ? `${checkoutBounds.width}px` : `${s.global.maxWidth}px`,
      '--custom-checkout-left': checkoutBounds ? `${checkoutBounds.left}px` : 'auto',
      backgroundColor: s.global.backgroundColor,
      fontFamily: s.global.fontFamily,
      display: 'flex',
      flexDirection: 'column',
      gap: `${s.global.sectionGap}px`,
    } as React.CSSProperties}>
      {renderSalesText(sectionOrder.map(key => <SectionAppearance key={key} page={page} section={key}>{renderSection(key)}</SectionAppearance>))}

      {/* Footer */}
      <div className="py-2.5 text-center text-xs leading-tight" style={{ backgroundColor: s.footer.backgroundColor, color: s.footer.textColor }}>
        <p className="opacity-70">{renderSalesText(page.footer_text || `© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত`)}</p>
      </div>
    </div>
  );
};

// ─── Hero Section ────────────────────────────────────────────────
const Universal15Hero = ({ page, s, onOrderClick, getYoutubeEmbedUrl }: {
  page: SalesPage; s: Record<string, Record<string, string>>; onOrderClick: () => void; getYoutubeEmbedUrl: (url: string) => string;
}) => {
  const h = s.hero;
  return (
    <section className="flex justify-center px-[10px] md:px-[15px] pt-[15px] md:pt-[30px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center"
        style={{
          maxWidth: `${s.global.maxWidth}px`,
          backgroundColor: h.backgroundColor,
          padding: `${h.cardPadding}px`,
          borderRadius: `${h.borderRadius}px`,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-5 md:mb-6"
          style={{
            backgroundColor: h.headerBgColor,
            color: h.headerTextColor,
            padding: '15px 20px',
            fontSize: '17px',
            lineHeight: '1.6',
            fontWeight: 700,
            borderRadius: '10px',
          }}
        >
          <p className="md:text-[20px]">{renderSalesText(page.hero_headline)}</p>
        </motion.div>

        {/* Sub Header */}
        {renderSalesText(page.hero_subheadline && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] md:text-[22px] font-bold mb-4 md:mb-5 px-2"
            style={{ color: h.subheadlineColor }}
          >
            {renderSalesText(page.hero_subheadline)}
          </motion.h2>
        ))}

        {/* Video */}
        {renderSalesText(page.hero_video_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative mb-5 md:mb-6 overflow-hidden"
            style={{
              paddingBottom: '56.25%',
              height: 0,
              border: `${h.videoBorderWidth}px solid ${h.videoBorderColor}`,
              borderRadius: '12px',
              background: '#000',
            }}
          >
            <iframe loading="lazy"
              src={getYoutubeEmbedUrl(page.hero_video_url)}
              title="Product Video"
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        ))}

        {/* Product Image (fallback) */}
        {renderSalesText(!page.hero_video_url && page.hero_images?.[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-5 md:mb-6"
          >
            <img
              src={page.hero_images[0]}
              alt={salesPlainText(page.hero_headline)}
              className="w-full object-contain mx-auto"
              style={{
                maxHeight: '400px',
                border: `${h.videoBorderWidth}px solid ${h.videoBorderColor}`,
                borderRadius: '12px',
              }}
            />
          </motion.div>
        ))}

        {/* Offer Details */}
        {renderSalesText(page.offer_details && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[18px] md:text-[22px] font-bold mb-5 md:mb-6 leading-snug"
            style={{ color: h.offerTextColor }}
          >
            {renderSalesText(page.offer_details)}
          </motion.p>
        ))}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onOrderClick}
            className="w-full md:w-auto inline-block font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: h.ctaBgColor,
              color: h.ctaTextColor,
              padding: '12px 30px',
              borderRadius: `${h.ctaBorderRadius}px`,
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              border: `${h.ctaBorderWidth}px solid ${h.ctaBorderColor}`,
              fontSize: `${h.ctaFontSize}px`,
            }}
          >
            {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ─── Features Section ───────────────────────────────────────────
const Universal15Features = ({ page, s, onOrderClick }: {
  page: SalesPage; s: Record<string, Record<string, string>>; onOrderClick: () => void;
}) => {
  const f = s.features;
  const features = [
    { text: page.feature_1_text, icon: page.feature_1_icon, desc: page.feature_1_description },
    { text: page.feature_2_text, icon: page.feature_2_icon, desc: page.feature_2_description },
    { text: page.feature_3_text, icon: page.feature_3_icon, desc: page.feature_3_description },
    { text: page.feature_4_text, icon: page.feature_4_icon, desc: page.feature_4_description },
    { text: page.feature_5_text, icon: page.feature_5_icon, desc: page.feature_5_description },
    { text: page.feature_6_text, icon: page.feature_6_icon, desc: page.feature_6_description },
  ].filter(ft => ft.text);

  if (features.length === 0) return null;

  return (
    <section
      className="py-6 px-4 overflow-hidden"
      style={{ backgroundColor: f.backgroundColor, borderRadius: `${f.borderRadius}px` }}
    >
      {renderSalesText((page.feature_section_image || page.feature_section_images?.[0]) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-5 -mx-4 -mt-6"
        >
          <img
            src={page.feature_section_image || page.feature_section_images[0]}
            alt={salesPlainText(page.features_headline)}
            className="w-full object-cover"
            style={{ maxHeight: '350px' }}
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: f.headingColor }}>
          {renderSalesText(page.features_headline)}
        </h2>
        {renderSalesText(page.features_subheadline && (
          <p className="text-base md:text-lg" style={{ color: f.subheadingColor }}>
            {renderSalesText(page.features_subheadline)}
          </p>
        ))}
      </motion.div>

      <div className="space-y-2">
        {renderSalesText(features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: f.itemBgColor }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: f.checkBgColor }}
            >
              {renderSalesText(feature.icon ? (
                <span className="text-sm">{renderSalesText(feature.icon)}</span>
              ) : (
                <Check className="w-4 h-4" style={{ color: f.checkIconColor }} />
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: f.itemTextColor }}>
                {renderSalesText(feature.text)}
              </h3>
              {renderSalesText(feature.desc && (
                <p className="text-xs mt-0.5" style={{ color: f.itemDescColor }}>
                  {renderSalesText(feature.desc)}
                </p>
              ))}
            </div>
          </motion.div>
        )))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-5"
      >
        <button
          onClick={onOrderClick}
          className="w-full md:w-auto inline-block text-[20px] md:text-[24px] font-bold transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: f.ctaBgColor,
            color: f.ctaTextColor,
            padding: '12px 30px',
            borderRadius: `${f.ctaBorderRadius}px`,
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            border: `2px solid ${f.ctaBorderColor}`,
          }}
        >
          {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
        </button>
      </motion.div>
    </section>
  );
};

// ─── Reviews Section ────────────────────────────────────────────
const Universal15Reviews = ({ page, s }: { page: SalesPage; s: Record<string, Record<string, string>> }) => {
  const r = s.reviews;
  const hasImages = page.review_images && page.review_images.length > 0;
  const hasVideo = !!page.review_video_url;

  if (!hasImages && !hasVideo) return null;

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <section
      className="py-6 px-4 overflow-hidden"
      style={{ backgroundColor: r.backgroundColor, borderRadius: `${r.borderRadius}px` }}
    >
      {renderSalesText(page.reviews_headline && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: r.headingColor }}>
            {renderSalesText(page.reviews_headline)}
          </h2>
          {renderSalesText(page.reviews_subheadline && (
            <p className="text-base md:text-lg mt-1" style={{ color: r.subheadingColor }}>
              {renderSalesText(page.reviews_subheadline)}
            </p>
          ))}
        </motion.div>
      ))}

      {renderSalesText(hasVideo && page.review_video_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mb-4 overflow-hidden"
          style={{
            paddingBottom: '56.25%', height: 0,
            border: `${r.imageBorderWidth}px solid ${r.imageBorderColor}`,
            borderRadius: '12px',
          }}
        >
          <iframe loading="lazy"
            src={getYoutubeEmbedUrl(page.review_video_url)}
            title="Review Video"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      ))}

      {renderSalesText(hasImages && (
        <div className="grid grid-cols-2 gap-3">
          {renderSalesText(page.review_images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <img
                src={img}
                alt={salesPlainText(`Review ${index + 1}`)}
                className="w-full object-cover"
                style={{
                  border: `${r.imageBorderWidth}px solid ${r.imageBorderColor}`,
                  borderRadius: '10px',
                }}
              />
            </motion.div>
          )))}
        </div>
      ))}
    </section>
  );
};

// ─── Extra Section ──────────────────────────────────────────────
const Universal15Extra = ({ page, s, sectionNumber, onOrderClick }: {
  page: SalesPage; s: Record<string, Record<string, string>>; sectionNumber: number; onOrderClick: () => void;
}) => {
  const e = s.extra;
  const heading = (page as any)[`extra_section_${sectionNumber}_heading`] as string;
  const pointsArray = (page as any)[`extra_section_${sectionNumber}_points`] as string[] | null;
  const legacyPoints = [1, 2, 3, 4, 5, 6]
    .map(i => (page as any)[`extra_section_${sectionNumber}_point_${i}`] as string)
    .filter(Boolean);

  const points = (pointsArray && pointsArray.length > 0) ? pointsArray : legacyPoints;
  if (points.length === 0) return null;

  return (
    <section
      className="py-6 px-4 overflow-hidden"
      style={{ backgroundColor: e.backgroundColor, borderRadius: `${e.borderRadius}px` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: e.headingColor }}>
          {renderSalesText(heading || 'বিশেষ সুবিধা')}
        </h2>
      </motion.div>

      <div className="space-y-2">
        {renderSalesText(points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: e.itemBgColor }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: e.checkBgColor }}
            >
              <Check className="w-4 h-4" style={{ color: e.checkIconColor }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: e.itemTextColor }}>{renderSalesText(point)}</p>
          </motion.div>
        )))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-5"
      >
        <button
          onClick={onOrderClick}
          className="w-full md:w-auto inline-block text-[20px] md:text-[24px] font-bold transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: e.ctaBgColor,
            color: e.ctaTextColor,
            padding: '12px 30px',
            borderRadius: `${e.ctaBorderRadius}px`,
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            border: `2px solid ${e.ctaBorderColor}`,
          }}
        >
          {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
        </button>
      </motion.div>
    </section>
  );
};

// ─── Countdown Section ──────────────────────────────────────────
const Universal15Countdown = ({ page, s }: { page: SalesPage; s: Record<string, Record<string, string>> }) => {
  const c = s.countdown;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!page.countdown_end_date) return;
    const target = new Date(page.countdown_end_date).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [page.countdown_end_date]);

  if (!page.countdown_end_date) return null;

  const items = [
    { value: timeLeft.days, label: page.countdown_label_days || 'দিন' },
    { value: timeLeft.hours, label: page.countdown_label_hours || 'ঘণ্টা' },
    { value: timeLeft.minutes, label: page.countdown_label_minutes || 'মিনিট' },
    { value: timeLeft.seconds, label: page.countdown_label_seconds || 'সেকেন্ড' },
  ];

  return (
    <section
      className="py-6 px-4 overflow-hidden"
      style={{ backgroundColor: c.backgroundColor, borderRadius: `${c.borderRadius}px` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center gap-3"
      >
        {renderSalesText(items.map((item, i) => (
          <div key={i} className="text-center">
            <div
              className="text-2xl md:text-3xl font-bold px-4 py-3 rounded-xl min-w-[60px]"
              style={{ backgroundColor: c.numberBgColor, color: c.numberColor }}
            >
              {renderSalesText(String(item.value).padStart(2, '0'))}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: c.labelColor }}>
              {renderSalesText(item.label)}
            </p>
          </div>
        )))}
      </motion.div>
    </section>
  );
};

// ─── Video Section ──────────────────────────────────────────────
const Universal15Video = ({ page, s, getYoutubeEmbedUrl }: {
  page: SalesPage; s: Record<string, Record<string, string>>; getYoutubeEmbedUrl: (url: string) => string;
}) => {
  const v = s.video;
  if (!page.video_url) return null;

  return (
    <section
      className="py-6 px-4 overflow-hidden"
      style={{ backgroundColor: v.backgroundColor, borderRadius: `${v.borderRadius}px` }}
    >
      {renderSalesText((page.video_title || page.video_subtitle) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Play className="w-4 h-4" style={{ color: v.headingColor }} />
            <span className="text-sm font-medium" style={{ color: v.headingColor, opacity: 0.8 }}>ভিডিও দেখুন</span>
          </div>
          {renderSalesText(page.video_title && (
            <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: v.headingColor }}>
              {renderSalesText(page.video_title)}
            </h2>
          ))}
          {renderSalesText(page.video_subtitle && (
            <p className="text-base" style={{ color: v.subheadingColor }}>
              {renderSalesText(page.video_subtitle)}
            </p>
          ))}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden"
        style={{
          paddingBottom: '56.25%', height: 0,
          border: `${v.videoBorderWidth}px solid ${v.videoBorderColor}`,
          borderRadius: '12px',
        }}
      >
        <iframe loading="lazy"
          src={getYoutubeEmbedUrl(page.video_url)}
          title={salesPlainText(page.video_title || 'Video')}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
    </section>
  );
};


export default Template15Universal;
