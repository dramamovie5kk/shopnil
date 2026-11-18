import { Phone, Truck, Shield, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TopBar = () => {
  const { getSetting } = useSiteSettings();
  
  const marqueeItems = [
    { icon: Phone, text: getSetting("topbar_phone", "হেল্পলাইন: 01700-000000") },
    { icon: Truck, text: getSetting("topbar_delivery", "সারা বাংলাদেশে হোম ডেলিভারি") },
    { icon: Shield, text: getSetting("topbar_original", "100% অরিজিনাল প্রোডাক্ট") },
    { icon: Clock, text: getSetting("topbar_support", "24/7 কাস্টমার সাপোর্ট") },
  ];

  return (
    <div className="w-full bg-gradient-brand text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mx-8 text-sm font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
