import HeroVariant01 from "./variants/HeroVariant01";
import SharedHeroSection from "./SharedHeroSection";
import HeroVariant02 from "./variants/HeroVariant02";
import HeroVariant03 from "./variants/HeroVariant03";
import HeroVariant04 from "./variants/HeroVariant04";
import HeroVariant05 from "./variants/HeroVariant05";
import { SalesPage } from "@/types/salesPage";
import { getTemplateStyles } from "@/lib/salesPageTemplates";

interface HeroSectionProps {
  page: SalesPage;
  onOrderClick: () => void;
}

const HeroSection = ({ page, onOrderClick }: HeroSectionProps) => {
  if (page.template_styles?.hero?.design) return <SharedHeroSection page={page} onOrderClick={onOrderClick} />;
  const { colors } = getTemplateStyles(page.template_id || 'nature-fresh');
  const variant = page.hero_variant || '01';

  switch (variant) {
    case '02':
      return <HeroVariant02 page={page} colors={colors} onOrderClick={onOrderClick} />;
    case '03':
      return <HeroVariant03 page={page} colors={colors} onOrderClick={onOrderClick} />;
    case '04':
      return <HeroVariant04 page={page} colors={colors} onOrderClick={onOrderClick} />;
    case '05':
      return <HeroVariant05 page={page} colors={colors} onOrderClick={onOrderClick} />;
    default:
      return <HeroVariant01 page={page} colors={colors} onOrderClick={onOrderClick} />;
  }
};

export default HeroSection;
