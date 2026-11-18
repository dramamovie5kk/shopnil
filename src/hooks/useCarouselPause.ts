import { useEffect, useRef } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';

/** Keep autoplay paused until every active hover/press has ended, including releases outside the banner. */
export function useCarouselPause(api: EmblaCarouselType | undefined, enabled = true) {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const autoplay = api?.plugins().autoplay;
    if (!root || !api) return;
    let hovered = false;
    const pressed = new Set<number>();
    const sync = () => {
      if (!autoplay || !enabled) return;
      if (hovered || pressed.size) autoplay.stop();
      else if (!autoplay.isPlaying()) autoplay.play();
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') { hovered = true; root.setAttribute('data-banner-hovered', ''); sync(); } };
    const leave = (event: PointerEvent) => { if (event.pointerType === 'mouse') { hovered = false; root.removeAttribute('data-banner-hovered'); sync(); } };
    const down = (event: PointerEvent) => { pressed.add(event.pointerId); sync(); };
    const up = (event: PointerEvent) => { if (pressed.delete(event.pointerId)) sync(); };
    const enforce = () => { if (autoplay && (hovered || pressed.size)) autoplay.stop(); };
    const blur = () => { hovered = false; root.removeAttribute('data-banner-hovered'); pressed.clear(); sync(); };
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('blur', blur);
    api.on('reInit', sync).on('autoplay:play', enforce);
    return () => {
      root.removeAttribute('data-banner-hovered');
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('blur', blur);
      api.off('reInit', sync).off('autoplay:play', enforce);
    };
  }, [api, enabled]);
  return rootRef;
}
