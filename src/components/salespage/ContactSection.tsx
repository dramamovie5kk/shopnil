import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Headphones, MessageCircle, Phone } from "lucide-react";
import { SalesPage } from "@/types/salesPage";
import { getWhatsAppUrl } from "@/lib/utils";
import { getContactColorVariables, getContactDesign } from "@/lib/contactDesigns";
import { supportsSectionDesigns } from "@/lib/salesSectionDesignAvailability";
import { getTemplateStyles } from "@/lib/salesPageTemplates";
import ContactVariant01 from "./variants/ContactVariant01";

const ContactSection = ({ page }: { page: SalesPage }) => {
  const settings = page.template_styles?.contact;
  const design = getContactDesign(settings?.design ?? page.contact_variant);
  const variables = getContactColorVariables(settings);
  const reducedMotion = useReducedMotion();
  if (!supportsSectionDesigns(page.template_id) || (page.template_id === 'template-02-clothing' && !settings?.design)) {
    const { colors } = getTemplateStyles(page.template_id);
    return <ContactVariant01 page={{ ...page, contact_availability: '' }} colors={colors} isLightTheme={true} />;
  }
  const copy = (key: string, fallback: string) => settings?.[`text_${key}`]?.trim() || fallback;
  const number = page.contact_phone?.trim() ?? "";
  const whatsapp = page.contact_whatsapp?.trim() ?? "";
  const phoneCode = settings?.phoneCountryCode?.replace(/\D/g, "") ?? "";
  const whatsappCode = settings?.whatsappCountryCode?.replace(/\D/g, "") ?? "";
  const phoneDigits = number.replace(/\D/g, "");
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  const dialNumber = phoneCode && !number.trim().startsWith("+")
    ? `+${phoneDigits.startsWith(phoneCode) ? phoneDigits : phoneCode + phoneDigits.replace(/^0/, "")}`
    : number.replace(/[^\d+]/g, "");
  const whatsappNumber = whatsappCode && !whatsapp.trim().startsWith("+") && !/^https?:|^wa\.me\//i.test(whatsapp)
    ? `+${whatsappDigits.startsWith(whatsappCode) ? whatsappDigits : whatsappCode + whatsappDigits.replace(/^0/, "")}`
    : whatsapp;

  const phoneButton = phoneDigits && (
    <a href={`tel:${dialNumber}`} className="contact-action contact-action--phone" aria-label={salesPlainText(`${copy("phoneAction", "কল করুন")} ${number}`)}>
      <span className="contact-action-icon"><Phone className="h-5 w-5" /></span>
      <span className="contact-action-copy"><span className="contact-action-hint">{renderSalesText(copy("phoneLabel", "ফোনে অর্ডার"))}</span><strong>{renderSalesText(number)}</strong></span>
      <span className="contact-action-end">{renderSalesText(copy("phoneAction", "কল করুন"))}<ArrowUpRight className="h-4 w-4" /></span>
    </a>
  );
  const whatsappButton = whatsapp && (whatsappDigits || /^https?:|^wa\.me\//i.test(whatsapp)) && (
    <a href={getWhatsAppUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="contact-action contact-action--whatsapp" aria-label={salesPlainText(page.contact_whatsapp_text || "হোয়াটসঅ্যাপ মেসেজ")}>
      <span className="contact-action-icon"><MessageCircle className="h-5 w-5" /></span>
      <span className="contact-action-copy"><span className="contact-action-hint">{renderSalesText(copy("whatsappLabel", "হোয়াটসঅ্যাপ"))} · {renderSalesText(whatsapp)}</span><strong>{renderSalesText(page.contact_whatsapp_text || "হোয়াটসঅ্যাপ মেসেজ")}</strong></span>
      <span className="contact-action-end">{renderSalesText(copy("whatsappAction", "মেসেজ করুন"))}<ArrowUpRight className="h-4 w-4" /></span>
    </a>
  );

  return (
    <section className="sales-contact" data-contact-design={design} style={variables as CSSProperties}>
      <motion.div className="sales-contact-inner" initial={reducedMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="sales-contact-panel">
          <div className="contact-heading">
            {renderSalesText(design !== "01" && <span className="contact-heading-icon"><Headphones className="h-6 w-6" /></span>)}
            <div>
              <h2>{renderSalesText(page.contact_headline || "যেকোনো প্রয়োজনে কল করুন")}</h2>
              {renderSalesText(page.contact_subheadline && <p>{renderSalesText(page.contact_subheadline)}</p>)}
            </div>
          </div>
          <div className="contact-actions">{renderSalesText(phoneButton)}{renderSalesText(whatsappButton)}</div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
