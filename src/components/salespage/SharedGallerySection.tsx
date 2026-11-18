import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type TouchEvent } from "react";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalesPage } from "@/types/salesPage";
import { getGalleryDesign, getGalleryVariables } from "@/lib/galleryDesigns";

const copy = (settings: Record<string, string> | undefined, key: string, fallback: string) => settings?.[`text_${key}`] ?? fallback;

export default function SharedGallerySection({ page, onOrderClick }: { page: SalesPage; onOrderClick: () => void }) {
  const images = page.gallery_images || [];
  const settings = page.template_styles?.gallery;
  const design = getGalleryDesign(settings?.design);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const slideStart = useRef<{ x: number; y: number } | null>(null);
  const suppressOpen = useRef(false);
  useEffect(() => { setCurrent(0); setOpen(null); }, [design, images.length]);
  if (!images.length) return null;
  const active = Math.min(current, images.length - 1);
  const change = (step: number) => setCurrent(index => (index + step + images.length) % images.length);
  const onEditorialTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || images.length < 2) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressOpen.current = true;
      change(dx < 0 ? 1 : -1);
    }
  };
  const onSlidePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = slideStart.current;
    slideStart.current = null;
    if (!start || images.length < 2) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressOpen.current = true;
      change(dx < 0 ? 1 : -1);
    }
  };
  const heading = copy(settings, "heading", page.gallery_title || "আমাদের কালেকশন");
  const subtitle = copy(settings, "subtitle", page.gallery_subtitle || "যেমন দেখছেন, তেমনই পাবেন");
  const imageAlt = (index: number) => `${copy(settings, "imageAlt", "কালেকশনের ছবি")} ${index + 1}`;
  const caption = (index: number) => `${copy(settings, "caption", "কালেকশন")} ${String(index + 1).padStart(2, "0")}`;
  const orderLabel = copy(settings, "order", page.cta_button_text || "অর্ডার করুন");
  const order = <Button type="button" className="sales-gallery-order" onClick={onOrderClick}><ShoppingBag size={16} aria-hidden="true" />{renderSalesText(orderLabel)}</Button>;
  const image = (index: number, className = "") => <Button key={index} type="button" variant="ghost" className={`sales-gallery-photo ${className}`} onClick={() => { if (suppressOpen.current) { suppressOpen.current = false; return; } setOpen(index); }} aria-label={salesPlainText(`${imageAlt(index)} বড় করে দেখুন`)}><img src={images[index]} alt={salesPlainText(imageAlt(index))} loading="lazy" draggable={false} /></Button>;
  return <section className={`sales-gallery sales-gallery--${design}`} style={getGalleryVariables(settings, design) as CSSProperties}>
    <div className="sales-gallery-inner">
      <header className="sales-gallery-header"><h2>{renderSalesText(heading)}</h2><p>{renderSalesText(subtitle)}</p></header>
       {renderSalesText((design === "02" || design === "04") && <div className="sales-gallery-grid">{renderSalesText(images.map((_, index) => <article className="sales-gallery-card" key={index}>{renderSalesText(image(index))}<div className="sales-gallery-card-bottom"><span>{renderSalesText(caption(index))}</span>{renderSalesText(design === "04" && <Button type="button" className="sales-gallery-order" onClick={onOrderClick}><ShoppingBag size={15} />{renderSalesText(orderLabel)}</Button>)}</div></article>))}</div>)}
       {renderSalesText((design === "01" || design === "03") && <div className="sales-gallery-focus"><div className="sales-gallery-focus-image" onPointerDown={event => { slideStart.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={onSlidePointerEnd} onPointerCancel={() => { slideStart.current = null; }}>{renderSalesText(image(active))}</div>{renderSalesText(design === "03" && <div className="sales-gallery-focus-footer"><span>{renderSalesText(caption(active))}</span></div>)}<div className="sales-gallery-thumbs">{renderSalesText(images.map((src, index) => <Button key={index} type="button" variant="ghost" className="sales-gallery-thumb" aria-label={salesPlainText(`${imageAlt(index)} নির্বাচন করুন`)} aria-current={active === index ? "true" : undefined} onClick={() => setCurrent(index)}><img src={src} alt="" loading="lazy" /></Button>))}</div></div>)}
      {renderSalesText(design === "05" && <div className="sales-gallery-editorial"><div className="sales-gallery-editorial-frame" onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={onEditorialTouchEnd}>{renderSalesText(image(active, "sales-gallery-editorial-main"))}<p className="sales-gallery-editorial-caption">{renderSalesText(caption(active))}</p></div><div className="sales-gallery-editorial-strip">{renderSalesText(images.map((src, index) => <Button key={index} type="button" variant="ghost" className="sales-gallery-thumb" aria-label={salesPlainText(`${imageAlt(index)} নির্বাচন করুন`)} aria-current={active === index ? "true" : undefined} onClick={() => setCurrent(index)}><img src={src} alt="" loading="lazy" /></Button>))}</div></div>)}
      {renderSalesText(design === "06" && <div className="sales-gallery-film">{renderSalesText(images.map((_, index) => <article className="sales-gallery-card" key={index}>{renderSalesText(image(index))}<span>{renderSalesText(caption(index))}</span></article>))}</div>)}
      {renderSalesText(design !== "04" && <div className="sales-gallery-action">{renderSalesText(order)}</div>)}
    </div>
    {renderSalesText(open !== null && <div className="sales-gallery-lightbox" role="dialog" aria-modal="true" aria-label={salesPlainText(imageAlt(open))} onClick={() => setOpen(null)}><Button type="button" variant="outline" size="icon" className="sales-gallery-close" onClick={() => setOpen(null)} aria-label={salesPlainText(copy(settings, "close", "ছবি বন্ধ করুন"))}><X size={20} /></Button><img src={images[open]} alt={salesPlainText(imageAlt(open))} onClick={event => event.stopPropagation()} /></div>)}
  </section>;
}
