import { useEffect } from "react";
import Header from "@/components/layout/Header";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import BlogSection from "@/components/home/BlogSection";
import Footer from "@/components/layout/Footer";
import DynamicProductSection from "@/components/home/DynamicProductSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePixelTracking } from "@/hooks/usePixelTracking";

const Index = () => {
  const { getSetting, isLoading } = useSiteSettings();
  const isSliderFullWidth = getSetting("slider_full_width", "false") === "true";
  const { trackPageView } = usePixelTracking();

  useEffect(() => {
    trackPageView("Home");
  }, [trackPageView]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Full-width slider outside container - no margin */}
      {isSliderFullWidth && !isLoading && (
        <div className="w-full">
          <HeroSlider isFullWidth />
        </div>
      )}
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-1 md:px-4 pb-16 lg:pb-0">
        <div className="w-full space-y-[30px]">
          {/* Contained slider inside container - with margin */}
          {!isSliderFullWidth && !isLoading && <HeroSlider />}
          <CategoryGrid />
          
          {/* Dynamic Product Sections - configurable from admin */}
          <DynamicProductSection sectionNumber={1} />
          <DynamicProductSection sectionNumber={2} />
          <DynamicProductSection sectionNumber={3} />
          <DynamicProductSection sectionNumber={4} />
          <DynamicProductSection sectionNumber={5} />
          <DynamicProductSection sectionNumber={6} />
          
          <BlogSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
