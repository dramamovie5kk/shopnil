import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalesPage } from "@/types/salesPage";
import { getReviewVariables } from "@/lib/reviewStyles";
import ReviewVideo, { getReviewVideoSource } from "./ReviewVideo";

const SharedReviewsSection = ({ page, legacyColors }: { page: SalesPage; legacyColors?: Record<string, string> }) => {
  const images = page.review_images || [];
  const review = page.template_styles?.reviews;
  const video = page.review_video_url?.trim();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setPageCount(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)));
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, images.length, video]);
  if (!images.length && !video) return null;
  const videoSource = video ? getReviewVideoSource(video) : null;
  const copy = (key: string) => review?.[`text_${key}`]?.trim() ?? "";
  const goTo = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(p, pageCount - 1));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActivePage(next);
  };
  return <section className="sales-reviews" style={getReviewVariables(review, page.template_id, legacyColors) as CSSProperties}>
    <div className="sales-reviews-inner">
      <header className="sales-reviews-heading">
        <h2>{renderSalesText(page.reviews_headline || "কাস্টমার ফিডব্যাক")}</h2>
        {renderSalesText(page.reviews_subheadline && <p>{renderSalesText(page.reviews_subheadline)}</p>)}
        {renderSalesText(copy("rating") && <div className="sales-reviews-rating">
          <span aria-hidden="true" className="sales-reviews-stars">{renderSalesText(Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" />))}</span>
          <span>{renderSalesText(copy("rating"))}</span>
        </div>)}
      </header>
      {renderSalesText(videoSource && video && <div className="sales-reviews-media">
        {renderSalesText(copy("videoTitle") && <h3>{renderSalesText(copy("videoTitle"))}</h3>)}
        <ReviewVideo url={video} title={salesPlainText(copy("videoTitle") || "কাস্টমার রিভিউ ভিডিও")} />
      </div>)}
      {renderSalesText(images.length > 0 && <div className="sales-reviews-gallery">
        <div
          ref={trackRef}
          className="sales-reviews-track"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (!el.clientWidth) return;
            measure();
            setActivePage(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {renderSalesText(images.map((src, i) => <img key={i} src={src} alt={salesPlainText(`${copy("imageAlt") || "কাস্টমার রিভিউ"} ${i + 1}`)} loading="lazy" />))}
        </div>
        {renderSalesText(pageCount > 1 && <>
          <Button type="button" size="icon" variant="ghost" className="sales-reviews-prev" title={salesPlainText(copy("previous") || "আগের রিভিউ")} aria-label={salesPlainText(copy("previous") || "আগের রিভিউ")} onClick={() => goTo(activePage - 1)}><ChevronLeft /></Button>
          <Button type="button" size="icon" variant="ghost" className="sales-reviews-next" title={salesPlainText(copy("next") || "পরের রিভিউ")} aria-label={salesPlainText(copy("next") || "পরের রিভিউ")} onClick={() => goTo(activePage + 1)}><ChevronRight /></Button>
          <div className="sales-reviews-dots" aria-label={salesPlainText(copy("pageLabel") || "রিভিউ পৃষ্ঠা")}>
            {renderSalesText(Array.from({ length: pageCount }, (_, i) => <Button type="button" variant="ghost" size="icon" key={i} aria-label={salesPlainText(`${copy("pageLabel") || "রিভিউ পৃষ্ঠা"} ${i + 1}`)} aria-current={activePage === i ? "true" : undefined} className="sales-reviews-dot-button" onClick={() => goTo(i)}><span className="sales-reviews-dot" /></Button>))}
          </div>
        </>)}
      </div>)}
    </div>
  </section>;
};
export default SharedReviewsSection;
