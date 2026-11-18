import SectionAppearance from '../SectionAppearance';
import ExtraSection from '../ExtraSection';
import { isExtraDesign } from '@/lib/extraSectionDesigns';
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SalesPage } from "@/types/salesPage";
import CheckoutSection from "../CheckoutSection";
import SharedHeroSection from "../SharedHeroSection";

import ContactSection from "../ContactSection";
import GallerySection from "../GallerySection";

interface Template14Props {
  page: SalesPage;
}

const Template14VideoOrganic = ({ page }: Template14Props) => {
  const checkoutRef = useRef<HTMLDivElement>(null);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Extract YouTube video ID
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const sectionOrder = page.section_order || ['hero', 'video', 'gallery', 'features', 'reviews', 'contact', 'checkout'];

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return page.show_hero_section !== false && (
          page.template_styles?.hero?.design ? <SharedHeroSection key="hero" page={page} onOrderClick={scrollToCheckout} /> : <HeroSection key="hero" page={page} onOrderClick={scrollToCheckout} getYoutubeEmbedUrl={getYoutubeEmbedUrl} />
        );
      case 'gallery':
        return page.show_gallery_section && (
          <div key="gallery" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <GallerySection page={page} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'features':
        return page.show_features_section && (
          <div key="features" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <Template14Features page={page} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'reviews':
        return page.show_reviews_section && (
          <div key="reviews" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <Template14Reviews page={page} />
            </div>
          </div>
        );
      case 'contact':
        return page.show_contact_section && (
          <div key="contact" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <div className="rounded-[15px] overflow-hidden">
                <ContactSection page={page} />
              </div>
            </div>
          </div>
        );
      case 'extra1':
        if (isExtraDesign(page.template_styles?.extra1?.design)) return <ExtraSection key="extra1" page={page} number={1} />;
        return page.show_extra_section_1 && (
          <div key="extra1" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <Template14ExtraSection page={page} sectionNumber={1} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'extra2':
        if (isExtraDesign(page.template_styles?.extra2?.design)) return <ExtraSection key="extra2" page={page} number={2} />;
        return page.show_extra_section_2 && (
          <div key="extra2" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <Template14ExtraSection page={page} sectionNumber={2} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'extra3':
        if (isExtraDesign(page.template_styles?.extra3?.design)) return <ExtraSection key="extra3" page={page} number={3} />;
        return page.show_extra_section_3 && (
          <div key="extra3" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <Template14ExtraSection page={page} sectionNumber={3} onOrderClick={scrollToCheckout} />
            </div>
          </div>
        );
      case 'checkout':
        return page.show_checkout_section !== false && (
          <div key="checkout" ref={checkoutRef} id="checkout" className="px-3 md:px-4">
            <div className="max-w-[650px] mx-auto">
              <div className="rounded-t-[15px] overflow-hidden">
                <CheckoutSection page={page} />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen space-y-[5px]" style={{ backgroundColor: '#f4f4f4', fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif" }}>
      {renderSalesText(sectionOrder.map(key => <SectionAppearance key={key} page={page} section={key}>{renderSection(key)}</SectionAppearance>))}

      {/* Footer */}
      <div className="py-6 text-center text-sm" style={{ backgroundColor: '#065f46', color: '#ffffff' }}>
        <p className="opacity-70">© {renderSalesText(new Date().getFullYear())} - সকল অধিকার সংরক্ষিত</p>
      </div>
    </div>
  );
};

// ─── Hero Section ────────────────────────────────────────────────
interface HeroSectionProps {
  page: SalesPage;
  onOrderClick: () => void;
  getYoutubeEmbedUrl: (url: string) => string;
}

const HeroSection = ({ page, onOrderClick, getYoutubeEmbedUrl }: HeroSectionProps) => {
  return (
    <section className="flex justify-center px-[10px] md:px-[15px] pt-[15px] md:pt-[30px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[650px] rounded-[15px] text-center"
        style={{
          backgroundColor: '#f0fdf4',
          padding: '15px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header Box */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-[10px] mb-5 md:mb-6"
          style={{
            backgroundColor: '#065f46',
            color: '#ffffff',
            padding: '15px 20px',
            fontSize: '17px',
            lineHeight: '1.6',
            fontWeight: 700,
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
            style={{ color: '#16a34a' }}
          >
            {renderSalesText(page.hero_subheadline)}
          </motion.h2>
        ))}

        {/* Video Section */}
        {renderSalesText(page.hero_video_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative mb-5 md:mb-6 rounded-[12px] overflow-hidden"
            style={{
              paddingBottom: '56.25%',
              height: 0,
              border: '4px solid #4ade80',
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

        {/* Product Image (fallback if no video) */}
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
              className="w-full rounded-[12px] object-contain mx-auto"
              style={{ maxHeight: '400px', border: '4px solid #4ade80' }}
            />
          </motion.div>
        ))}

        {/* Bottom Text / Offer Details */}
        {renderSalesText(page.offer_details && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[18px] md:text-[22px] font-bold mb-5 md:mb-6 leading-snug"
            style={{ color: '#16a34a' }}
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
            className="w-full md:w-auto inline-block text-[20px] md:text-[24px] font-bold text-white transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: '#064e3b',
              padding: '12px 30px',
              borderRadius: '50px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              border: '2px solid #ffffff',
            }}
          >
            {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ─── Features Section (Theme-matched) ───────────────────────────
const Template14Features = ({ page, onOrderClick }: { page: SalesPage; onOrderClick: () => void }) => {
  const features = [
    { text: page.feature_1_text, icon: page.feature_1_icon, desc: page.feature_1_description },
    { text: page.feature_2_text, icon: page.feature_2_icon, desc: page.feature_2_description },
    { text: page.feature_3_text, icon: page.feature_3_icon, desc: page.feature_3_description },
    { text: page.feature_4_text, icon: page.feature_4_icon, desc: page.feature_4_description },
    { text: page.feature_5_text, icon: page.feature_5_icon, desc: page.feature_5_description },
    { text: page.feature_6_text, icon: page.feature_6_icon, desc: page.feature_6_description },
  ].filter(f => f.text);

  if (features.length === 0) return null;

  return (
    <section
      className="py-6 px-4 rounded-[15px] overflow-hidden"
      style={{ backgroundColor: '#065f46' }}
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
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white">
          {renderSalesText(page.features_headline)}
        </h2>
        {renderSalesText(page.features_subheadline && (
          <p className="text-base md:text-lg text-white/70">
            {renderSalesText(page.features_subheadline)}
          </p>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.08 }}
        className="space-y-2"
      >
        {renderSalesText(features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: '#4ade80' }}
            >
              {renderSalesText(feature.icon ? (
                <span className="text-sm">{renderSalesText(feature.icon)}</span>
              ) : (
                <Check className="w-4 h-4 text-[#065f46]" />
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                {renderSalesText(feature.text)}
              </h3>
              {renderSalesText(feature.desc && (
                <p className="text-xs text-white/60 mt-0.5">
                  {renderSalesText(feature.desc)}
                </p>
              ))}
            </div>
          </motion.div>
        )))}
      </motion.div>

      {/* CTA Button - same style as hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-5"
      >
        <button
          onClick={onOrderClick}
          className="w-full md:w-auto inline-block text-[20px] md:text-[24px] font-bold text-white transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: '#064e3b',
            padding: '12px 30px',
            borderRadius: '50px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            border: '2px solid #ffffff',
          }}
        >
          {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
        </button>
      </motion.div>
    </section>
  );
};

// ─── Reviews Section (Theme-matched, no stars) ─────────────────
const Template14Reviews = ({ page }: { page: SalesPage }) => {
  const hasImages = page.review_images && page.review_images.length > 0;
  const hasVideo = !!page.review_video_url;

  if (!hasImages && !hasVideo) return null;

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <section className="py-6 px-4 rounded-[15px] overflow-hidden" style={{ backgroundColor: '#065f46' }}>
      {renderSalesText(page.reviews_headline && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {renderSalesText(page.reviews_headline)}
          </h2>
          {renderSalesText(page.reviews_subheadline && (
            <p className="text-base md:text-lg text-white/70 mt-1">
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
          className="relative mb-4 rounded-[12px] overflow-hidden"
          style={{ paddingBottom: '56.25%', height: 0, border: '3px solid #4ade80' }}
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
                className="w-full rounded-[10px] object-cover"
                style={{ border: '3px solid #4ade80' }}
              />
            </motion.div>
          )))}
        </div>
      ))}
    </section>
  );
};

// ─── Extra Section (Theme-matched) ─────────────────────────────
const Template14ExtraSection = ({ page, sectionNumber, onOrderClick }: { page: SalesPage; sectionNumber: number; onOrderClick: () => void }) => {
  const heading = (page as any)[`extra_section_${sectionNumber}_heading`] as string;
  const pointsArray = (page as any)[`extra_section_${sectionNumber}_points`] as string[] | null;
  const legacyPoints = [1, 2, 3, 4, 5, 6]
    .map(i => (page as any)[`extra_section_${sectionNumber}_point_${i}`] as string)
    .filter(Boolean);
  
  const points = (pointsArray && pointsArray.length > 0) ? pointsArray : legacyPoints;
  if (points.length === 0) return null;

  return (
    <section className="py-6 px-4 rounded-[15px] overflow-hidden" style={{ backgroundColor: '#065f46' }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {renderSalesText(heading || 'বিশেষ সুবিধা')}
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-2"
      >
        {renderSalesText(points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: '#4ade80' }}
            >
              <Check className="w-4 h-4 text-[#065f46]" />
            </div>
            <p className="font-semibold text-sm text-white">{renderSalesText(point)}</p>
          </motion.div>
        )))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-5"
      >
        <button
          onClick={onOrderClick}
          className="w-full md:w-auto inline-block text-[20px] md:text-[24px] font-bold text-white transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: '#064e3b',
            padding: '12px 30px',
            borderRadius: '50px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            border: '2px solid #ffffff',
          }}
        >
          {renderSalesText(page.cta_button_text || 'অর্ডার করুন')}
        </button>
      </motion.div>
    </section>
  );
};

export default Template14VideoOrganic;
