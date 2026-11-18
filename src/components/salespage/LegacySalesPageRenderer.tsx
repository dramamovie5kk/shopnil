import SectionAppearance from './SectionAppearance';
import type { useSalesPage } from '@/hooks/useSalesPages';
// Legacy Section Components (for backward compatibility)
 import HeroSection from "@/components/salespage/HeroSection";
 import VideoSection from "@/components/salespage/VideoSection";
 import GallerySection from "@/components/salespage/GallerySection";
 import FeaturesSection from "@/components/salespage/FeaturesSection";
 import ReviewsSection from "@/components/salespage/ReviewsSection";
 import ContactSection from "@/components/salespage/ContactSection";
 import CheckoutSection from "@/components/salespage/CheckoutSection";

 // Legacy renderer for backward compatibility with old templates
 const LegacySalesPageRenderer = ({ page }: { page: ReturnType<typeof useSalesPage>['data'] }) => {
   if (!page) return null;
 
   const scrollToCheckout = () => {
     document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
   };
   const sections: Record<string, React.ReactNode> = {
     hero: page.show_hero_section && <HeroSection page={page} onOrderClick={scrollToCheckout} />,
     video: page.show_video_section && page.video_url && <VideoSection page={page} />,
     gallery: page.show_gallery_section && <GallerySection page={page} onOrderClick={scrollToCheckout} />,
     features: page.show_features_section && <FeaturesSection page={page} />,
     reviews: page.show_reviews_section && <ReviewsSection page={page} />,
     contact: page.show_contact_section && <ContactSection page={page} />,
     checkout: page.show_checkout_section && <CheckoutSection page={page} />,
   };
   const order = page.section_order?.length ? page.section_order : Object.keys(sections);
 
   return (
     <div className="min-h-screen">
       {order.map(id => <SectionAppearance key={id} page={page} section={id}>{sections[id]}</SectionAppearance>)}
 
       {/* Footer */}
       <div
         className="py-8 text-center text-sm"
         style={{
           background: `linear-gradient(180deg, #0f172a, ${page.background_color})`,
           color: page.text_color,
         }}
       >
         <p className="opacity-60">© {new Date().getFullYear()} - সকল অধিকার সংরক্ষিত</p>
       </div>
     </div>
   );
};

export default LegacySalesPageRenderer;
