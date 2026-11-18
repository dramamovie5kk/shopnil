import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Star } from "lucide-react";

interface ReviewVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 01: Grid Layout - 2-column grid with star rating
const ReviewVariant01 = ({ page, colors, isLightTheme }: ReviewVariantProps) => {
  const images = page.review_images || [];
  const reviewVideoUrl = (page as any).review_video_url;

  if (images.length === 0 && !reviewVideoUrl) return null;

  return (
    <section 
      className="py-8 px-3 relative overflow-hidden"
      style={{ backgroundColor: isLightTheme ? colors.background : '#0f172a' }}
    >
      <div 
        className="absolute top-10 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colors.primary }}
      />

      <div className="relative max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.reviews_headline)}
          </h2>
          <p className="text-sm mb-2" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            {renderSalesText(page.reviews_subheadline)}
          </p>

          <div className="flex items-center justify-center gap-0.5">
            {renderSalesText([...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            )))}
            <span className="ml-1.5 text-xs" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
              ৫.০ (১০০+ রিভিউ)
            </span>
          </div>
        </motion.div>

        {/* Review Video */}
        {renderSalesText(reviewVideoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isLightTheme ? '#eee' : 'rgba(255,255,255,0.1)'}` }}>
              {renderSalesText(reviewVideoUrl.match(/(?:youtu\.be\/|youtube\.com)/) ? (
                <div className="aspect-video">
                  <iframe loading="lazy"
                    src={`https://www.youtube.com/embed/${reviewVideoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1]}?rel=0`}
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

        {renderSalesText(images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {renderSalesText(images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl overflow-hidden"
              >
                <img
                  src={img}
                  alt={salesPlainText(`Customer review ${i + 1}`)}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            )))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewVariant01;
