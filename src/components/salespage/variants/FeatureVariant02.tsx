import { renderSalesText } from '@/components/salespage/SalesRichText';
import { motion } from "framer-motion";
import { SalesPage } from "@/types/salesPage";

interface FeatureVariantProps {
  page: SalesPage;
  colors: any;
  isLightTheme: boolean;
}

// Variant 02: Cards Layout - Glass/floating cards with gradient icons
const FeatureVariant02 = ({ page, colors, isLightTheme }: FeatureVariantProps) => {
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="relative max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
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
          className="grid grid-cols-2 gap-3"
        >
          {renderSalesText(features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-2xl p-4 backdrop-blur-lg"
              style={{
                background: isLightTheme ? '#fff' : 'rgba(255,255,255,0.08)',
                border: isLightTheme ? 'none' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isLightTheme ? '0 8px 20px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-2"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
              >
                {renderSalesText(feature.icon)}
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: isLightTheme ? colors.text : '#fff' }}>
                {renderSalesText(feature.text)}
              </h3>
              {renderSalesText(feature.desc && (
                <p className="text-xs" style={{ color: isLightTheme ? colors.text : '#fff', opacity: 0.6 }}>
                  {renderSalesText(feature.desc)}
                </p>
              ))}
            </motion.div>
          )))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureVariant02;
