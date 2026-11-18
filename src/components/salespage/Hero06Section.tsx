import { salesPlainText, splitSalesText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import type { CSSProperties } from 'react';
import { ArrowRight, Flame, Phone, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';

export default function Hero06Section({ page, style, onOrderClick, dialNumber, callNumber }: {
  page: SalesPage; style: CSSProperties; onOrderClick: () => void; dialNumber: string; callNumber: string;
}) {
  const settings = page.template_styles?.hero;
  const images = page.hero_images?.filter(Boolean).slice(0, 4) || [];
  const pictures = images.length ? images : page.products?.image_url ? [page.products.image_url] : [];
  const title = settings?.text_headline ?? page.hero_headline ?? page.title;
  const announcement = settings?.text_hero06_topbar ?? settings?.text_urgency ?? page.cta_urgency_text;
  const badge = settings?.text_badge ?? page.hero_badge_text;
  const accent = settings?.text_hero06_accent ?? '';
  const description = settings?.text_subtitle ?? page.hero_subheadline;
  const order = settings?.text_hero06_button ?? settings?.text_button ?? page.cta_button_text ?? 'অর্ডার করুন এখনই';
  const call = settings?.text_hero06_call ?? 'কল করুন:';
  const perks = splitSalesText(settings?.text_hero06_perks ?? '', '\n').map(item => item.trim()).filter(Boolean);
  return <section className="sales-hero sales-hero--06" style={style} aria-label="পণ্যের পরিচিতি">
    {renderSalesText(announcement && <div className="sales-hero06-announcement"><Flame size={16} aria-hidden="true" /><span>{renderSalesText(announcement)}</span></div>)}
    <div className="sales-hero06-layout">
      {renderSalesText(pictures.length > 0 && <div className={`sales-hero06-gallery sales-hero06-gallery--${pictures.length}`}>
        {renderSalesText(pictures.map((src, index) => <img key={`${src}-${index}`} src={src} alt={salesPlainText(`${title.replace(/<[^>]*>/g, ' ')} — ${index + 1}`)} loading="eager" />))}
      </div>)}
      <div className="sales-hero06-copy">
        {renderSalesText(badge && <div className="sales-hero06-badge"><Star size={14} aria-hidden="true" /><span>{renderSalesText(badge)}</span></div>)}
        <h1><span  >{renderSalesText(title)}</span>{renderSalesText(accent && <em>{renderSalesText(accent)}</em>)}</h1>
        {renderSalesText(description && <p className="sales-hero06-description">{renderSalesText(description)}</p>)}
        {renderSalesText(page.offer_price > 0 && <div className="sales-hero06-prices"><strong>{renderSalesText(page.offer_price.toLocaleString('bn-BD'))}{renderSalesText(page.price_unit || '৳')}</strong>{renderSalesText(page.original_price != null && page.original_price > page.offer_price && <del>{renderSalesText(page.original_price.toLocaleString('bn-BD'))}{renderSalesText(page.price_unit || '৳')}</del>)}</div>)}
        <div className="sales-hero06-actions">
          <Button className="sales-hero06-order" onClick={onOrderClick}><ShoppingCart size={19} aria-hidden="true" /><span>{renderSalesText(order)}</span><ArrowRight size={18} aria-hidden="true" /></Button>
          {renderSalesText(dialNumber && <Button asChild variant="outline" className="sales-hero06-call"><a href={`tel:${dialNumber}`}><Phone size={20} aria-hidden="true" /><span>{renderSalesText(call)} {renderSalesText(callNumber)}</span></a></Button>)}
        </div>
        {renderSalesText(perks.length > 0 && <ul className="sales-hero06-perks">{renderSalesText(perks.map((item, index) => <li key={index}>{renderSalesText(item)}</li>))}</ul>)}
      </div>
    </div>
  </section>;
}