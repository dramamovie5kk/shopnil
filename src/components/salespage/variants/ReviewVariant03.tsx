import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Quote } from "lucide-react";

interface ReviewVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 03: Masonry Layout - Pinterest-style varied heights
const ReviewVariant03 = ({ page, colors, isLightTheme }: ReviewVariantProps) => {
  const images = page.review_images || [];
  const reviewVideoUrl = (page as any).review_video_url;

  if (images.length === 0 && !reviewVideoUrl) return null;

  return (
    <section 
      className="py-8 px-3"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Quote className="w-5 h-5" style={{ color: colors.accent }} />
            <h2 className="text-xl font-bold" style={{ color: isLightTheme ? colors.text : '#fff' }}>
              {renderSalesText(page.reviews_headline)}
            </h2>
          </div>
          <p className="text-sm" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            {renderSalesText(page.reviews_subheadline)}
          </p>
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
          <div className="columns-2 gap-2 space-y-2">
            {renderSalesText(images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid rounded-xl overflow-hidden"
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

export default ReviewVariant03;
