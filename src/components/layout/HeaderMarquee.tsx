import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import type { HeaderDevice } from '@/lib/headerCustomization';

export function HeaderMarquee({ messages, device, duration, background, color, bn }: {
  messages: string;
  device: HeaderDevice;
  duration: string;
  background?: string;
  color?: string;
  bn: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const sequence = sequenceRef.current;
    if (!viewport || !sequence) return;
    const fit = () => {
      const width = sequence.getBoundingClientRect().width;
      setRepeatCount(width > 0 ? Math.max(1, Math.ceil(viewport.clientWidth / width)) : 1);
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    observer.observe(sequence);
    return () => observer.disconnect();
  }, [messages]);

  const items = messages.split(/[\n|]/).map(text => text.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
  if (!items.length) return null;

  const seconds = Math.min(90, Math.max(10, Number(duration) || 30));
  const label = paused ? (bn ? 'ঘোষণা চালান' : 'Play announcements') : (bn ? 'ঘোষণা থামান' : 'Pause announcements');
  return (
    <div data-header-device={device} data-header-part="topbar" data-header-marquee
      className="relative bg-black text-white text-[13px] leading-tight"
      style={{ background: background || undefined, color: color || undefined }}>
      <div className="flex min-h-9 items-center">
        <div ref={viewportRef} className="header-marquee-window min-w-0 flex-1 overflow-hidden">
          <div className="header-marquee-track" data-paused={paused}
            style={{ '--header-marquee-duration': `${seconds}s` } as CSSProperties}>
            {[0, 1].map(copy => (
              <div className="header-marquee-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {Array.from({ length: repeatCount }, (_, repeat) => {
                  const original = copy === 0 && repeat === 0;
                  return (
                    <div key={repeat} ref={original ? sequenceRef : undefined} className="header-marquee-sequence"
                      aria-hidden={copy === 0 && !original ? true : undefined}>
                      {items.map((item, index) => <span key={index} data-header-device={device} data-header-part="message">{item}</span>)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <button type="button" aria-label={label} onClick={() => setPaused(value => !value)}
          className="header-marquee-control self-stretch shrink-0 px-3 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2">
          {paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
