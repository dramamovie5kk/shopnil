import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Phone, MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ContactVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 02: Compact Layout - Side-by-side buttons in a card
const ContactVariant02 = ({ page, colors, isLightTheme }: ContactVariantProps) => {
  return (
    <section 
      className="py-8 px-3"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-5 backdrop-blur-lg"
          style={{
            background: isLightTheme ? '#fff' : 'rgba(255,255,255,0.05)',
            border: isLightTheme ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isLightTheme ? '0 10px 40px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: isLightTheme ? colors.text : '#fff' }}>
              {renderSalesText(page.contact_headline)}
            </h2>
            <p className="text-sm" style={{ color: colors.accent }}>
              {renderSalesText(page.contact_subheadline)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <motion.a
              href={page.contact_phone_link}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">কল করুন</span>
              <span className="text-sm font-bold">{renderSalesText(page.contact_phone)}</span>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href={getWhatsAppUrl(page.contact_whatsapp || "")}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">হোয়াটসঅ্যাপ</span>
              <span className="text-sm font-bold">{renderSalesText(page.contact_whatsapp_text)}</span>
            </motion.a>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
                {renderSalesText(page.contact_availability)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactVariant02;
