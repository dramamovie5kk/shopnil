import type { CSSProperties } from 'react';
import { ArrowRight, Check, Phone } from 'lucide-react';
import type { SalesPage } from '@/types/salesPage';
import { renderSalesText } from './SalesRichText';
import { salesPlainText } from '@/lib/salesRichText';
import { template02DialNumber } from '@/lib/template02Designs';
import ReviewVideo from './ReviewVideo';

export const t2DefaultHeroColors = [
  ['bg', 'পটভূমি', '#0b0b0b'],
  ['header_bg', 'হেডারের পটভূমি', '#111111'],
  ['accent', 'সোনালি রং', '#d4a63a'],
  ['heading', 'শিরোনামের রং', '#ffffff'],
  ['text', 'লেখার রং', '#e5e5e5'],
  ['button_text', 'বোতামের লেখার রং', '#111111'],
] as const;

export const t2DefaultHeroParts = [['brand','ব্র্যান্ডের নাম'],['call','কল বোতাম'],['media','ছবি/ভিডিও'],['badge','ব্যাজ'],['title','শিরোনাম'],['accent','শিরোনামের সোনালি অংশ'],['desc','বর্ণনা'],['order','অর্ডার বোতাম'],['perks','সুবিধার লেখা']] as const;
export const t2DefaultHeroProps = [['fontSize','ফন্ট সাইজ (px)','number'],['color','লেখার রং','color'],['background','পটভূমি','color'],['borderColor','বর্ডারের রং','color'],['borderWidth','বর্ডার (px)','number'],['radius','রেডিয়াস (px)','number'],['paddingY','উপর-নিচ প্যাডিং (px)','number'],['paddingX','ডান-বাম প্যাডিং (px)','number'],['width','ডেস্কটপ উইথ (%)','number']] as const;
const hex = (v?: string) => /^#[\da-f]{6}$/i.test(v ?? '') ? v : undefined;
const num = (v?: string) => v && Number.isFinite(Number(v)) ? Number(v) : undefined;
export function t2dPartStyle(s: Record<string, string>, part: string): CSSProperties {
  const g = (k: string) => s[`t2dc_${part}_${k}`];
  const st: CSSProperties = {};
  const fs = num(g('fontSize')); if (fs) st.fontSize = fs;
  if (hex(g('color'))) st.color = g('color');
  if (hex(g('background'))) st.background = g('background');
  if (hex(g('borderColor'))) { st.borderColor = g('borderColor'); st.borderStyle = 'solid'; }
  const bw = num(g('borderWidth')); if (bw !== undefined) { st.borderWidth = bw; st.borderStyle = 'solid'; }
  const r = num(g('radius')); if (r !== undefined) st.borderRadius = r;
  const py = num(g('paddingY')); if (py !== undefined) { st.paddingTop = py; st.paddingBottom = py; }
  const px = num(g('paddingX')); if (px !== undefined) { st.paddingLeft = px; st.paddingRight = px; }
  const w = num(g('width')); if (w) (st as Record<string, string>)['--t2d-w'] = `${Math.min(100, Math.max(10, w))}%`;
  return st;
}

export default function Template02DefaultHero({ page, onOrderClick }: { page: SalesPage; onOrderClick: () => void }) {
  const s = (page.template_styles?.hero ?? {}) as Record<string, string>;
  const t = (key: string, fallback?: string | null) => s[`t2d_${key}`] ?? fallback ?? '';
  const vars: Record<string, string> = {};
  for (const [key, , def] of t2DefaultHeroColors) vars[`--t2d-${key.replace('_', '-')}`] = /^#[\da-f]{6}$/i.test(s[`t2d_${key}`] ?? '') ? s[`t2d_${key}`] : def;
  const contact = page.template_styles?.contact ?? {};
  const phone = template02DialNumber(page.contact_phone || page.contact_phone_link || '', contact.phoneCountryCode);
  const image = page.hero_images?.[0] || page.products?.image_url;
  const video = t('video_url');
  const perks = t('perks', 'ক্যাশ অন ডেলিভারি\nসাইজ এক্সচেঞ্জ সুবিধা').split('\n').map(p => p.trim()).filter(Boolean);
  const brand = t('brand', 'Stylor fashion');
  const ps = (part: string) => t2dPartStyle(s, part);
  const showHeader = s.t2d_header !== '0';
  return (
    <section key="hero" className="t2d-hero" style={vars as CSSProperties}>
      {showHeader && <header className="t2d-header"><div className="t2d-wrap t2d-header-row">
        <strong className="t2d-brand" style={ps('brand')}>{renderSalesText(brand)}</strong>
        {phone && <a className="t2d-call" style={ps('call')} href={`tel:${phone}`}><Phone size={14} />{renderSalesText(t('call_text', 'কল করুন'))}</a>}
      </div></header>}
      <div className="t2d-wrap t2d-body">
        <div className="t2d-media" style={ps('media')}>
          {video ? <div className="t2d-video"><ReviewVideo url={video} title={salesPlainText(page.title)} /></div>
            : image ? <img src={image} alt={salesPlainText(page.title)} loading="eager" decoding="async" /> : null}
        </div>
        <div className="t2d-copy">
          {t('badge', page.hero_badge_text) && <span className="t2d-badge" style={ps('badge')}>{renderSalesText(t('badge', page.hero_badge_text))}</span>}
          <h1 className="t2d-title" style={ps('title')}>{renderSalesText(t('title', page.hero_headline || page.title))}{t('title_accent') && <> <span className="t2d-accent" style={ps('accent')}>{renderSalesText(t('title_accent'))}</span></>}</h1>
          {t('desc', page.hero_subheadline) && <p className="t2d-desc" style={ps('desc')}>{renderSalesText(t('desc', page.hero_subheadline))}</p>}
          <button type="button" className="t2d-order" style={ps('order')} onClick={onOrderClick}>{renderSalesText(t('button', page.cta_button_text || 'এখনই অর্ডার করুন'))}<ArrowRight size={18} /></button>
          {perks.length > 0 && <ul className="t2d-perks" style={ps('perks')}>{perks.map((p, i) => <li key={i}><Check size={14} />{renderSalesText(p)}</li>)}</ul>}
        </div>
      </div>
    </section>
  );
}
