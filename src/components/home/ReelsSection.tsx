import { Play } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { homeReelsSetting, parseHomeReels } from '@/lib/homeReels';
import { imageVariant } from '@/lib/responsiveImage';

const ReelViewer = lazy(() => import('./ReelViewer'));

export default function ReelsSection() {
  const { getSetting } = useSiteSettings();
  const { language } = useLanguage();
  const [active, setActive] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const reels = parseHomeReels(getSetting(homeReelsSetting));
  if (!reels.length) return null;
  const current = active === null ? undefined : reels[active];
  const playLabel = language === 'en' ? 'Play' : 'চালান';

  return (
    <section aria-labelledby="home-reels-heading" className="mx-auto w-full px-3 pb-2 pt-5 md:px-1">
      <h2 id="home-reels-heading" className="mb-3 text-lg font-bold text-foreground md:text-xl">Reels</h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide">
        {reels.map((reel, index) => (
          <button key={reel.id} type="button" aria-label={`${playLabel} ${reel.title}`} aria-haspopup="dialog"
            onClick={event => { opener.current = event.currentTarget; setActive(index); }}
            className="group relative aspect-[9/16] w-[calc((100%-1.5rem)/3)] min-w-0 shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-800 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 md:w-36">
            {reel.cover && <img src={imageVariant(reel.cover, 384)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 transition-colors group-hover:bg-white">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
            </span>
            <span className="absolute inset-x-2 bottom-2 line-clamp-3 break-words text-xs font-semibold leading-tight">{reel.title}</span>
          </button>
        ))}
      </div>
      <Dialog open={!!current} onOpenChange={open => {
        if (!open) {
          setActive(null);
          requestAnimationFrame(() => opener.current?.focus());
        }
      }}>
        {current && <Suspense fallback={null}>
          <ReelViewer reel={current} close={() => setActive(null)} multiple={reels.length > 1} english={language === 'en'}
            navigate={step => setActive(index => index === null ? null : (index + step + reels.length) % reels.length)} />
        </Suspense>}
      </Dialog>
    </section>
  );
}
