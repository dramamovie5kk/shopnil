import { salesPlainText, splitSalesText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { type CSSProperties, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { getHeroDesign, heroColorFields } from '@/lib/heroDesigns';
import Hero03ImageSlider from './Hero03ImageSlider';
import OfferCountdown from './OfferCountdown';
import Hero06Section from './Hero06Section';
import Hero08Section from './Hero08Section';
import Hero09Section from './Hero09Section';
import Hero10Section from './Hero10Section';

export default function SharedHeroSection({ page, onOrderClick }: { page: SalesPage; onOrderClick: () => void }) {
  const settings = page.template_styles?.hero;
  const design = getHeroDesign(settings?.design);
  const images = page.hero_images?.filter(Boolean) || [];
  const [active, setActive] = useState(0);
  const image = images[active % images.length] || page.products?.image_url;
  const title = settings?.text_headline ?? page.hero_headline ?? page.title;
  const subtitle = settings?.text_subtitle ?? page.hero_subheadline;
  const badge = settings?.text_badge ?? page.hero_badge_text;
  const button = settings?.text_button ?? page.cta_button_text ?? 'এখনই অর্ডার করুন';
  const urgency = settings?.text_urgency ?? page.cta_urgency_text;
  const price = page.offer_price > 0 ? `${page.price_unit || '৳'}${page.offer_price.toLocaleString('bn-BD')}` : '';
  const style = Object.fromEntries(heroColorFields.flatMap(field => /^#[0-9a-fA-F]{6}$/.test(settings?.[field.key] || '') ? [[`--hero-${field.key}`, settings?.[field.key]]] : [])) as CSSProperties;
  const titleText = title.replace(/<[^>]*>/g, ' ');
  const contact = page.template_styles?.contact;
  const callLabel = settings?.text_call ?? 'কল করুন';
  const callNumber = (settings?.call_number || page.contact_phone || '').trim();
  const callCode = contact?.phoneCountryCode?.replace(/\D/g, '') ?? '';
  const callDigits = callNumber.replace(/\D/g, '');
  const dialNumber = callCode && !callNumber.startsWith('+')
    ? `+${callDigits.startsWith(callCode) ? callDigits : callCode + callDigits.replace(/^0/, '')}`
    : callNumber.replace(/[^\d+]/g, '');
  const showPriceRow = design !== '01' && design !== '02' && design !== '03';
  const media = image ? <img src={image} alt={salesPlainText(titleText)} className="sales-hero-image" loading="eager" /> : <div className="sales-hero-placeholder" aria-hidden="true" />;
  const carousel = images.length > 1 && <div className="sales-hero-image-controls"><Button type="button" variant="ghost" size="icon" aria-label="আগের ছবি" onClick={() => setActive(n => (n - 1 + images.length) % images.length)}><ChevronLeft size={19} /></Button><span>{renderSalesText(active % images.length + 1)} / {renderSalesText(images.length)}</span><Button type="button" variant="ghost" size="icon" aria-label="পরের ছবি" onClick={() => setActive(n => n + 1)}><ChevronRight size={19} /></Button></div>;
  if (design === '03') {
    const sliderImages = images.length ? images : page.products?.image_url ? [page.products.image_url] : [];
    const topText = settings?.text_topbar ?? urgency;
    const headerButton = settings?.text_header_button ?? button;
    const savings = (page.original_price ?? 0) > page.offer_price ? (page.original_price ?? 0) - page.offer_price : 0;
    const offerTitle = settings?.text_offer_title ?? 'সুপার কোয়ালিটি অফার';
    const offerSubtitle = settings?.text_offer_subtitle ?? '';
    const logoText = settings?.text_logo ?? offerTitle.trim().charAt(0);
    const ticketOld = settings?.text_old_price ?? 'আলাদা কিনলে';
    const ticketSave = settings?.text_savings ?? 'সাশ্রয়';
    const ticketNote = settings?.text_ticket_note ?? '';
    const offerImage = (settings?.offer_image || '').trim();
    const stripItems = splitSalesText(settings?.text_marquee ?? urgency ?? '', /[\n|]/).map(item => item.trim()).filter(Boolean);
    return <section className="sales-hero sales-hero--03" style={style} aria-label="পণ্যের পরিচিতি">
      <header className="sales-hero03-header-wrap">
        {renderSalesText(topText && <div className="sales-hero03-topbar"><span className="sales-hero03-dot" aria-hidden="true"><i /></span>{renderSalesText(topText)}</div>)}
        <div className="sales-hero03-header">
          <div className="sales-hero03-brand">
            {renderSalesText(logoText && <span className="sales-hero03-logo" aria-hidden="true">{renderSalesText(logoText)}</span>)}
            <div className="sales-hero03-offer"><strong>{renderSalesText(offerTitle)}</strong>{renderSalesText(offerSubtitle && <small>{renderSalesText(offerSubtitle)}</small>)}</div>
          </div>
          <div className="sales-hero03-header-actions">
            {renderSalesText(callDigits && <a className="sales-hero03-header-call" href={`tel:${dialNumber}`}><Phone size={16} aria-hidden="true" />{renderSalesText(callNumber)}</a>)}
            <Button type="button" className="sales-hero03-headerbtn" onClick={onOrderClick}>{renderSalesText(headerButton)}</Button>
          </div>
        </div>
      </header>
      <div className="sales-hero03-wrap">
        <div className="sales-hero03-left">
          {renderSalesText(badge && <span className="sales-hero-badge">{renderSalesText(badge)}</span>)}
          <h1  >{renderSalesText(title)}</h1>
          {renderSalesText(offerImage && <img src={offerImage} alt="" aria-hidden="true" className="sales-hero03-offerimg" loading="eager" />)}
          {renderSalesText(subtitle && <p className="sales-hero03-lead">{renderSalesText(subtitle)}</p>)}
          {renderSalesText((price || page.original_price > 0) && <div className="sales-hero03-ticket">
            <div className="sales-hero03-tl">
              {renderSalesText((page.original_price ?? 0) > page.offer_price && <p className="sales-hero03-old">{renderSalesText(ticketOld)} {renderSalesText(page.price_unit || '৳')}{renderSalesText(page.original_price.toLocaleString('bn-BD'))}</p>)}
              {renderSalesText(price && <p className="sales-hero03-price">{renderSalesText(price)}</p>)}
            </div>
            <div className="sales-hero03-sep" aria-hidden="true" />
            <div className="sales-hero03-tr">
              {renderSalesText(savings > 0 && <p className="sales-hero03-save">{renderSalesText(page.price_unit || '৳')} {renderSalesText(savings.toLocaleString('bn-BD'))} {renderSalesText(ticketSave)}</p>)}
              {renderSalesText(ticketNote && <p className="sales-hero03-mut">{renderSalesText(ticketNote)}</p>)}
            </div>
          </div>)}
          <div className="sales-hero03-btns">
            <Button type="button" className="sales-hero-order" onClick={onOrderClick}>{renderSalesText(button)}<ArrowRight size={18} aria-hidden="true" /></Button>
            {renderSalesText(callDigits && <a href={`tel:${dialNumber}`} className="sales-hero-call" aria-label={salesPlainText(`${callLabel} ${callNumber}`)}><Phone size={18} aria-hidden="true" />{renderSalesText(callLabel)}<strong>{renderSalesText(callNumber)}</strong></a>)}
          </div>
        </div>
        <div className="sales-hero03-right">
          <Hero03ImageSlider images={sliderImages} title={salesPlainText(titleText)} />
        </div>
      </div>
      {renderSalesText(stripItems.length > 0 && <div className="sales-hero03-marq" aria-label={salesPlainText(stripItems.join(' · '))}><div className="sales-hero03-track" aria-hidden="true">{renderSalesText([0, 1].flatMap(copy => stripItems.map((item, index) => <span key={`${copy}-${index}`}><i />{renderSalesText(item)}</span>)))}</div></div>)}
    </section>;
  }
  if (design === '05') {
    const unit = page.price_unit || '৳';
    const pics = images.length ? images.slice(0, 2) : page.products?.image_url ? [page.products.image_url] : [];
    const topText = settings?.text_topbar ?? urgency;
    const logoText = settings?.text_logo ?? 'D';
    const headerTitle = settings?.text_header_title ?? 'সুপার কোয়ালিটি অফার';
    const headerSubtitle = settings?.text_header_subtitle ?? page.title;
    const headerButton = settings?.text_header_button ?? 'অর্ডার করুন';
    const accent = settings?.text_headline_accent ?? '';
    const imageLabel = settings?.text_image_label ?? 'স্পেশাল অফার';
    const oldLabel = settings?.text_old_price ?? 'নিয়মিত মূল্য';
    const priceLabel = settings?.text_price_label ?? 'অফার প্রাইস';
    const perks = splitSalesText(settings?.text_perks ?? '🚚 সারা বাংলাদেশে ডেলিভারি\n💵 ক্যাশ অন ডেলিভারি', '\n').map(s => s.trim()).filter(Boolean);
    const bottomButton = settings?.text_bottom_button ?? (price ? `${button} — মাত্র ${page.offer_price.toLocaleString('bn-BD')} টাকা` : button);
    return <section className="sales-hero sales-hero--05" style={style} aria-label="পণ্যের পরিচিতি">
      {renderSalesText(topText && <div className="sales-hero05-topbar"><span className="sales-hero05-dot" aria-hidden="true" />{renderSalesText(topText)}</div>)}
      <header className="sales-hero05-header">
        <div className="sales-hero05-brand">
          {renderSalesText(logoText && <span className="sales-hero05-logo">{renderSalesText(logoText)}</span>)}
          <div className="sales-hero05-brand-copy">{renderSalesText(headerTitle && <strong>{renderSalesText(headerTitle)}</strong>)}{renderSalesText(headerSubtitle && <small>{renderSalesText(headerSubtitle)}</small>)}</div>
        </div>
        <Button type="button" className="sales-hero05-headerbtn" onClick={onOrderClick}>{renderSalesText(headerButton)}</Button>
      </header>
      <div className="sales-hero05-body">
        {renderSalesText(badge && <span className="sales-hero05-badge">★ {renderSalesText(badge)}</span>)}
        <h1><span  >{renderSalesText(title)}</span>{renderSalesText(accent && <em>{renderSalesText(accent)}</em>)}</h1>
        {renderSalesText(pics.length > 0 && <div className="sales-hero05-card">{renderSalesText(imageLabel && <span className="sales-hero05-tag">{renderSalesText(imageLabel)}</span>)}<div className={`sales-hero05-pics sales-hero05-pics--${pics.length}`}>{renderSalesText(pics.map((src, i) => <img key={src + i} src={src} alt={salesPlainText(`${titleText} ${i + 1}`)} loading="eager" />))}</div></div>)}
        {renderSalesText(subtitle && <p className="sales-hero05-sub">{renderSalesText(subtitle)}</p>)}
        {renderSalesText(price && <div className="sales-hero05-prices">
          {renderSalesText((page.original_price ?? 0) > page.offer_price && <div className="sales-hero05-old"><small>{renderSalesText(oldLabel)}</small><del>{renderSalesText(unit)}{renderSalesText(page.original_price.toLocaleString('bn-BD'))}</del></div>)}
          <div className="sales-hero05-new"><small>{renderSalesText(priceLabel)}</small><strong>{renderSalesText(price)}</strong></div>
        </div>)}
        {renderSalesText(perks.length > 0 && <ul className="sales-hero05-perks">{renderSalesText(perks.map((p, i) => <li key={i}>{renderSalesText(p)}</li>))}</ul>)}
        <div className="sales-hero05-actions">
          <Button type="button" className="sales-hero05-cta" onClick={onOrderClick}><ShoppingCart size={18} aria-hidden="true" />{renderSalesText(bottomButton)}</Button>
          {renderSalesText(callDigits && <Button asChild variant="outline" className="sales-hero05-call"><a href={`tel:${dialNumber}`}><Phone size={18} aria-hidden="true" />{renderSalesText(callLabel)} {renderSalesText(callNumber)}</a></Button>)}
        </div>
      </div>
    </section>;
  }
  if (design === '06') return <Hero06Section page={page} style={style} onOrderClick={onOrderClick} dialNumber={dialNumber} callNumber={callNumber} />;
  if (design === '08') return <Hero08Section page={page} style={style} onOrderClick={onOrderClick} />;
  if (design === '09') return <Hero09Section page={page} style={style} onOrderClick={onOrderClick} dialNumber={dialNumber} callNumber={callNumber} />;
  if (design === '10') return <Hero10Section page={page} style={style} onOrderClick={onOrderClick} dialNumber={dialNumber} callNumber={callNumber} />;
  return <section className={`sales-hero sales-hero--${design}`} style={style} aria-label="পণ্যের পরিচিতি">

    {renderSalesText(design === '04' && settings?.timer_enabled !== '0' && <OfferCountdown page={page} />)}
    <div className="sales-hero-inner">
      {renderSalesText(design === '07' && <header className="sales-hero07-heading">
        {renderSalesText(badge && <span className="sales-hero-badge">{renderSalesText(badge)}</span>)}
        <h1  >{renderSalesText(title)}</h1>
      </header>)}
      <div className="sales-hero-media">{renderSalesText(design === '01' && image && <img src={image} alt="" aria-hidden="true" className="sales-hero01-backdrop" loading="eager" />)}{renderSalesText(media)}{renderSalesText(carousel)}</div>
      <div className="sales-hero-content">
        {renderSalesText(design !== '07' && <>{renderSalesText(badge && <span className="sales-hero-badge">{renderSalesText(badge)}</span>)}
        <h1  >{renderSalesText(title)}</h1></>)}
        {renderSalesText(subtitle && <p className="sales-hero-subtitle">{renderSalesText(subtitle)}</p>)}
        {renderSalesText(price && showPriceRow && <div className="sales-hero-price"><strong>{renderSalesText(price)}</strong>{renderSalesText(page.original_price && page.original_price > page.offer_price && <del>{renderSalesText(page.price_unit || '৳')}{renderSalesText(page.original_price.toLocaleString('bn-BD'))}</del>)}</div>)}
        <div className="sales-hero-actions">
          <Button type="button" className="sales-hero-order" onClick={onOrderClick}>{renderSalesText(button)}<ArrowRight size={18} aria-hidden="true" /></Button>
          {renderSalesText(callDigits && <a href={`tel:${dialNumber}`} className="sales-hero-call" aria-label={salesPlainText(`${callLabel} ${callNumber}`)}><Phone size={18} aria-hidden="true" />{renderSalesText(callLabel)}<strong>{renderSalesText(callNumber)}</strong></a>)}
        </div>
        {renderSalesText(urgency && <small className="sales-hero-urgency">{renderSalesText(urgency)}</small>)}
      </div>

    </div>
  </section>;
}
