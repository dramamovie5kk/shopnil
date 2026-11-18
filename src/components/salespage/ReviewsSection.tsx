import ReviewVariant01 from "./variants/ReviewVariant01";
import ReviewVariant02 from "./variants/ReviewVariant02";
import ReviewVariant03 from "./variants/ReviewVariant03";
import { SalesPage } from "@/types/salesPage";
import { getTemplateStyles } from "@/lib/salesPageTemplates";

interface ReviewsSectionProps {
  page: SalesPage;
}

const ReviewsSection = ({ page }: ReviewsSectionProps) => {
  const { template, colors } = getTemplateStyles(page.template_id || 'nature-fresh');
  const variant = page.review_variant || '01';
  const isLightTheme = ['nature-fresh', 'classic-white', 'soft-elegance', 'bold-orange', 'fresh-lime'].includes(template.id);

  switch (variant) {
    case '02':
      return <ReviewVariant02 page={page} colors={colors} isLightTheme={isLightTheme} />;
    case '03':
      return <ReviewVariant03 page={page} colors={colors} isLightTheme={isLightTheme} />;
    default:
      return <ReviewVariant01 page={page} colors={colors} isLightTheme={isLightTheme} />;
  }
};

export default ReviewsSection;
