import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Phone, MessageCircle, Clock } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ContactVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 01: Standard Layout - Gradient buttons with availability badge
const ContactVariant01 = ({ page, colors, isLightTheme }: ContactVariantProps) => {
  return (
    <section 
      className="py-8 px-3 relative overflow-hidden"
      style={{ backgroundColor: isLightTheme ? colors.background : '#0a0a0f' }}
    >
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colors.primary }}
      />

      <div className="relative max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.contact_headline)}
          </h2>
          <p style={{ color: colors.accent }} className="text-sm font-medium">
            {renderSalesText(page.contact_subheadline)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-2.5"
        >
          {/* Phone Button */}
          <motion.a
            href={page.contact_phone_link}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 w-full p-3 rounded-xl transition-all"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}90)`,
              boxShadow: `0 8px 20px -8px ${colors.primary}40`
            }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white/70 text-xs">ফোন অর্ডার</p>
              <p className="text-white text-base font-bold truncate">{renderSalesText(page.contact_phone)}</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white flex-shrink-0">
              কল করুন
            </div>
          </motion.a>

          {/* WhatsApp Button */}
          <motion.a
            href={getWhatsAppUrl(page.contact_whatsapp || "")}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 w-full p-3 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              boxShadow: '0 8px 20px -8px rgba(37, 211, 102, 0.4)'
            }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white/80 text-xs">হোয়াটসঅ্যাপ</p>
              <p className="text-white text-base font-bold truncate">{renderSalesText(page.contact_whatsapp_text)}</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white flex-shrink-0">
              মেসেজ করুন
            </div>
          </motion.a>
        </motion.div>

        {/* Availability Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-center"
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: isLightTheme ? `${colors.primary}10` : 'rgba(255,255,255,0.05)',
              border: isLightTheme ? `1px solid ${colors.primary}30` : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Clock className="w-3 h-3" style={{ color: colors.accent }} />
            </div>
            <span className="text-xs font-medium" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.8 }}>
              {renderSalesText(page.contact_availability)}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactVariant01;
