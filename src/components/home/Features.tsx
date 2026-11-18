import { Truck, Shield, Headphones, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Truck,
      title: t('features.free_delivery'),
      description: t('features.free_delivery_desc'),
    },
    {
      icon: Shield,
      title: t('features.secure_payment'),
      description: t('features.secure_payment_desc'),
    },
    {
      icon: RefreshCcw,
      title: t('features.easy_return'),
      description: t('features.easy_return_desc'),
    },
    {
      icon: Headphones,
      title: t('features.support'),
      description: t('features.support_desc'),
    },
  ];

  return (
    <section className="py-6 bg-background border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-3 group"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
