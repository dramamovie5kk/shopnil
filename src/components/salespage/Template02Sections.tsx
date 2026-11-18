import { useState, type CSSProperties } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Check, Phone, MessageCircle, Headphones, Sparkles, ShieldCheck, Truck, Gift, Scissors, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { renderSalesText } from './SalesRichText';
import { salesPlainText } from '@/lib/salesRichText';
import { getWhatsAppUrl } from '@/lib/utils';
import { template02DialNumber, type Template02Section } from '@/lib/template02Designs';
import ReviewVideo from './ReviewVideo';
import Template02Hero01 from './Template02Hero01';
import OfferCountdown from './OfferCountdown';
import { getTemplate02Hero02TimerDeadline } from '@/lib/offerCountdown';

export default function Template02Sections({ page, section, onOrderClick }: { page: SalesPage; section: Template02Section; onOrderClick: () => void }) {
  const [active, setActive] = useState(0);
  const settings = page.template_styles?.[section] ?? {};
  const variant = Number(settings.design?.slice(-1)) || 1;
  const value = (key: string, fallback: string | null | undefined) => { const stored = settings[`text_${key}`]; return stored === undefined ? (fallback ?? '') : stored; };
  const shown = (key: string, fallback: string | null | undefined) => value(key, fallback).trim() !== '';
  const copy = (key: string, fallback: string | null | undefined) => renderSalesText(value(key, fallback));
  const variables: Record<string, string> = {};
  for (const key of ['background', 'surface', 'heading', 'text', 'accent', 'buttonText', 'border']) {
    if (/^#[\da-f]{6}$/i.test(settings[`t2_${key}`] ?? '')) variables[`--t2-${key}`] = settings[`t2_${key}`];
  }
  const contact = page.template_styles?.contact ?? {};
  const phone = template02DialNumber(page.contact_phone || page.contact_phone_link || '', contact.phoneCountryCode);
  const whatsapp = template02DialNumber(page.contact_whatsapp || '', contact.whatsappCountryCode);
  const order = shown('button', page.cta_button_text || 'এখনই অর্ডার করুন') && <Button className="t2-order" onClick={onOrderClick}>{copy('button', page.cta_button_text || 'এখনই অর্ডার করুন')}<ArrowRight size={19} /></Button>;
  const call = phone && shown(section === 'contact' ? 'phoneAction' : 'call', 'কল করুন') && <Button asChild variant="outline" className="t2-call"><a href={`tel:${phone}`}><Phone size={18} />{copy(section === 'contact' ? 'phoneAction' : 'call', 'কল করুন')} <span>{renderSalesText(page.contact_phone || phone)}</span></a></Button>;
  const message = page.contact_whatsapp && <Button asChild variant="outline" className="t2-message"><a href={getWhatsAppUrl(whatsapp || page.contact_whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} />{copy('whatsappAction', page.contact_whatsapp_text || 'হোয়াটসঅ্যাপে মেসেজ করুন')}</a></Button>;
  const heading = (title: string, subtitle: string, titleKey = 'headline') => <header className="t2-heading">{shown(titleKey, title) && <h2>{copy(titleKey, title)}</h2>}{shown('subtitle', subtitle) && <p>{copy('subtitle', subtitle)}</p>}</header>;
  const images = (section === 'hero' ? page.hero_images?.length ? page.hero_images : [page.products?.image_url].filter((s): s is string => Boolean(s)) : section === 'reviews' ? page.review_images : page.gallery_images) ?? [];
  const index = Math.min(active, Math.max(0, images.length - 1));
  const featureIcons = [ShieldCheck, Palette, Scissors, Check, Truck, Gift];
  const image = (src: string, i: number, eager = false) => <img src={src} alt={salesPlainText(`${page.title} ${i + 1}`)} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
  const navigator = <div className="t2-nav"><Button size="icon" variant="outline" aria-label="আগের ছবি" disabled={images.length < 2} onClick={() => setActive((index - 1 + images.length) % images.length)}><ChevronLeft size={18} /></Button><span>{index + 1} / {images.length}</span><Button size="icon" variant="outline" aria-label="পরের ছবি" disabled={images.length < 2} onClick={() => setActive((index + 1) % images.length)}><ChevronRight size={18} /></Button></div>;
  let content;
  if (section === 'hero' && variant === 1) return <Template02Hero01 page={page} onOrderClick={onOrderClick} />;
  if (section === 'hero') {
    const timerDeadline = getTemplate02Hero02TimerDeadline(settings);
    const timerPage = { ...page, countdown_end_date: timerDeadline ?? '', template_styles: { ...page.template_styles, hero: {
      text_timer_title: settings.text_t2h2_timer_title,
      text_timer_expired: settings.text_t2h2_timer_expired,
    } } };
    const timer = timerDeadline && <OfferCountdown page={timerPage} />;
    const topHeading = timerDeadline ? settings.text_t2h2_top_heading ?? '' : '';
    const presentation = <div className="t2-hero-copy">{shown('badge', page.hero_badge_text) && <span className="t2-badge"><Sparkles size={15} />{copy('badge', page.hero_badge_text)}</span>}{shown('headline', page.hero_headline || page.title) && <h1>{copy('headline', page.hero_headline || page.title)}</h1>}{shown('subtitle', page.hero_subheadline) && <p className="t2-description">{copy('subtitle', page.hero_subheadline)}</p>}</div>;
    const price = page.offer_price || page.products?.price || 0;
    const original = page.original_price || page.products?.original_price;
    const actions = <div className="t2-hero-actions"><div className="t2-price"><strong>{renderSalesText(page.price_unit || '৳')}{renderSalesText(price.toLocaleString())}</strong>{original && original > price ? <del>{renderSalesText(page.price_unit || '৳')}{renderSalesText(original.toLocaleString())}</del> : null}</div><div className="t2-actions">{order}{call}</div>{shown('urgency', page.cta_urgency_text) && <p className="t2-note">{copy('urgency', page.cta_urgency_text)}</p>}</div>;
    content = <div className="t2-hero-layout">{topHeading.trim() && <p className="t2h2-top-heading">{renderSalesText(topHeading)}</p>}{timer}{presentation}{images.length > 0 && <div className="t2-hero-media">{images.slice(0, variant === 3 ? 2 : variant === 5 ? 3 : 1).map((src, i) => <figure key={`${src}-${i}`}>{image(src, i, i === 0)}</figure>)}</div>}{actions}</div>;
  } else if (section === 'gallery') {
    if (!images.length) return null;
    content = <>{heading(page.gallery_title || 'আমাদের কালেকশন', page.gallery_subtitle, 'title')}{variant === 2 ? <div className="t2-gallery-studio"><figure className="t2-gallery-main">{image(images[index], index)}</figure><div className="t2-thumbnails">{images.map((src, i) => <Button key={i} variant="outline" aria-label={`ছবি ${i + 1}`} aria-pressed={index === i} className="t2-thumbnail" onClick={() => setActive(i)}>{image(src, i)}</Button>)}</div>{navigator}</div> : <div className="t2-gallery-grid">{images.map((src, i) => <figure key={i}>{image(src, i)}{variant === 4 && <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{page.gallery_product_prices?.[i] > 0 && <strong>{renderSalesText(page.price_unit || '৳')}{page.gallery_product_prices[i]}</strong>}</figcaption>}</figure>)}</div>}<div className="t2-gallery-cta">{order}</div></>;
  } else if (section === 'features') {
    const features = page.feature_points?.length ? page.feature_points : Array.from({ length: 6 }, (_, i) => { const n = i + 1; const data = page as unknown as Record<string, string>; return { text: data[`feature_${n}_text`], description: data[`feature_${n}_description`], icon: data[`feature_${n}_icon`] }; }).filter(f => f.text);
    if (!features.length) return null;
    const featureImages = page.feature_section_images?.length ? page.feature_section_images : page.feature_section_image ? [page.feature_section_image] : [];
    content = <>{heading(page.features_headline || 'আমাদের বিশেষত্ব', page.features_subheadline)}<div className="t2-features-layout">{variant === 4 && featureImages.length > 0 && <figure className="t2-feature-image">{image(featureImages[0], 0)}</figure>}<div className="t2-feature-list">{features.map((f, i) => { const Icon = featureIcons[i % featureIcons.length]; return <article key={i}><span className="t2-feature-icon">{variant === 1 || variant === 3 ? String(i + 1).padStart(2, '0') : <Icon size={21} />}</span><div><h3>{renderSalesText(f.text)}</h3>{f.description && <p>{renderSalesText(f.description)}</p>}</div></article>; })}</div></div></>;
  } else if (section === 'reviews') {
    if (!images.length && !page.review_video_url) return null;
    const video = page.review_video_url && <div className="t2-review-video"><ReviewVideo url={page.review_video_url} title={salesPlainText(page.reviews_headline)} /></div>;
    content = <>{heading(page.reviews_headline || 'কাস্টমার ফিডব্যাক', page.reviews_subheadline)}<div className="t2-reviews-layout">{video}{images.length > 0 && (variant === 2 ? <div className="t2-review-focus"><figure>{image(images[index], index)}</figure>{navigator}</div> : <div className="t2-review-grid">{images.map((src, i) => <figure key={i}>{image(src, i)}</figure>)}</div>)}</div></>;
  } else {
    content = <div className="t2-contact-layout"><div className="t2-contact-heading"><span className="t2-contact-icon"><Headphones size={30} /></span>{heading(page.contact_headline || 'যেকোনো প্রয়োজনে যোগাযোগ করুন', page.contact_subheadline)}</div><div className="t2-contact-actions">{variant === 2 ? <><div className="t2-channel"><Phone size={24} />{call}</div><div className="t2-channel"><MessageCircle size={24} />{message}</div></> : <>{call}{message}</>}</div></div>;
  }
  return <section className={`sales-t2 sales-t2--${section} sales-t2--${variant}`} data-t2-section={section} data-t2-design={settings.design} style={variables as CSSProperties}><div className="t2-inner">{content}</div></section>;
}