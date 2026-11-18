import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Play } from "lucide-react";
import { getTemplateStyles } from "@/lib/salesPageTemplates";

interface VideoSectionProps {
  page: SalesPage;
}

const VideoSection = ({ page }: VideoSectionProps) => {
  const { template, colors } = getTemplateStyles(page.template_id || 'nature-fresh');
  
  if (!page.video_url) return null;

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = getYoutubeId(page.video_url);
  const isLightTheme = ['nature-fresh', 'classic-white', 'soft-elegance', 'bold-orange', 'fresh-lime'].includes(template.id);

  return (
    <section 
      className="py-10 px-1.5"
      style={{ backgroundColor: isLightTheme ? colors.background : '#0f172a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
            style={{ 
              background: isLightTheme ? `${colors.primary}15` : 'rgba(255,255,255,0.05)',
              border: isLightTheme ? `1px solid ${colors.primary}30` : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Play className="w-4 h-4" style={{ color: colors.accent }} />
            <span className="text-sm font-medium" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.8 }}>
              ভিডিও দেখুন
            </span>
          </div>
          <h2 
            className="text-xl md:text-2xl font-bold mb-1"
            style={{ color: isLightTheme ? colors.text : '#fff' }}
          >
            {renderSalesText(page.video_title)}
          </h2>
          <p style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            {renderSalesText(page.video_subtitle)}
          </p>
        </div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 20px 40px -12px ${colors.primary}40`
          }}
        >
          {renderSalesText(youtubeId ? (
            <div className="aspect-video">
              <iframe loading="lazy"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title={salesPlainText(page.video_title)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video">
              <video
                src={page.video_url}
                controls
                className="w-full h-full object-cover"
                poster={page.gallery_images?.[0]}
              />
            </div>
          ))}
        </motion.div>

        {/* Optional quote/testimonial under video (like Image 30) */}
        {renderSalesText(template.id === 'classic-white' && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p 
              className="text-base italic"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              "সেরা মানের পণ্য, সেরা সেবা"
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default VideoSection;
