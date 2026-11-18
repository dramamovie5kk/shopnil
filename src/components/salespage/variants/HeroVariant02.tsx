import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SalesPage } from "@/types/salesPage";
import { Clock, ArrowRight, Zap } from "lucide-react";

interface HeroVariantProps {
  page: SalesPage;
  colors: any;
  onOrderClick: () => void;
}

// Variant 02: Countdown/Urgency Style - Dark background with countdown timer
const HeroVariant02 = ({ page, colors, onOrderClick }: HeroVariantProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endDate = page.countdown_end_date 
      ? new Date(page.countdown_end_date) 
      : new Date(Date.now() + 86400000);

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = endDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [page.countdown_end_date]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <section 
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-3 py-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="relative z-10 text-center max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full">
        {/* Fire Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
          style={{ 
            backgroundColor: `${colors.accent}20`,
            border: `1px solid ${colors.accent}40`
          }}
        >
          <span className="text-lg">🔥</span>
          <span className="text-sm font-bold" style={{ color: colors.accent }}>
            {renderSalesText(page.hero_badge_text || "স্টক ক্লিয়ারেন্স সেল লাইভ")}
          </span>
          <span className="text-lg">🔥</span>
        </motion.div>

        {/* Big Price */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black mb-2"
          style={{ color: colors.accent }}
        >
          মাত্র {renderSalesText(page.price_unit)}{renderSalesText(page.offer_price)} টাকায়
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg mb-6"
          style={{ color: colors.text, opacity: 0.9 }}
        >
          {renderSalesText(page.offer_details || page.hero_headline)}
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" style={{ color: colors.text, opacity: 0.7 }} />
            <span className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
              অফার শেষ হতে বাকি
            </span>
          </div>
          
          <div className="flex justify-center gap-3">
            {renderSalesText([
              { value: timeLeft.days, label: page.countdown_label_days || "দিন" },
              { value: timeLeft.hours, label: page.countdown_label_hours || "ঘন্টা" },
              { value: timeLeft.minutes, label: page.countdown_label_minutes || "মিনিট" },
              { value: timeLeft.seconds, label: page.countdown_label_seconds || "সেকেন্ড" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-1"
                  style={{ 
                    backgroundColor: colors.primary,
                    border: `2px solid ${colors.accent}40`
                  }}
                >
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {renderSalesText(formatNumber(item.value))}
                  </span>
                </div>
                <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                  {renderSalesText(item.label)}
                </p>
              </div>
            )))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
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

        {/* Urgency Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mt-4 flex items-center justify-center gap-1"
          style={{ color: colors.accent }}
        >
          <Zap className="w-4 h-4" />
          {renderSalesText(page.cta_urgency_text || "সীমিত স্টক! মিস করবেন না")}
        </motion.p>
      </div>
    </section>
  );
};

export default HeroVariant02;
