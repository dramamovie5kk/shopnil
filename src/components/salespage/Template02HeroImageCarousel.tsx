import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { salesPlainText } from '@/lib/salesRichText';

export default function Template02HeroImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [ref, carousel] = useEmblaCarousel({ loop: images.length > 2, slidesToScroll: 2, align: 'start' });
  const [active, setActive] = useState(0);
  const sync = useCallback(() => setActive(carousel?.selectedScrollSnap() ?? 0), [carousel]);
  useEffect(() => {
    if (!carousel) return;
    sync();
    carousel.on('select', sync).on('reInit', sync);
    return () => { carousel.off('select', sync).off('reInit', sync); };
  }, [carousel, sync]);
  if (!images.length) return null;
  return <div className="t2h1-carousel" role="region" aria-roledescription="carousel" aria-label="হিরোর ছবির স্লাইডার">
    <div className="t2h1-carousel-viewport" ref={ref}><div className="t2h1-carousel-track">{images.map((src, index) => <figure className="t2h1-carousel-slide" key={`${src}-${index}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${images.length}`}><img src={src} alt={salesPlainText(`${title} ${index + 1}`)} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} /></figure>)}</div></div>
    {images.length > 2 && <div className="t2h1-carousel-controls"><Button type="button" variant="outline" size="icon" className="t2h1-carousel-prev" title="আগের ছবি" aria-label="আগের ছবি" onClick={() => carousel?.scrollPrev()}><ChevronLeft size={18} /></Button><span className="sr-only" aria-live="polite">{active + 1} / {Math.ceil(images.length / 2)}</span><Button type="button" variant="outline" size="icon" className="t2h1-carousel-next" title="পরের ছবি" aria-label="পরের ছবি" onClick={() => carousel?.scrollNext()}><ChevronRight size={18} /></Button></div>}
  </div>;
}