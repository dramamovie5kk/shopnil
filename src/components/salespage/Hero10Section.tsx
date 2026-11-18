import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { hasSalesMarkup } from '@/lib/salesRichText';
import { useState, type CSSProperties } from 'react';
import { ArrowRight, Phone, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { SalesPage } from '@/types/salesPage';
import { hero10ColorFields, hero10TextFields } from '@/lib/hero10Design';
import OfferCountdown from './OfferCountdown';

export default function Hero10Section({ page, style, onOrderClick, dialNumber, callNumber }: { page: SalesPage; style: CSSProperties; onOrderClick: () => void; dialNumber: string; callNumber: string }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const settings = page.template_styles?.hero;
  const text = (key: typeof hero10TextFields[number]['key'], legacy?: string | null) => settings?.[key] ?? legacy ?? hero10TextFields.find(field => field.key === key)?.fallback ?? '';
  const title = (settings?.text_headline ?? page.hero_headline ?? page.title);
  const accent = text('text_hero10_accent');
  const parts = accent && !hasSalesMarkup(title) ? title.split(accent) : [title];
  const badge = text('text_hero10_badge', settings?.text_badge ?? page.hero_badge_text);
  const description = text('text_hero10_description', settings?.text_subtitle ?? page.hero_subheadline);
  const price = page.offer_price > 0 ? `${page.price_unit || '৳'}${page.offer_price.toLocaleString('bn-BD')}` : '';
  const videoUrl = settings?.hero10_video_url ?? page.hero_video_url ?? page.video_url ?? '';
  let embedUrl = '';
  try {
    const url = new URL(videoUrl);
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) {
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? url.pathname.split('/').pop();
      if (id && /^[\w-]{11}$/.test(id)) embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    } else if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').pop();
      if (id && /^\d+$/.test(id)) embedUrl = `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  } catch { /* No playable video configured. */ }
  const directVideo = /^https?:\/\/[^\s]+\.(mp4|webm|ogg)(\?[^\s]*)?$/i.test(videoUrl);
  const customStyle = { ...style, ...Object.fromEntries(hero10ColorFields.flatMap(field => /^#[0-9a-fA-F]{6}$/.test(settings?.[field.key] || '') ? [[field.cssVar, settings?.[field.key]]] : [])) } as CSSProperties;
  const heroImage = page.hero_images?.filter(Boolean)[0] || '';
  return <section className="sales-hero sales-hero--10" style={customStyle} aria-label="পণ্যের পরিচিতি">
    {renderSalesText(settings?.timer_enabled !== '0' && <OfferCountdown page={page} />)}
    <div className="sales-hero10-body">
      {renderSalesText(badge && <div className="sales-hero10-badge"><i aria-hidden="true" />{renderSalesText(badge)}</div>)}
      <h1>{renderSalesText(parts.map((part, index) => <span key={index}>{renderSalesText(index > 0 && <em>{renderSalesText(accent)}</em>)}{renderSalesText(part)}</span>))}</h1>
      {renderSalesText(heroImage && <figure className="sales-hero10-image"><img src={heroImage} alt={salesPlainText(title.trim() || 'পণ্যের ছবি')} loading="lazy" /></figure>)}
      {renderSalesText(description && <p className="sales-hero10-description">{renderSalesText(description)}</p>)}
      {renderSalesText(price && <div className="sales-hero10-price-panel">
        <div className="sales-hero10-price-label">{renderSalesText(text('text_hero10_price_label'))}</div>
        <div className="sales-hero10-prices"><strong>{renderSalesText(price)}</strong>{renderSalesText((page.original_price ?? 0) > page.offer_price && <del>{renderSalesText(page.price_unit || '৳')}{renderSalesText(page.original_price?.toLocaleString('bn-BD'))}</del>)}</div>
        {renderSalesText(text('text_hero10_offer_note') && <div className="sales-hero10-offer-note">{renderSalesText(text('text_hero10_offer_note'))}</div>)}
        {renderSalesText(text('text_hero10_benefit') && <div className="sales-hero10-benefit"><Sparkles size={15} aria-hidden="true" />{renderSalesText(text('text_hero10_benefit'))}</div>)}
        {renderSalesText(text('text_hero10_price_note') && <p className="sales-hero10-price-note">{renderSalesText(text('text_hero10_price_note'))}</p>)}
      </div>)}
      <div className="sales-hero10-actions"><Button className="sales-hero10-order" onClick={onOrderClick}>{renderSalesText(text('text_hero10_button', settings?.text_button ?? (page.cta_button_text || undefined)))}<ArrowRight size={20} aria-hidden="true" /></Button>
        {renderSalesText(callNumber.replace(/\D/g, '') && <Button asChild className="sales-hero10-call"><a href={`tel:${dialNumber}`} aria-label={`কল ${callNumber}`}><Phone size={20} aria-hidden="true" /><span>{renderSalesText(text('text_hero10_call'))} <strong>{renderSalesText(callNumber)}</strong></span></a></Button>)}
        {renderSalesText((embedUrl || directVideo) && <Button variant="outline" className="sales-hero10-video" onClick={() => setVideoOpen(true)}><Play size={16} fill="currentColor" aria-hidden="true" />{renderSalesText(text('text_hero10_video_button'))}</Button>)}
      </div>
      {renderSalesText(text('text_hero10_payment_note') && <p className="sales-hero10-payment-note">{renderSalesText(text('text_hero10_payment_note'))}</p>)}
    </div>
    <Dialog open={videoOpen} onOpenChange={setVideoOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{renderSalesText(text('text_hero10_video_button'))}</DialogTitle></DialogHeader>{renderSalesText(videoOpen && (embedUrl ? <iframe className="aspect-video w-full" src={embedUrl} title={salesPlainText(text('text_hero10_video_button'))} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : directVideo ? <video className="aspect-video w-full" src={videoUrl} controls autoPlay playsInline /> : null))}</DialogContent></Dialog>
  </section>;
}