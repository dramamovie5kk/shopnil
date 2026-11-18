import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { ArrowRight, ShoppingCart } from "lucide-react";

interface HeroVariantProps {
  page: SalesPage;
  colors: any;
  onOrderClick: () => void;
}

// Variant 03: Image Grid Style - 4 product images in grid with order buttons
const HeroVariant03 = ({ page, colors, onOrderClick }: HeroVariantProps) => {
  const images = page.gallery_images?.slice(0, 4) || page.hero_images?.slice(0, 4) || [];

  return (
    <section 
      className="relative overflow-hidden px-3 py-6"
      style={{ 
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.background} 100%)`
      }}
    >
      <div className="relative z-10 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-bold"
            style={{ 
              backgroundColor: colors.accent,
              color: '#fff'
            }}
          >
            ✨ {renderSalesText(page.hero_badge_text || "সীমিত সময়ের অফার")} ✨
          </span>
        </motion.div>

        {/* Price & Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-black text-white mb-2"
        >
          মাত্র <span style={{ color: colors.accent }}>{renderSalesText(page.price_unit)}{renderSalesText(page.offer_price)}</span> টাকায়
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-lg md:text-xl font-medium text-white/90 mb-6"
        >
          {renderSalesText(page.hero_headline)}
        </motion.p>

        {/* Image Grid - 2x2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {renderSalesText(images.map((image, i) => (
            <div 
              key={i}
              className="relative rounded-xl overflow-hidden aspect-[3/4] group"
            >
              <img 
                src={image} 
                alt={salesPlainText(`Product ${i + 1}`)}
                className="w-full h-full object-cover"
              />
              {/* Order button on each image */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <Button
                  size="sm"
                  onClick={onOrderClick}
                  className="w-full h-9 text-sm font-bold rounded-lg text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  অর্ডার করুন
                </Button>
              </div>
            </div>
          )))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            onClick={onOrderClick}
            className="w-full h-14 text-lg font-bold rounded-xl text-white"
            style={{ 
              backgroundColor: colors.accent,
              boxShadow: `0 8px 30px -8px ${colors.accent}80`
            }}
          >
            {renderSalesText(page.cta_button_text || "এখনই অর্ডার করুন")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVariant03;
