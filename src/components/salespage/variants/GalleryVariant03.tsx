import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { X } from "lucide-react";

interface GalleryVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
  onOrderClick: () => void;
}

// Variant 03: Carousel Layout - Horizontal scroll with featured cards
const GalleryVariant03 = ({ page, colors, isLightTheme, onOrderClick }: GalleryVariantProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images = page.gallery_images || [];

  if (images.length === 0) return null;

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
          className="text-center mb-4"
        >
          <h2 className="text-lg font-bold" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.gallery_title || 'প্রোডাক্ট গ্যালারি')}
          </h2>
        </motion.div>

        {/* Horizontal scroll container */}
        <div className="overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {renderSalesText(images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative w-52 aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={salesPlainText(`Product ${idx + 1}`)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderClick();
                    }}
                    className="w-full h-9 text-xs font-bold rounded-lg text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    অর্ডার করুন
                  </Button>
                </div>
              </motion.div>
            )))}
          </div>
        </div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-1 mt-2">
          {renderSalesText(images.map((_, idx) => (
            <div 
              key={idx}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: idx === 0 ? colors.accent : isLightTheme ? '#ddd' : 'rgba(255,255,255,0.2)'
              }}
            />
          )))}
        </div>
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

export default GalleryVariant03;
