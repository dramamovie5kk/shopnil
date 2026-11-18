import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Phone, MessageCircle, Headphones } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

interface ContactVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 03: Minimal Layout - Icon-focused with subtle styling
const ContactVariant03 = ({ page, colors, isLightTheme }: ContactVariantProps) => {
  return (
    <section 
      className="py-8 px-3"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
          >
            <Headphones className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.contact_headline)}
          </h2>
          <p className="text-sm" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
            {renderSalesText(page.contact_subheadline)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4"
        >
          {/* Phone */}
          <motion.a
            href={page.contact_phone_link}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2"
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium" style={{ color: isLightTheme ? colors.text : '#fff' }}>
              কল করুন
            </span>
          </motion.a>

          {/* WhatsApp */}
          <motion.a
            href={getWhatsAppUrl(page.contact_whatsapp || "")}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2"
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium" style={{ color: isLightTheme ? colors.text : '#fff' }}>
              হোয়াটসঅ্যাপ
            </span>
          </motion.a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-xs"
          style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.5 }}
        >
          {renderSalesText(page.contact_availability)}
        </motion.p>
      </div>
    </section>
  );
};

export default ContactVariant03;
