import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { ChevronLeft, ChevronRight, Eye, ZoomIn, X } from "lucide-react";

interface GalleryVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
  onOrderClick: () => void;
}

// Variant 02: Slider Layout - Main image with thumbnails below
const GalleryVariant02 = ({ page, colors, isLightTheme, onOrderClick }: GalleryVariantProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images = page.gallery_images || [];

  if (images.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section 
      id="collection-section" 
      className="py-8 px-3"
      style={{ backgroundColor: isLightTheme ? colors.background : '#0f172a' }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            আমাদের কালেকশন
          </p>
          <h2 className="text-lg font-bold" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            যেমন দেখছেন, <span style={{ color: colors.accent }}>তেমনই পাবেন</span>
          </h2>
        </motion.div>

        {/* Main Slider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={salesPlainText(`Product ${currentIndex + 1}`)}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-white font-medium text-sm">
                {renderSalesText(page.gallery_title || "প্রিমিয়াম কোয়ালিটি")}
              </p>
              <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                <Eye className="w-3 h-3" />
                {renderSalesText(currentIndex + 1)} / {renderSalesText(images.length)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedImage(images[currentIndex])}
            className="absolute top-3 right-3 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/30"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>

          {renderSalesText(images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </>
          ))}
        </motion.div>

        {/* Thumbnails */}
        <div className="flex gap-1.5 justify-center overflow-x-auto pb-2 scrollbar-hide">
          {renderSalesText(images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                currentIndex === idx ? 'scale-105 ring-2' : 'opacity-50 hover:opacity-75'
              }`}
              style={currentIndex === idx ? { boxShadow: `0 0 0 2px ${colors.accent}` } : {}}
            >
              <img src={img} alt={salesPlainText(`Thumbnail ${idx + 1}`)} className="w-full h-full object-cover" />
            </button>
          )))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4"
        >
          <Button
            onClick={onOrderClick}
            className="w-full h-11 text-sm font-bold rounded-xl text-white"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              boxShadow: `0 8px 20px -6px ${colors.primary}50`
            }}
          >
            {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}
          </Button>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {renderSalesText(selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2.5 rounded-full hover:bg-white/30"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
};

export default GalleryVariant02;
