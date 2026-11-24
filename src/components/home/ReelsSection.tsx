import { ExternalLink, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { homeReelsSetting, parseHomeReels, reelPlayback } from '@/lib/homeReels';
import { imageVariant } from '@/lib/responsiveImage';

export default function ReelsSection() {
  const { getSetting } = useSiteSettings();
  const { language } = useLanguage();
  const reels = parseHomeReels(getSetting(homeReelsSetting));
  if (!reels.length) return null;
  const openLink = language === 'en' ? 'Open original video' : 'মূল ভিডিও খুলুন';
  const playLabel = language === 'en' ? 'Play' : 'চালান';

  return (
    <section aria-labelledby="home-reels-heading" className="mx-auto w-full px-3 pb-2 pt-5 md:px-1">
      <h2 id="home-reels-heading" className="mb-3 text-lg font-bold text-foreground md:text-xl">Reels</h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide">
        {reels.map(reel => {
          const player = reelPlayback(reel.source, reel.url);
          if (!player) return null;
          return (
            <Dialog key={reel.id}>
              <DialogTrigger asChild>
                <button type="button" aria-label={`${playLabel} ${reel.title}`}
                  className="group relative aspect-[9/16] w-[calc((100%-1.5rem)/3)] min-w-0 shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-800 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 md:w-36">
                  {reel.cover && <img src={imageVariant(reel.cover, 384)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 transition-colors group-hover:bg-white">
                    <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
                  </span>
                  <span className="absolute inset-x-2 bottom-2 line-clamp-3 break-words text-xs font-semibold leading-tight">{reel.title}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[96dvh] w-[calc(100%-1.5rem)] max-w-sm overflow-y-auto rounded-2xl p-4" aria-describedby={undefined}>
                <DialogTitle className="pr-8 text-base">{reel.title}</DialogTitle>
                {player.kind === 'video' && <video src={player.url} controls autoPlay playsInline className="mx-auto max-h-[72dvh] w-full rounded-lg bg-black" />}
                {player.kind === 'embed' && <iframe src={player.url} title={reel.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="mx-auto h-[min(68dvh,560px)] w-full rounded-lg bg-black" />}
                <a href={reel.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
                  <ExternalLink className="size-4" aria-hidden="true" />{openLink}
                </a>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </section>
  );
}
