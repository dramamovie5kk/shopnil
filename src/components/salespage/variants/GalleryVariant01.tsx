import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { ShoppingCart, ZoomIn, X } from "lucide-react";

interface GalleryVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
  onOrderClick: () => void;
}

// Variant 01: Grid Layout - 2-column grid with order buttons on each image
const GalleryVariant01 = ({ page, colors, isLightTheme, onOrderClick }: GalleryVariantProps) => {
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
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            আমাদের কালেকশন
          </p>
          <h2 className="text-lg font-bold" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            যেমন দেখছেন, <span style={{ color: colors.accent }}>তেমনই পাবেন</span>
          </h2>
        </motion.div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-2">
          {renderSalesText(images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="relative rounded-xl overflow-hidden aspect-[3/4] group"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={salesPlainText(`Product ${idx + 1}`)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Order button overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderClick();
                  }}
                  className="w-full h-9 text-xs font-bold rounded-lg text-white"
                  style={{ 
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                  }}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  অর্ডার করুন
                </Button>
              </div>
            </motion.div>
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

export default GalleryVariant01;
