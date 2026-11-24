import { useRef, type PointerEvent } from 'react';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { reelPlayback, type HomeReel } from '@/lib/homeReels';

export default function ReelViewer({ reel, multiple, navigate, english }: {
  reel: HomeReel;
  multiple: boolean;
  navigate: (step: -1 | 1) => void;
  english: boolean;
}) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    if (multiple && Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true;
      navigate(dx < 0 ? 1 : -1);
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
        if (!multiple || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        navigate(event.key === 'ArrowLeft' ? -1 : 1);
      }}>
      <DialogTitle className="sr-only">{reel.title}</DialogTitle>
      <div data-reel-slide className="relative aspect-[9/16] touch-pan-y select-none overflow-hidden"
        onPointerDown={begin} onPointerUp={end} onPointerCancel={() => { start.current = null; }}>
        {player.kind === 'video' && <button
          type="button" aria-label={english ? 'Play or pause video' : 'ভিডিও চালান বা থামান'}
          onClick={togglePlayback} className="block h-full w-full focus-visible:outline focus-visible:-outline-offset-2">
          <video key={reel.id} ref={videoRef} src={player.url} autoPlay playsInline loop
            className="pointer-events-none h-full w-full object-contain" />
        </button>}
        {player.kind === 'embed' && <>
          <iframe key={reel.id} src={player.url} title={reel.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" />
          {multiple && <>
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-6" />
            <span aria-hidden="true" className="absolute inset-y-0 right-0 w-6" />
          </>}
        </>}
        {player.kind === 'external' && (
          <div className="grid h-full place-items-center">
            <a href={player.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              {english ? 'Watch on Facebook' : 'ফেসবুকে ভিডিও দেখুন'}
            </a>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
