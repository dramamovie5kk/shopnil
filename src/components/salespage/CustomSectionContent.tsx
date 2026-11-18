import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Star, Phone, ShoppingCart, ExternalLink, MessageCircle } from 'lucide-react';
import type { CustomSection } from '@/components/admin/CustomSectionEditor';
import { Button } from '@/components/ui/button';
import { renderSalesText, SalesRichText } from './SalesRichText';
import { customButtonTarget, customDesktopLayoutStyle, customElementStyle, resolveCustomButtons } from '@/lib/customSectionElements';
import { applyCustomSectionAppearance } from '@/lib/customSectionAppearance';

// ─── Custom Section Renderer ────────────────────────────────────
export const Universal15CustomSection = ({ section, s, onOrderClick }: {
  section: CustomSection; s: Record<string, Record<string, string>>; onOrderClick: () => void;
}) => {
  const cs = section.styles;
  const [sliderIndex, setSliderIndex] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    if (section.type !== 'slider' || section.images.length <= 1) return;
    const interval = setInterval(() => {
      setSliderIndex(prev => (prev + 1) % section.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [section.type, section.images.length]);

  // HTML owns its entire presentation; ignore legacy widget styles and extras.
  if (section.type === 'html') return <SalesRichText text={section.content} layout />;

  const headingStyle: React.CSSProperties = {
    color: cs.headingColor,
    fontSize: `${cs.headingFontSize || '22'}px`,
    textAlign: (cs.headingAlignment as any) || 'center',
    fontWeight: cs.headingBold !== false ? 'bold' : 'normal',
  };

  const renderHeading = () => {
    if (!section.title) return null;
    return <h2 className="mb-4" style={headingStyle}>{renderSalesText(section.title)}</h2>;
  };

  const renderCta = () => {
    const buttons = resolveCustomButtons(section).filter(b => b.styles?.enabled !== false && b.text.trim());
    if (!buttons.length) return null;
    return <div className="grid gap-2 mt-4">
      {buttons.map(button => {
        const target = customButtonTarget(button);
        const Icon = button.action === 'call' ? Phone : button.action === 'order' ? ShoppingCart : button.action === 'whatsapp' ? MessageCircle : ExternalLink;
        const style = { backgroundColor: cs.ctaBgColor, color: cs.ctaTextColor, borderRadius: `${cs.ctaBorderRadius || '50'}px`, ...customElementStyle(button.styles), ...customDesktopLayoutStyle(button.styles) };
        const content = <><Icon className="w-4 h-4 shrink-0" /><span className="min-w-0">{renderSalesText(button.text)}</span></>;
        return button.action === 'order'
          ? <Button key={button.id} type="button" onClick={onOrderClick} className="custom-section-button" style={style}>{content}</Button>
          : <Button key={button.id} asChild className="custom-section-button" style={style}><a href={target} aria-disabled={!target} onClick={e => { if (!target) e.preventDefault(); }} target={(button.action === 'link' || button.action === 'whatsapp') && target?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a></Button>;
      })}
    </div>;
  };

  const contentFontSize = `${cs.contentFontSize || '15'}px`;
  const contentAlign = (cs.contentAlignment as any) || 'left';
  const imgBorderRadius = `${cs.imageBorderRadius || '8'}px`;

  const renderContent = () => {
    if (!section.content) return null;
    return <div data-custom-element="content" className="leading-relaxed mt-2" style={{ color: cs.textColor, fontSize: contentFontSize, textAlign: contentAlign }}>{renderSalesText(section.content)}</div>;
  };

  const renderPoints = () => {
    if (!section.points.length) return null;
    return (
      <div className="space-y-2 mt-3">
        {renderSalesText(section.points.filter(p => p.trim()).map((point, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: s.extra?.checkBgColor || '#4ade80' }}>
              <Check className="w-3 h-3" style={{ color: s.extra?.checkIconColor || '#065f46' }} />
            </div>
            <p style={{ color: cs.textColor, fontSize: contentFontSize }}>{renderSalesText(point)}</p>
          </div>
        )))}
      </div>
    );
  };

  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 12px rgba(0,0,0,0.15)',
    lg: '0 10px 30px rgba(0,0,0,0.2)',
  };

  const bgOpacity = Math.min(100, Math.max(0, parseInt(cs.backgroundOpacity || '100', 10) || 0));
  const sectionBgColor = bgOpacity >= 100
    ? cs.backgroundColor
    : `color-mix(in srgb, ${cs.backgroundColor} ${bgOpacity}%, transparent)`;
  const sideMargin = Math.max(0, parseInt(cs.marginX || '0', 10) || 0);

  // Shared optional foreground media and description; native image layouts stay intact.
  const renderSectionExtras = () => (
    <>
      {!['image-text', 'image-grid', 'banner', 'gallery', 'slider', 'image'].includes(section.type) && section.images.length > 0 && (
        <div data-custom-element="image" className="space-y-3 mb-3">
          {section.images.map((image, index) => (
            <img key={index} src={image} alt="" loading="lazy" className="w-full h-auto"
              style={{ borderRadius: imgBorderRadius }} />
          ))}
        </div>
      )}
      {section.description && <div data-custom-element="description" className="leading-relaxed whitespace-pre-line mt-2 mb-3"
        style={{ color: cs.textColor, fontSize: contentFontSize, textAlign: contentAlign }}>
        {renderSalesText(section.description)}
      </div>}
      {['testimonial', 'pricing', 'feature-icons', 'comparison', 'faq'].includes(section.type) && renderContent()}
    </>
  );

  const renderSectionVideo = () => {
    const ytMatch = section.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : section.videoUrl;
    return <>
      {section.type !== 'video' && embedUrl && (
        <div data-custom-element="video" className="relative w-full mb-3" style={{ aspectRatio: '16 / 9' }}>
          <iframe loading="lazy" title="Section video" src={embedUrl} className="absolute inset-0 w-full h-full"
            style={{ borderRadius: imgBorderRadius }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      )}
      {renderSectionExtras()}
    </>;
  };

  const wrapSection = (children: React.ReactNode) => (
    <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="overflow-hidden"
      style={{
        backgroundColor: sectionBgColor,
        backgroundImage: cs.backgroundImage ? `url(${cs.backgroundImage})` : undefined,
        backgroundSize: cs.backgroundImage ? 'cover' : undefined,
        backgroundPosition: cs.backgroundImage ? 'center' : undefined,
        borderRadius: (['radiusTL','radiusTR','radiusBR','radiusBL'] as const).map(k => `${(cs as any)[k] !== undefined && (cs as any)[k] !== '' ? (cs as any)[k] : (cs.borderRadius || '0')}px`).join(' '),
        marginTop: cs.marginTop ? `${cs.marginTop}px` : undefined,
        marginBottom: cs.marginBottom ? `${cs.marginBottom}px` : undefined,
        fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
        padding: `${cs.padding || '24'}px`,
        border: cs.borderWidth && cs.borderWidth !== '0' ? `${cs.borderWidth}px solid ${cs.borderColor || 'transparent'}` : undefined,
        boxShadow: shadowMap[cs.shadow || 'none'] || 'none',
        width: sideMargin > 0 ? `calc(${Math.min(100, Math.max(30, parseInt(cs.sectionWidth || '100', 10) || 100))}% - ${sideMargin * 2}px)` : `${Math.min(100, Math.max(30, parseInt(cs.sectionWidth || '100', 10) || 100))}%`,
        boxSizing: 'border-box',
        marginLeft: sideMargin > 0 ? `${sideMargin}px` : 'auto',
        marginRight: sideMargin > 0 ? `${sideMargin}px` : 'auto',
      }}>
      {applyCustomSectionAppearance(children, section.elementStyles)}
    </motion.section>
  );

  // ── Divider ──
  if (section.type === 'divider') {
    return (
      wrapSection(<>
        {renderHeading()}
        {renderSectionVideo()}
        {renderContent()}
        <hr style={{ borderColor: cs.headingColor }} />
        {renderCta()}
      </>)
    );
  }

  // ── Video ──
  if (section.type === 'video') {
    const videoUrl = section.videoUrl || '';
    const getEmbedUrl = (url: string) => {
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      return url;
    };
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(videoUrl && (
          <div data-custom-element="video" className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <iframe loading="lazy" title="Section video" src={getEmbedUrl(videoUrl)} className="absolute inset-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        ))}
        {renderSectionExtras()}
        {renderSalesText(renderContent())}
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Gallery (grid with lightbox feel) ──
  if (section.type === 'gallery') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        {renderSalesText(section.images.length > 0 && (
          <div data-custom-element="image" className="grid grid-cols-2 gap-2">
            {renderSalesText(section.images.map((img, i) => (
              <motion.img key={i} src={img} alt=""
                className="w-full object-cover aspect-square"
                style={{ borderRadius: imgBorderRadius }}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} />
            )))}
          </div>
        ))}
        {renderSalesText(renderContent())}
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Slider ──
  if (section.type === 'slider') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        {renderSalesText(section.images.length > 0 && (
          <div data-custom-element="image" className="relative overflow-hidden" style={{ borderRadius: imgBorderRadius }}>
            <div className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${sliderIndex * 100}%)` }}>
              {renderSalesText(section.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full flex-shrink-0 object-cover" />
              )))}
            </div>
            {renderSalesText(section.images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {renderSalesText(section.images.map((_, i) => (
                  <button key={i} type="button" onClick={() => setSliderIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === sliderIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                )))}
              </div>
            ))}
          </div>
        ))}
        {renderSalesText(renderContent())}
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Single Image ──
  if (section.type === 'image') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        {renderSalesText(section.images[0] && (
          <img src={section.images[0]} alt="" className="w-full object-cover" style={{ borderRadius: imgBorderRadius }} />
        ))}
        {renderSalesText(renderContent())}
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Testimonial ──
  if (section.type === 'testimonial') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className="space-y-3 mt-3">
          {renderSalesText((section.testimonials || []).filter(t => t.name.trim()).map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl" style={{ backgroundColor: `${cs.textColor}10` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: cs.ctaBgColor, color: cs.ctaTextColor }}>
                  {renderSalesText(t.name.charAt(0))}
                </div>
                <div>
                  <p data-custom-element="itemHeading" className="font-semibold text-sm" style={{ color: cs.headingColor }}>{renderSalesText(t.name)}</p>
                  <div className="flex gap-0.5">
                    {renderSalesText(Array.from({ length: t.rating || 5 }).map((_, si) => (
                      <Star key={si} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    )))}
                  </div>
                </div>
              </div>
              <p style={{ color: cs.textColor, fontSize: contentFontSize }} className="leading-relaxed">"{renderSalesText(t.text)}"</p>
            </motion.div>
          )))}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Pricing ──
  if (section.type === 'pricing') {
    const pd = section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] };
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className="text-center mt-3">
          {renderSalesText(pd.badgeText && (
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-3"
              style={{ backgroundColor: cs.ctaBgColor, color: cs.ctaTextColor }}>
              {renderSalesText(pd.badgeText)}
            </span>
          ))}
          <div className="flex items-center justify-center gap-3 mb-4">
            {renderSalesText(pd.originalPrice && (
              <span className="text-xl line-through opacity-50" style={{ color: cs.textColor }}>
                {renderSalesText(pd.unit)}{renderSalesText(pd.originalPrice)}
              </span>
            ))}
            <span className="text-4xl font-bold" style={{ color: cs.headingColor }}>
              {renderSalesText(pd.unit)}{renderSalesText(pd.offerPrice)}
            </span>
          </div>
          {renderSalesText(pd.features.length > 0 && (
            <div className="space-y-2 text-left">
              {renderSalesText(pd.features.filter(f => f.trim()).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: s.extra?.checkBgColor || '#4ade80' }}>
                    <Check className="w-3 h-3" style={{ color: s.extra?.checkIconColor || '#065f46' }} />
                  </div>
                  <p style={{ color: cs.textColor, fontSize: contentFontSize }}>{renderSalesText(f)}</p>
                </div>
              )))}
            </div>
          ))}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Countdown Timer ──
  if (section.type === 'countdown-timer') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <CustomCountdown endDate={section.countdownEndDate || ""} cs={cs} elementStyles={section.elementStyles} />
        {renderSalesText(renderContent())}
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Feature Icons Grid ──
  if (section.type === 'feature-icons') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {renderSalesText((section.featureItems || []).filter(f => f.title.trim()).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center p-4 rounded-xl" style={{ backgroundColor: `${cs.textColor}10` }}>
              <div className="text-3xl mb-2">{renderSalesText(item.icon || '✅')}</div>
              <h4 className="font-bold text-sm mb-1" style={{ color: cs.headingColor }}>{renderSalesText(item.title)}</h4>
              {renderSalesText(item.description && (
                <p className="text-xs opacity-80" style={{ color: cs.textColor }}>{renderSalesText(item.description)}</p>
              ))}
            </motion.div>
          )))}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── CTA Banner ──
  if (section.type === 'cta-banner') {
    return wrapSection(
      <div className="text-center">
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        {renderContent()}
        {renderCta()}
      </div>
    );
  }

  // ── Comparison ──
  if (section.type === 'comparison') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className="mt-3 overflow-hidden rounded-xl" style={{ border: `1px solid ${cs.textColor}20` }}>
          <div className="grid grid-cols-3 text-center font-bold text-xs p-2" style={{ backgroundColor: `${cs.textColor}15`, color: cs.headingColor }}>
            <span></span>
            <span>❌ ছাড়া</span>
            <span>✅ সাথে</span>
          </div>
          {renderSalesText((section.comparisonItems || []).filter(c => c.label.trim()).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="grid grid-cols-3 text-center p-2 text-xs" style={{ borderTop: `1px solid ${cs.textColor}10`, color: cs.textColor, fontSize: contentFontSize }}>
              <span className="font-medium text-left" style={{ color: cs.headingColor }}>{renderSalesText(item.label)}</span>
              <span className="opacity-60">{renderSalesText(item.before)}</span>
              <span className="font-semibold">{renderSalesText(item.after)}</span>
            </motion.div>
          )))}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── FAQ ──
  if (section.type === 'faq') {
    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className="space-y-2">
          {renderSalesText((section.faqItems || []).filter(f => f.question.trim()).map((faq, i) => (
            <details key={i} className="rounded-lg overflow-hidden group" style={{ backgroundColor: `${cs.textColor}15` }}>
              <summary className="px-3 py-2 cursor-pointer font-medium flex items-center justify-between" style={{ color: cs.headingColor, fontSize: contentFontSize }}>
                <span>{renderSalesText(faq.question)}</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: cs.headingColor }} />
              </summary>
              <div className="px-3 pb-2" style={{ color: cs.textColor, fontSize: contentFontSize }}>
                {renderSalesText(faq.answer)}
              </div>
            </details>
          )))}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Image-Text with position ──
  if (section.type === 'image-text') {
    const isHorizontal = cs.imagePosition === 'left' || cs.imagePosition === 'right';
    const imageFirst = cs.imagePosition === 'top' || cs.imagePosition === 'left';
    const imageBlock = section.images[0] ? <img src={section.images[0]} alt="" className="w-full object-cover" style={{ borderRadius: imgBorderRadius }} /> : null;
    const textBlock = <div>{renderSalesText(renderContent())}{renderSalesText(renderPoints())}</div>;

    return wrapSection(
      <>
        {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
        <div className={isHorizontal ? "flex gap-4 items-start" : "space-y-3"}
          style={isHorizontal ? { flexDirection: imageFirst ? 'row' : 'row-reverse' } : undefined}>
          {renderSalesText(imageFirst ? <>{renderSalesText(imageBlock)}{renderSalesText(textBlock)}</> : <>{renderSalesText(textBlock)}{renderSalesText(imageBlock)}</>)}
        </div>
        {renderSalesText(renderCta())}
      </>
    );
  }

  // ── Default: text, bullet-points, image-grid, banner ──
  return wrapSection(
    <>
      {renderSalesText(renderHeading())}
        {renderSalesText(renderSectionVideo())}
      {renderSalesText(section.type === 'banner' && section.images[0] && (
        <img src={section.images[0]} alt="" className="w-full object-cover" style={{ borderRadius: imgBorderRadius }} />
      ))}
      {renderSalesText(renderContent())}
      {renderSalesText(section.type === 'image-grid' && section.images.length > 0 && (
        <div data-custom-element="image" className="grid grid-cols-2 gap-2">
          {renderSalesText(section.images.map((img, i) => (
            <motion.img key={i} src={img} alt="" className="w-full object-cover"
              style={{ borderRadius: imgBorderRadius }}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} />
          )))}
        </div>
      ))}
      {renderSalesText(renderPoints())}
      {renderSalesText(renderCta())}
    </>
  );
};

// ─── Custom Countdown ───────────────────────────────────────────
const CustomCountdown = ({ endDate, cs, elementStyles }: { endDate: string; cs: CustomSection["styles"]; elementStyles?: CustomSection['elementStyles'] }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate) return;
    const target = new Date(endDate).getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!endDate) return null;

  const items = [
    { value: timeLeft.days, label: 'দিন' },
    { value: timeLeft.hours, label: 'ঘণ্টা' },
    { value: timeLeft.minutes, label: 'মিনিট' },
    { value: timeLeft.seconds, label: 'সেকেন্ড' },
  ];

  return (
    <div className="flex justify-center gap-3 mt-3">
      {renderSalesText(items.map((item, i) => (
        <div key={i} className="text-center">
          <div data-custom-element="timer" className="text-2xl font-bold px-3 py-2 rounded-xl min-w-[50px]"
            style={{ backgroundColor: `${cs.textColor}15`, color: cs.headingColor, ...customElementStyle(elementStyles?.timer) }}>
            {renderSalesText(String(item.value).padStart(2, '0'))}
          </div>
          <p data-custom-element="timerLabel" className="text-[10px] mt-1 font-medium" style={{ color: cs.textColor, opacity: 0.7, ...customElementStyle(elementStyles?.timerLabel) }}>{renderSalesText(item.label)}</p>
        </div>
      )))}
    </div>
  );
};

