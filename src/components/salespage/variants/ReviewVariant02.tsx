import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState } from "react";
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 02: Carousel Layout - One review at a time with navigation
const ReviewVariant02 = ({ page, colors, isLightTheme }: ReviewVariantProps) => {
  const images = page.review_images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewVideoUrl = (page as any).review_video_url;

  if (images.length === 0 && !reviewVideoUrl) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section 
      className="py-8 px-3 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.reviews_headline)}
          </h2>
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

        {/* Carousel */}
        {renderSalesText(images.length > 0 && (
          <>
            <div className="relative">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl overflow-hidden"
              >
                <img
                  src={images[currentIndex]}
                  alt={salesPlainText(`Customer review ${currentIndex + 1}`)}
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {renderSalesText(images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {renderSalesText(images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className="w-2.5 h-2.5 rounded-full transition-colors"
                  style={{ 
                    backgroundColor: currentIndex === idx ? colors.accent : isLightTheme ? '#ddd' : 'rgba(255,255,255,0.2)'
                  }}
                />
              )))}
            </div>
          </>
        ))}
      </div>
    </section>
  );
};

export default ReviewVariant02;
