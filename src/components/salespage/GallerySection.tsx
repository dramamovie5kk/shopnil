import GalleryVariant01 from "./variants/GalleryVariant01";
import GalleryVariant02 from "./variants/GalleryVariant02";
import GalleryVariant03 from "./variants/GalleryVariant03";
import { SalesPage } from "@/types/salesPage";
import { getTemplateStyles } from "@/lib/salesPageTemplates";
import SharedGallerySection from "./SharedGallerySection";

interface GallerySectionProps {
  page: SalesPage;
  onOrderClick: () => void;
}

const GallerySection = ({ page, onOrderClick }: GallerySectionProps) => {
  if (page.template_styles?.gallery?.design) return <SharedGallerySection page={page} onOrderClick={onOrderClick} />;
  const { template, colors } = getTemplateStyles(page.template_id || 'nature-fresh');
  const variant = page.gallery_variant || '01';
  const isLightTheme = ['nature-fresh', 'classic-white', 'soft-elegance', 'bold-orange', 'fresh-lime'].includes(template.id);

  switch (variant) {
    case '02':
      return <GalleryVariant02 page={page} colors={colors} isLightTheme={isLightTheme} onOrderClick={onOrderClick} />;
    case '03':
      return <GalleryVariant03 page={page} colors={colors} isLightTheme={isLightTheme} onOrderClick={onOrderClick} />;
    default:
      return <GalleryVariant01 page={page} colors={colors} isLightTheme={isLightTheme} onOrderClick={onOrderClick} />;
  }
};

export default GallerySection;
