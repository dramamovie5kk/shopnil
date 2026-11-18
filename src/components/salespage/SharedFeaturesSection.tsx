import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import type { CSSProperties } from "react";
import type { SalesPage, FeaturePoint } from "@/types/salesPage";
import { getFeatureDesign, getFeatureVariables } from "@/lib/featureDesigns";

const getPoints = (page: SalesPage): FeaturePoint[] => page.feature_points?.length
  ? page.feature_points.filter(point => point.text?.trim())
  : Array.from({ length: 6 }, (_, index) => {
      const slot = index + 1;
      return {
        icon: (page as unknown as Record<string, string>)[`feature_${slot}_icon`] || "✓",
        text: (page as unknown as Record<string, string>)[`feature_${slot}_text`] || "",
        description: (page as unknown as Record<string, string>)[`feature_${slot}_description`] || "",
      };
    }).filter(point => point.text.trim());

const SharedFeaturesSection = ({ page }: { page: SalesPage }) => {
  const settings = page.template_styles?.features;
  const design = getFeatureDesign(settings?.design);
  const points = getPoints(page);
  if (!points.length) return null;
  const image = page.feature_section_image || page.feature_section_images?.[0];
  return <section className={`sales-features sales-features--${design}`} style={getFeatureVariables(settings, design) as CSSProperties}>
    <div className="sales-features-inner">
      <header className="sales-features-header">
        <h2>{renderSalesText(page.features_headline || "কি কি থাকছে?")}</h2>
        {renderSalesText(page.features_subheadline && <p>{renderSalesText(page.features_subheadline)}</p>)}
      </header>
      <div className="sales-features-layout">
        {renderSalesText(image && <div className="sales-features-image"><img src={image} alt={salesPlainText(settings?.text_imageAlt || page.features_headline || "ফিচার ছবি")} loading="lazy" /></div>)}
        <div className="sales-features-items">
          {renderSalesText(points.map((point, index) => <article className="sales-features-item" key={index}>
            <span className="sales-features-icon" aria-hidden="true">{renderSalesText(point.icon || "✓")}</span>
            <span className="sales-features-number" aria-hidden="true">{renderSalesText(String(index + 1).padStart(2, "0"))}</span>
            <div className="sales-features-copy">
              <h3>{renderSalesText(point.text)}</h3>
              {renderSalesText(point.description && <p>{renderSalesText(point.description)}</p>)}
            </div>
          </article>))}
        </div>
      </div>
    </div>
  </section>;
};
export default SharedFeaturesSection;
