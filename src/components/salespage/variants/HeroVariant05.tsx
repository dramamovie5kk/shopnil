import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { ArrowRight, Phone, Heart } from "lucide-react";

interface HeroVariantProps {
  page: SalesPage;
  colors: any;
  onOrderClick: () => void;
}

// Variant 05: Minimal Style - Price + Image + CTA + Phone
const HeroVariant05 = ({ page, colors, onOrderClick }: HeroVariantProps) => {
  return (
    <section 
      className="relative overflow-hidden px-3 py-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="relative z-10 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto text-center">
        {/* Price with hearts */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 
            className="text-3xl md:text-4xl font-black flex items-center justify-center gap-2" 
            style={{ color: colors.text }}
          >
            <Heart className="w-6 h-6" style={{ color: colors.accent, fill: colors.accent }} />
            মাত্র {renderSalesText(page.price_unit)}{renderSalesText(page.offer_price)} টাকায়
            <Heart className="w-6 h-6" style={{ color: colors.accent, fill: colors.accent }} />
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-medium mb-6"
          style={{ color: colors.text, opacity: 0.9 }}
        >
          {renderSalesText(page.hero_headline)}
        </motion.p>

        {/* Product Image */}
        {renderSalesText(page.hero_images?.[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <img 
              src={page.hero_images[0]} 
              alt={salesPlainText(page.hero_headline)}
              className="w-[97%] mx-auto rounded-xl shadow-lg object-contain"
              style={{ maxHeight: '320px' }}
            />
          </motion.div>
        ))}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
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

        {/* Phone Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" style={{ color: colors.text }} />
          <a 
            href={`tel:${page.contact_phone || '01629849154'}`}
            className="text-xl font-bold hover:underline"
            style={{ color: colors.text }}
          >
            {renderSalesText(page.contact_phone || '01629849154')}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVariant05;