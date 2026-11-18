import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
 import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
 import { SalesPage } from "@/types/salesPage";
import { ArrowRight, ChevronDown } from "lucide-react";
 
 interface HeroVariantProps {
   page: SalesPage;
   colors: any;
   onOrderClick: () => void;
 }
 
// Variant 04: Image Showcase Style - Large product images with scroll indicator
 const HeroVariant04 = ({ page, colors, onOrderClick }: HeroVariantProps) => {
   const images = page.gallery_images?.slice(0, 4) || page.hero_images?.slice(0, 4) || [];
 
   return (
     <section 
      className="relative overflow-hidden"
       style={{ 
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.background} 100%)`
       }}
     >
      <div className="relative z-10 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-3 pt-6 pb-8 text-center">
         {/* Badge */}
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
          className="mb-4"
         >
           <span 
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold"
             style={{ 
              backgroundColor: `${colors.accent}20`,
              color: colors.accent,
              border: `1px solid ${colors.accent}40`
             }}
           >
             🔥 {renderSalesText(page.hero_badge_text || "সীমিত সময়ের অফার")}
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
          className="text-lg font-medium text-white/80 mb-6"
        >
          {renderSalesText(page.hero_headline)}
        </motion.p>
 
        {/* Image Grid - 2x2 without buttons */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-4"
         >
           {renderSalesText(images.map((image, i) => (
             <div 
               key={i}
              className="relative rounded-xl overflow-hidden aspect-[3/4] shadow-lg"
              style={{ border: `2px solid ${colors.accent}40` }}
             >
               <img 
                 src={image} 
                 alt={salesPlainText(`Product ${i + 1}`)}
                 className="w-full h-full object-cover"
               />
              {/* Price badge on first image */}
              {renderSalesText(i === 0 && (
                <div 
                  className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  {renderSalesText(page.price_unit)}{renderSalesText(page.offer_price)}
                </div>
              ))}
             </div>
           )))}
         </motion.div>
 
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-white/50 text-sm flex items-center justify-center gap-1">
            নিচে স্ক্রল করে আরও দেখুন
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </p>
        </motion.div>

        {/* CTA Button */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
 
 export default HeroVariant04;