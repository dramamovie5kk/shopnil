import { imageVariant, imageSrcSet } from "@/lib/responsiveImage";
import { useCarouselPause } from "@/hooks/useCarouselPause";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { HomeBannerConfig, parseHomeBannerConfig } from "@/lib/homeBanner";
import HeroSlider from "./HeroSlider";

const responsiveHeightStyle = (config: HomeBannerConfig): CSSProperties => ({
  '--banner-height-mobile': config.heightMobile > 0 ? `${config.heightMobile}px` : 'auto',
  '--banner-height-desktop': config.heightDesktop > 0 ? `${config.heightDesktop}px` : 'auto',
  '--banner-fit-mobile': config.heightMobile > 0 ? 'cover' : 'contain',
  '--banner-fit-desktop': config.heightDesktop > 0 ? 'cover' : 'contain',
} as CSSProperties);

export function BannerSlider({ config }: { config: HomeBannerConfig }) {
  const multi = config.images.length > 1;
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: multi },
    config.autoplay && multi ? [Autoplay({ delay: config.intervalSec * 1000, stopOnInteraction: true, stopOnFocusIn: false })] : [],
  );
  const pauseRef = useCarouselPause(embla, config.autoplay && multi);
  const [index, setIndex] = useState(0);
  const onSelect = useCallback(() => embla && setIndex(embla.selectedScrollSnap()), [embla]);
  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => { embla.off("select", onSelect); };
  }, [embla, onSelect]);

  return (
    <div style={{ margin: `${config.marginTop}px ${config.marginRight}px ${config.marginBottom}px ${config.marginLeft}px` }}>
    <section
      ref={pauseRef}
      data-banner-slider
      aria-label="হোমপেজ ব্যানার"
      className="relative overflow-hidden"
      style={{
        ...responsiveHeightStyle(config),
        width: `${config.width}%`,
        marginInline: "auto",
        borderRadius: config.radius,
      }}
    >
      <div ref={emblaRef} className="overflow-hidden" style={{ borderRadius: config.radius }}>
        <div className="flex">
          {config.images.map((src, i) => (
            <div key={src + i} className="min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={imageVariant(src,1600)}
                srcSet={imageSrcSet(src)}
                sizes="100vw"
                decoding="async"
                alt={`ব্যানার ${i + 1}`}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                className="block w-full banner-responsive-height"
                style={{ borderRadius: config.radius }}
              />
            </div>
          ))}
        </div>
      </div>
      {multi && config.showArrows && (
        <>
          <button type="button" aria-label="আগের ব্যানার" onClick={() => embla?.scrollPrev()} className="banner-navigation absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground shadow hover:bg-background">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="পরের ব্যানার" onClick={() => embla?.scrollNext()} className="banner-navigation absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground shadow hover:bg-background">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      {multi && config.showDots && (
        <div className="banner-navigation absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {config.images.map((_, i) => (
            <button key={i} type="button" aria-label={`ব্যানার ${i + 1}`} onClick={() => embla?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-2 bg-background/80"}`} />
          ))}
        </div>
      )}
    </section>
    </div>
  );
}

export default function HomeBanner() {
  const { getSetting, isLoading } = useSiteSettings();
  if (isLoading) return null;
  const config = parseHomeBannerConfig(getSetting("home_banner_config"), getSetting("home_banner_image"));
  if (!config.images.length) return <div style={{ margin: `${config.marginTop}px ${config.marginRight}px ${config.marginBottom}px ${config.marginLeft}px` }}>
    <div style={{ ...responsiveHeightStyle(config), width: `${config.width}%`, marginInline: "auto", borderRadius: config.radius, overflow: "hidden" }}><HeroSlider isFullWidth responsiveBanner /></div>
  </div>;
  return <BannerSlider config={config} />;
}
