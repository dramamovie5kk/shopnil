import { useId, type CSSProperties } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { renderSalesText } from './SalesRichText';
import { salesPlainText } from '@/lib/salesRichText';
import { appearanceDeclarations } from '@/lib/sectionAppearance';
import { template02DialNumber } from '@/lib/template02Designs';
import ReviewVideo, { getReviewVideoSource } from './ReviewVideo';
import { template02HeroImages } from '@/lib/template02HeroImages';
import Template02HeroImageCarousel from './Template02HeroImageCarousel';

export const t2Hero01Parts = [['announcement', 'টপ মেসেজ'], ['header', 'ব্র্যান্ড হেডার'], ['logo', 'লোগো'], ['brand', 'ব্র্যান্ডের নাম'], ['tagline', 'ব্র্যান্ডের নিচের লেখা'], ['headerOrder', 'হেডারের অর্ডার বোতাম'], ['heading', 'শিরোনাম'], ['video', 'ভিডিও'], ['images', 'দুই কলামের ছবি'], ['order', 'নিচের অর্ডার বোতাম'], ['call', 'কল বোতাম'], ['note', 'নিচের হালকা লেখা']] as const;
export const t2Hero01Props = [['color', 'লেখার রং', 'color'], ['background', 'পটভূমি', 'color'], ['fontSize', 'ফন্ট সাইজ (px)', 'number'], ['width', 'উইথ (%)', 'number'], ['paddingTop', 'উপরে প্যাডিং (px)', 'number'], ['paddingBottom', 'নিচে প্যাডিং (px)', 'number'], ['paddingLeft', 'বামে প্যাডিং (px)', 'number'], ['paddingRight', 'ডানে প্যাডিং (px)', 'number'], ['marginTop', 'উপরে মার্জিন (px)', 'number'], ['marginBottom', 'নিচে মার্জিন (px)', 'number'], ['borderColor', 'বর্ডারের রং', 'color'], ['borderWidth', 'বর্ডার (px)', 'number'], ['radius', 'রেডিয়াস (px)', 'number']] as const;

export default function Template02Hero01({ page, onOrderClick }: { page: SalesPage; onOrderClick: () => void }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const s = page.template_styles?.hero ?? {};
  const value = (key: string, fallback = '') => { const stored = s[`text_${key}`]; return stored === undefined ? fallback : stored; };
  const shown = (key: string, fallback = '') => value(key, fallback).trim() !== '';
  const text = (key: string, fallback = '') => renderSalesText(value(key, fallback));
  const phone = template02DialNumber(page.contact_phone || page.contact_phone_link || '', page.template_styles?.contact?.phoneCountryCode);
  const logo = s.t2h1_logo;
  const images = template02HeroImages(page, s);
  const video = s.t2h1_video_url ?? page.hero_video_url ?? '';
  const vars: Record<string, string> = {};
  for (const key of ['background', 'surface', 'heading', 'text', 'accent', 'buttonText', 'border', 'announcementText', 'dot']) {
    if (/^#[\da-f]{6}$/i.test(s[`t2_${key}`] ?? '')) vars[`--t2-${key}`] = s[`t2_${key}`];
  }
  const css = t2Hero01Parts.map(([part]) => {
    const values = Object.fromEntries(t2Hero01Props.map(([prop]) => [`${part}.${prop}`, s[`t2h1_${part}_${prop}`] ?? '']));
    return `[data-t2h1="${id}"] [data-t2h1-part="${part}"]{${appearanceDeclarations(values, part)}}`;
  }).join('\n');
  return <section className="sales-t2 sales-t2--hero sales-t2--1 t2h1" data-t2h1={id} data-t2-section="hero" data-t2-design="t2-01" style={vars as CSSProperties}>
    <style>{css}</style>
    {shown('announcement', 'সীমিত স্টক: মিস করবেন না') && <div className="t2h1-announcement" data-t2h1-part="announcement"><span aria-hidden="true" />{text('announcement', 'সীমিত স্টক: মিস করবেন না')}</div>}
    <header className="t2h1-header" data-t2h1-part="header"><div className="t2h1-header-inner">
      <div className="t2h1-brand-group"><div className="t2h1-logo" data-t2h1-part="logo">{logo ? <img src={logo} alt={salesPlainText(value('brand', 'সুপার কোয়ালিটি অফার'))} /> : text('logo_letter', 'A')}</div><div className="t2h1-brand-copy">{shown('brand', 'সুপার কোয়ালিটি অফার') && <strong data-t2h1-part="brand">{text('brand', 'সুপার কোয়ালিটি অফার')}</strong>}{shown('brand_subtitle', '3 Set Best Deal Combo') && <p data-t2h1-part="tagline">{text('brand_subtitle', '3 Set Best Deal Combo')}</p>}</div></div>
      {shown('header_button', 'এখনই অর্ডার করুন') && <Button type="button" className="t2h1-header-order" data-t2h1-part="headerOrder" onClick={onOrderClick}>{text('header_button', 'এখনই অর্ডার করুন')}</Button>}
    </div></header>
    <div className="t2h1-body">
      {shown('headline', page.hero_headline || page.title) && <h1 data-t2h1-part="heading">{text('headline', page.hero_headline || page.title)}</h1>}
      {getReviewVideoSource(video) && <div className="t2h1-video" data-t2h1-part="video"><ReviewVideo url={video} title={page.title} /></div>}
      {images.length > 0 && <div className="t2h1-images" data-t2h1-part="images"><Template02HeroImageCarousel images={images} title={page.title} /></div>}
      {(shown('button', page.cta_button_text || 'অর্ডার করুন') || (phone && shown('call', 'কল করুন'))) && <div className="t2h1-actions">{shown('button', page.cta_button_text || 'অর্ডার করুন') && <Button type="button" className="t2-order" data-t2h1-part="order" onClick={onOrderClick}>{text('button', page.cta_button_text || 'অর্ডার করুন')}<ArrowRight size={18} /></Button>}{phone && shown('call', 'কল করুন') && <Button asChild variant="outline" className="t2-call" data-t2h1-part="call"><a href={`tel:${phone}`}><Phone size={18} />{text('call', 'কল করুন')}</a></Button>}</div>}
      {shown('urgency', page.cta_urgency_text || '') && <p className="t2h1-note" data-t2h1-part="note">{text('urgency', page.cta_urgency_text || '')}</p>}
    </div>
  </section>;
}
