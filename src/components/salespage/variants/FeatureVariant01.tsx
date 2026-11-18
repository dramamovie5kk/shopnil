import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";
import { Check } from "lucide-react";

interface FeatureVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 01: Checklist Layout - Clean checklist style with left border accent
const FeatureVariant01 = ({ page, colors, isLightTheme }: FeatureVariantProps) => {
  const features = [
    { text: page.feature_1_text, icon: page.feature_1_icon, desc: page.feature_1_description },
    { text: page.feature_2_text, icon: page.feature_2_icon, desc: page.feature_2_description },
    { text: page.feature_3_text, icon: page.feature_3_icon, desc: page.feature_3_description },
    { text: page.feature_4_text, icon: page.feature_4_icon, desc: page.feature_4_description },
    { text: page.feature_5_text, icon: page.feature_5_icon, desc: page.feature_5_description },
    { text: page.feature_6_text, icon: page.feature_6_icon, desc: page.feature_6_description },
  ].filter(f => f.text);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      className="py-8 px-4 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {renderSalesText(page.features_headline)}
          </h2>
          <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
            {renderSalesText(page.features_subheadline)}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-2"
        >
          {renderSalesText(features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-start gap-3 p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: isLightTheme ? '#fff' : 'rgba(255,255,255,0.05)',
                borderLeftColor: colors.primary,
                boxShadow: isLightTheme ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: colors.primary }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: colors.text }}>
                  {renderSalesText(feature.text)}
                </h3>
                {renderSalesText(feature.desc && (
                  <p className="text-xs mt-0.5" style={{ color: colors.text, opacity: 0.7 }}>
                    {renderSalesText(feature.desc)}
                  </p>
                ))}
              </div>
            </motion.div>
          )))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureVariant01;
