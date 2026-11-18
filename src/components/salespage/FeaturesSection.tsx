import FeatureVariant01 from "./variants/FeatureVariant01";
import FeatureVariant02 from "./variants/FeatureVariant02";
import FeatureVariant03 from "./variants/FeatureVariant03";
import { SalesPage } from "@/types/salesPage";
import { getTemplateStyles } from "@/lib/salesPageTemplates";
import SharedFeaturesSection from "./SharedFeaturesSection";

interface FeaturesSectionProps {
  page: SalesPage;
}

const FeaturesSection = ({ page }: FeaturesSectionProps) => {
  if (page.template_styles?.features?.design) return <SharedFeaturesSection page={page} />;
  const { template, colors } = getTemplateStyles(page.template_id || 'nature-fresh');
  const variant = page.feature_variant || '01';
  const isLightTheme = ['nature-fresh', 'classic-white', 'soft-elegance', 'bold-orange', 'fresh-lime'].includes(template.id);

  switch (variant) {
    case '02':
      return <FeatureVariant02 page={page} colors={colors} isLightTheme={isLightTheme} />;
    case '03':
      return <FeatureVariant03 page={page} colors={colors} isLightTheme={isLightTheme} />;
    default:
      return <FeatureVariant01 page={page} colors={colors} isLightTheme={isLightTheme} />;
  }
};

export default FeaturesSection;
