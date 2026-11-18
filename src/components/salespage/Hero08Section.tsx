import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { type CSSProperties, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { hero08ColorFields, hero08TextFields } from '@/lib/hero08Design';

export default function Hero08Section({ page, style, onOrderClick }: { page: SalesPage; style: CSSProperties; onOrderClick: () => void }) {
  const settings = page.template_styles?.hero;
  const text = (key: typeof hero08TextFields[number]['key']) => settings?.[key] ?? hero08TextFields.find(field => field.key === key)?.fallback ?? '';
  const title = settings?.text_headline ?? page.hero_headline ?? page.title;
  const images = page.hero_images?.filter(Boolean) || [];
  const [active, setActive] = useState(0);
  const image = images[active % images.length] || page.products?.image_url;
  const contact = page.template_styles?.contact;
  const number = (settings?.hero08_whatsapp_number ?? page.contact_whatsapp ?? '').trim();
  const digits = number.replace(/\D/g, '');
  const code = (contact?.whatsappCountryCode || '880').replace(/\D/g, '');
  const whatsappNumber = number.startsWith('+') || digits.startsWith(code) ? digits : code + digits.replace(/^0/, '');
  const whatsappText = settings?.text_hero08_whatsapp_message ?? page.contact_whatsapp_text ?? '';
  const customStyle = { ...style, ...Object.fromEntries(hero08ColorFields.flatMap(field => /^#[0-9a-fA-F]{6}$/.test(settings?.[field.key] || '') ? [[field.cssVar, settings?.[field.key]]] : [])) } as CSSProperties;
  return <section className="sales-hero sales-hero--08" style={customStyle} aria-label="পণ্যের পরিচিতি">
    {renderSalesText(text('text_hero08_topbar') && <div className="sales-hero08-topbar"><Flame size={13} aria-hidden="true" /><span>{renderSalesText(text('text_hero08_topbar'))}</span></div>)}
    <div className="sales-hero08-layout">
      <h1  >{renderSalesText(title)}</h1>
      <div className="sales-hero08-product">
        {renderSalesText(text('text_hero08_image_label') && <span className="sales-hero08-image-label">{renderSalesText(text('text_hero08_image_label'))}</span>)}
        {renderSalesText(image && <img src={image} alt={salesPlainText(title.replace(/<[^>]*>/g, ' '))} loading="eager" />)}
        {renderSalesText(images.length > 1 && <div className="sales-hero08-controls"><Button variant="ghost" size="icon" aria-label="আগের ছবি" onClick={() => setActive(n => (n - 1 + images.length) % images.length)}><ChevronLeft size={18} /></Button><span>{renderSalesText(active % images.length + 1)} / {renderSalesText(images.length)}</span><Button variant="ghost" size="icon" aria-label="পরের ছবি" onClick={() => setActive(n => n + 1)}><ChevronRight size={18} /></Button></div>)}
      </div>
      {renderSalesText(text('text_hero08_badge') && <div className="sales-hero08-badge"><i aria-hidden="true" />{renderSalesText(text('text_hero08_badge'))}</div>)}
      <div className="sales-hero08-checkout">
        <div className="sales-hero08-price-header"><div>
          <div className="sales-hero08-prices">{renderSalesText(page.offer_price > 0 && <strong>{renderSalesText(page.offer_price.toLocaleString('bn-BD'))}{renderSalesText(page.price_unit || '৳')}</strong>)}{renderSalesText(page.original_price != null && page.original_price > page.offer_price && <del>{renderSalesText(page.original_price.toLocaleString('bn-BD'))}{renderSalesText(page.price_unit || '৳')}</del>)}</div>
          {renderSalesText(text('text_hero08_price_note') && <p className="sales-hero08-price-note">{renderSalesText(text('text_hero08_price_note'))}</p>)}
        </div>{renderSalesText(text('text_hero08_stock') && <span className="sales-hero08-stock">{renderSalesText(text('text_hero08_stock'))}</span>)}</div>
        <div className="sales-hero08-actions">
          <Button type="button" className="sales-hero08-order" onClick={onOrderClick}>{renderSalesText(text('text_hero08_button'))}</Button>
          {renderSalesText(digits && <Button asChild variant="outline" className="sales-hero08-whatsapp"><a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(salesPlainText(whatsappText))}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={20} aria-hidden="true" />{renderSalesText(text('text_hero08_whatsapp'))}</a></Button>)}
        </div>
        {renderSalesText(text('text_hero08_delivery') && <p className="sales-hero08-delivery">{renderSalesText(text('text_hero08_delivery'))}</p>)}
      </div>
    </div>
  </section>;
}