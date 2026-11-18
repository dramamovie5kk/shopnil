import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { hasSalesMarkup } from '@/lib/salesRichText';
import type { CSSProperties } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { hero09ColorFields, hero09TextFields } from '@/lib/hero09Design';

export default function Hero09Section({ page, style, onOrderClick, dialNumber, callNumber }: { page: SalesPage; style: CSSProperties; onOrderClick: () => void; dialNumber: string; callNumber: string }) {
  const settings = page.template_styles?.hero;
  const text = (key: typeof hero09TextFields[number]['key']) => settings?.[key] ?? hero09TextFields.find(field => field.key === key)?.fallback ?? '';
  const title = (settings?.text_headline ?? page.hero_headline ?? page.title);
  const accent = text('text_hero09_accent');
  const parts = accent && !hasSalesMarkup(title) ? title.split(accent) : [title];
  const images = page.hero_images?.filter(Boolean).slice(0, 5) || [];
  if (!images.length && page.products?.image_url) images.push(page.products.image_url);
  const customStyle = { ...style, ...Object.fromEntries(hero09ColorFields.flatMap(field => /^#[0-9a-fA-F]{6}$/.test(settings?.[field.key] || '') ? [[field.cssVar, settings?.[field.key]]] : [])) } as CSSProperties;
  return <section className="sales-hero sales-hero--09" style={customStyle} aria-label="পণ্যের পরিচিতি">
    <div className="sales-hero09-layout">
      <header className="sales-hero09-heading">
        <h1>{renderSalesText(parts.map((part, index) => <span key={index}>{renderSalesText(index > 0 && <em>{renderSalesText(accent)}</em>)}{renderSalesText(part)}</span>))}</h1>
        {renderSalesText(text('text_hero09_subtitle') && <p>{renderSalesText(text('text_hero09_subtitle'))}</p>)}
      </header>
      {renderSalesText(images.length > 0 && <div className={`sales-hero09-images sales-hero09-images--${images.length}`}>
        {renderSalesText(images.map((src, index) => <img key={`${src}-${index}`} src={src} alt={salesPlainText(`${title} — ${index + 1}`)} loading={index === 0 ? 'eager' : 'lazy'} />))}
      </div>)}
      {renderSalesText(text('text_hero09_badge') && <div className="sales-hero09-badge">{renderSalesText(text('text_hero09_badge'))}</div>)}
      <div className="sales-hero09-actions">
        <Button type="button" className="sales-hero09-order" onClick={onOrderClick}>{renderSalesText(text('text_hero09_button'))}</Button>
        {renderSalesText(dialNumber && <Button asChild className="sales-hero09-call"><a href={`tel:${dialNumber}`}><Phone size={19} aria-hidden="true" /><span>{renderSalesText(text('text_hero09_call'))} <strong>{renderSalesText(callNumber)}</strong></span></a></Button>)}
      </div>
    </div>
  </section>;
}