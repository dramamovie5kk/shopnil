import { useEffect, useRef } from "react";
import { usePixelTracking } from "@/hooks/usePixelTracking";

interface Props {
  page: any;
}

/**
 * Sales-page funnel events, fired once per page visit (browser Pixel + Conversions API):
 * Scroll50 → InitiateCheckout (checkout visible) → Scroll90 → TimeOnPage25s / TimeOnPage50s.
 * PageView is fired by FBPixelLoader; Purchase by the checkout on order success.
 */
const SalesPageEngagementTracker = ({ page }: Props) => {
  const { trackEngagement, trackInitiateCheckout } = usePixelTracking();
  const pageRef = useRef(page);
  pageRef.current = page;

  const title = page?.title || "Sales Page";
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  // Scroll depth 50% / 90%
  useEffect(() => {
    if (isAdmin) return;
    const fired = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      [50, 90].forEach((mark) => {
        if (pct >= mark && !fired.has(mark)) {
          fired.add(mark);
          trackEngagement(`Scroll${mark}`, title, { percent_scrolled: mark });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [title, isAdmin, trackEngagement]);

  // Time on page 25s / 50s (only counts while the tab is visible)
  useEffect(() => {
    if (isAdmin) return;
    let seconds = 0;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 1;
      if (seconds === 25 || seconds === 50) {
        trackEngagement(`TimeOnPage${seconds}s`, title, { time_on_page: seconds });
      }
      if (seconds >= 50) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [title, isAdmin, trackEngagement]);

  // InitiateCheckout when the checkout section comes into view
  useEffect(() => {
    if (isAdmin) return;
    let observer: IntersectionObserver | null = null;
    let tries = 0;
    let done = false;
    const attach = () => {
      const el = document.getElementById("checkout");
      if (!el) {
        if (tries++ < 20) window.setTimeout(attach, 500);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (done || !entries.some((e) => e.isIntersecting)) return;
          done = true;
          const p = pageRef.current;
          const product = p?.products;
          trackInitiateCheckout(
            [{
              product_id: product?.id,
              product_name: product?.name_bn || product?.name || p?.title,
              price: Number(product?.price || p?.offer_price || 0),
              original_price: product?.original_price || null,
              quantity: 1,
            } as any],
            p?.title || "Sales Page",
          );
          observer?.disconnect();
        },
        { threshold: 0.2 },
      );
      observer.observe(el);
    };
    attach();
    return () => observer?.disconnect();
  }, [title, isAdmin, trackInitiateCheckout]);

  return null;
};

export default SalesPageEngagementTracker;
