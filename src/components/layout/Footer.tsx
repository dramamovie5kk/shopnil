import FooterPayments from "./FooterPayments";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, MessageCircle, Phone, MapPin, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { getWhatsAppUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { defaultQuickLinks, defaultCustomerServiceLinks, parseFooterLinks, footerHref } from "@/lib/footerLinks";

const Footer = () => {
  const { getSetting, settings } = useSiteSettings();
  const { t } = useLanguage();
  const value = (key: string, fallback = "") => settings.find(s => s.setting_key === key)?.setting_value ?? fallback;
  const siteName = getSetting("site_name", "সাজিব");
  const logoUrl = getSetting("site_logo_url");
  const phone = value("footer_phone", "01700-000000");
  const whatsapp = value("footer_whatsapp_number") || getSetting("whatsapp_number") || phone;
  const address = value("footer_address");
  const description = value("footer_description");
  const quick = parseFooterLinks(value("footer_quick_links"), defaultQuickLinks);
  const service = parseFooterLinks(value("footer_customer_service_links"), defaultCustomerServiceLinks);
  const socials = [
    { href: value("social_facebook"), icon: Facebook, label: "Facebook" },
    { href: value("social_youtube"), icon: Youtube, label: "YouTube" },
    { href: value("social_instagram"), icon: Instagram, label: "Instagram" },
  ].filter(s => s.href && s.href !== "#");
  return (
    <footer className="site-footer">
      <div className="max-w-[1240px] mx-auto px-5 pt-7 pb-4">
        {value("footer_show_brand", "1") !== "0" && (logoUrl || description || socials.length > 0) && (
          <div className="flex flex-wrap items-center gap-4 pb-5 mb-6 footer-brand-row">
            {logoUrl && <img src={logoUrl} alt={siteName} className="h-11 w-auto max-w-36 object-contain" />}
            {description && <p className="text-sm leading-relaxed flex-1 min-w-0 max-w-xl opacity-90">{description}</p>}
            <div className="flex gap-2">{socials.map(s => <Button key={s.label} asChild variant="ghost" size="icon" className="footer-icon h-9 w-9 rounded-full"><a href={footerHref(s.href)} target="_blank" rel="noopener noreferrer" aria-label={s.label}><s.icon className="h-4 w-4" /></a></Button>)}</div>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr] gap-x-6 gap-y-6">
          {[{ links: quick, title: value("footer_quick_title", t('footer.quick_links')) }, { links: service, title: value("footer_service_title", t('footer.customer_service')) }].map((group, index) => (
            <nav key={index} aria-label={group.title || (index === 0 ? 'Quick Links' : 'Customer Service')} className="min-w-0">
              {group.title && <h4 className="footer-heading text-sm font-semibold mb-3">{group.title}</h4>}
              <ul className="space-y-1">{group.links.filter(l => l.label.trim()).map(link => <li key={link.id}>
                <Button asChild variant="link" className="footer-link group h-auto min-h-8 justify-start text-left whitespace-normal px-0 py-1 text-sm"><Link to={footerHref(link.url)}><ChevronRight className="h-3.5 w-3.5 footer-link-arrow" />{link.label}</Link></Button>
              </li>)}</ul>
            </nav>
          ))}
          {value("footer_show_contact", "1") !== "0" && <div className="col-span-2 lg:col-span-1 min-w-0">
            <h4 className="footer-heading text-sm font-semibold mb-3">{value("footer_contact_title", "যোগাযোগ")}</h4>
            {address && <p className="flex items-start gap-2 text-sm mb-3 opacity-90"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />{address}</p>}
            <div className="grid grid-cols-2 gap-2.5">
              {phone && <Button asChild variant="outline" className="footer-call h-auto min-h-11 px-3 py-2 whitespace-normal text-xs rounded-xl"><a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}><Phone className="h-4 w-4" /><span>{value("footer_call_label", "কল করুন")}<br /><b>{phone}</b></span></a></Button>}
              {whatsapp && <Button asChild className="footer-whatsapp h-auto min-h-11 px-3 py-2 whitespace-normal text-xs rounded-xl"><a href={getWhatsAppUrl(whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /><span>{value("footer_whatsapp_label", "WhatsApp")}<br /><b>{whatsapp}</b></span></a></Button>}
            </div>
            <FooterPayments />
          </div>}
        </div>
        <div className="footer-bottom mt-6 pt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <p>{value("copyright_text", `© ${new Date().getFullYear()} ${siteName}. ${t('footer.all_rights')}`)}</p>
          {value("developer_text", "Developed by Rebuild It") && <p className="footer-credit">{value("developer_text", "Developed by Rebuild It")}</p>}
        </div>
      </div>
    </footer>
  );
};
export default Footer;
