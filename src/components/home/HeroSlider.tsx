import { imageVariant, imageSrcSet } from "@/lib/responsiveImage";
import { useCarouselPause } from "@/hooks/useCarouselPause";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface SliderImage {
  id: string;
  url: string;
  link?: string;
}

interface HeroSliderProps {
  isFullWidth?: boolean;
  height?: number;
  responsiveBanner?: boolean;
}

const HeroSlider = ({ isFullWidth = false, height, responsiveBanner = false }: HeroSliderProps) => {
  const { getSetting, isLoading } = useSiteSettings();
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);

  const heightMobile = height || getSetting("slider_height_mobile", "180");
  const heightDesktop = height || getSetting("slider_height_desktop", "450");

  // Embla carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnFocusIn: false }),
  ]);
  const pauseRef = useCarouselPause(emblaApi);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Parse slider images from settings
  useEffect(() => {
    const imagesJson = getSetting("slider_images", "[]");
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSliderImages(parsed);
      }
    } catch (e) {
      console.error("Error parsing slider images:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Carousel callbacks
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  // If no slider images, don't render
  if (sliderImages.length === 0) {
    return null;
  }

  return (
    <section
      ref={pauseRef}
      data-banner-slider
      className={`group/slider relative overflow-hidden bg-secondary/30 ${isFullWidth ? "w-full" : "mt-[5px] md:mt-[10px] rounded-lg w-[calc(100vw-10px)] md:w-[calc(100vw-40px)] left-1/2 -translate-x-1/2 relative"}`}
      style={{ '--slider-h-mobile': `${heightMobile}px`, '--slider-h-desktop': `${heightDesktop}px` } as React.CSSProperties}
    >
      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sliderImages.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              {slide.link ? (
                <Link to={slide.link} className="block">
                    <img
                      src={imageVariant(slide.url,1600)}
                      srcSet={imageSrcSet(slide.url)} sizes="100vw" decoding="async"
                      fetchPriority={index === 0 ? "high" : "low"}
                      alt={`Slide ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      className={`w-full object-cover ${responsiveBanner ? "banner-responsive-height" : "slider-responsive-height"}`}
                    />
                </Link>
              ) : (
                <img
                  src={imageVariant(slide.url,1600)}
                      srcSet={imageSrcSet(slide.url)} sizes="100vw" decoding="async"
                      fetchPriority={index === 0 ? "high" : "low"}
                  alt={`Slide ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`w-full object-cover ${responsiveBanner ? "banner-responsive-height" : "slider-responsive-height"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {sliderImages.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            aria-label="আগের ব্যানার"
            className="banner-navigation absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-0 shadow-lg hover:bg-background z-10 h-8 w-8 md:h-10 md:w-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="পরের ব্যানার"
            className="banner-navigation absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-0 shadow-lg hover:bg-background z-10 h-8 w-8 md:h-10 md:w-10"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* Dots */}
          <div className="banner-navigation absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                aria-label={`ব্যানার ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-primary w-6 md:w-8"
                    : "bg-primary/40 w-2 md:w-2.5 hover:bg-primary/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
