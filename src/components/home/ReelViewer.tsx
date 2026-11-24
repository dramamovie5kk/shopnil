import { useRef, useState, type PointerEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { reelPlayback, type HomeReel } from '@/lib/homeReels';

export default function ReelViewer({ reel, multiple, navigate, close, english }: {
  reel: HomeReel;
  multiple: boolean;
  navigate: (step: -1 | 1) => void;
  close: () => void;
  english: boolean;
}) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unlockedReel, setUnlockedReel] = useState<string | null>(null);
  const productPath = reel.productSlug ? `/product/${encodeURIComponent(reel.productSlug)}` : null;
  const player = reelPlayback(reel.source, reel.url);
  if (!player) return null;

  const begin = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    swiped.current = false;
    start.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    // Keep the gesture on its starting surface when it moves over an iframe.
    if (multiple && event.target instanceof Element) event.target.setPointerCapture?.(event.pointerId);
  };
  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (start.current?.id !== event.pointerId) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    start.current = null;
    const distance = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    if (multiple && Math.abs(distance) >= 36) {
      swiped.current = true;
      setUnlockedReel(null);
      navigate(distance < 0 ? 1 : -1);
    }
  };
  const togglePlayback = () => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  };

  return (
    <DialogContent aria-describedby={undefined}
      className="block w-[min(calc(100%-1rem),calc(92dvh*9/16))] max-w-sm overflow-hidden rounded-2xl border-0 bg-black p-0 text-white [&>button]:z-30 [&>button]:rounded-full [&>button]:bg-black/55 [&>button]:p-2"
      onOpenAutoFocus={event => {
        if (event.target instanceof HTMLElement) {
          event.preventDefault();
          event.target.focus();
        }
      }}
      onKeyDown={event => {
        if (!multiple || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        setUnlockedReel(null);
        navigate(event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1);
      }}>
      <DialogTitle className="sr-only">{reel.title}</DialogTitle>
      <div data-reel-slide className="relative aspect-[9/16] touch-none select-none overflow-hidden"
        onPointerDown={begin} onPointerUp={end} onPointerCancel={() => { start.current = null; }}
        onClickCapture={event => {
          if (swiped.current && event.detail > 0) {
            swiped.current = false;
            event.preventDefault();
            event.stopPropagation();
          }
        }}>
        {player.kind === 'video' && <button
          type="button" aria-label={english ? 'Play or pause video' : 'ভিডিও চালান বা থামান'}
          onClick={togglePlayback} className="block h-full w-full focus-visible:outline focus-visible:-outline-offset-2">
          <video key={reel.id} ref={videoRef} src={player.url} autoPlay playsInline loop
            className="pointer-events-none h-full w-full object-contain" />
        </button>}
        {player.kind === 'embed' && <>
          <iframe key={reel.id} src={player.url} title={reel.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" />
          {multiple && unlockedReel !== reel.id && (
            <button type="button" aria-label={english ? 'Enable video controls' : 'ভিডিও নিয়ন্ত্রণ চালু করুন'}
              className="absolute inset-0 cursor-grab touch-none focus-visible:outline focus-visible:-outline-offset-2"
              onClick={event => {
                if (!swiped.current || event.detail === 0) setUnlockedReel(reel.id);
                swiped.current = false;
              }} />
          )}
          {multiple && unlockedReel === reel.id && <>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-8" />
            <span aria-hidden="true" className="absolute inset-y-0 right-0 w-8" />
          </>}
        </>}
        {player.kind === 'external' && (
          <div className="grid h-full place-items-center">
            <a href={player.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              {english ? 'Watch on Facebook' : 'ফেসবুকে ভিডিও দেখুন'}
            </a>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/65 to-transparent p-3 pt-7">
          <div className="pointer-events-auto grid grid-cols-2 gap-2">
            <Link to="/shop" onClick={close}
              className="flex min-h-10 items-center justify-center rounded-full bg-white px-2 text-center text-xs font-bold text-slate-900 transition-colors hover:bg-slate-100">
              Shop Now
            </Link>
            {productPath ? (
              <Link to={productPath} onClick={close}
                className="flex min-h-10 items-center justify-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 text-center text-xs font-bold text-white hover:bg-slate-700">
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" /> Order Now
              </Link>
            ) : (
              <button type="button" disabled title={english ? 'No product linked' : 'রিলের সঙ্গে পণ্য লিংক করা হয়নি'}
                className="flex min-h-10 items-center justify-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 text-center text-xs font-bold text-slate-300">
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" /> Order Now
              </button>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
