import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";

interface FeatureVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 03: Icons Layout - Compact 3-column grid focused on icons
const FeatureVariant03 = ({ page, colors, isLightTheme }: FeatureVariantProps) => {
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
      <div 
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: colors.primary }}
      />

      <div className="relative max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
            {renderSalesText(page.features_headline)}
          </h2>
          <p className="text-lg" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.7 }}>
            {renderSalesText(page.features_subheadline)}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3"
        >
          {renderSalesText(features.slice(0, 6).map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-3"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 text-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
              >
                {renderSalesText(feature.icon)}
              </div>
              <h3 className="font-medium text-xs" style={{ color: isLightTheme ? colors.text : '#fff' }}>
                {renderSalesText(feature.text)}
              </h3>
            </motion.div>
          )))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureVariant03;
