import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, ShoppingBag, MessageCircle, User, Tag } from "lucide-react";

interface BottomNavSettings {
  bottom_nav_home_link: string;
  bottom_nav_shop_link: string;
  bottom_nav_whatsapp_link: string;
  bottom_nav_account_link: string;
  bottom_nav_offers_link: string;
}

interface BottomNavManagerProps {
  settings: BottomNavSettings;
  onSettingsChange: (key: keyof BottomNavSettings, value: string) => void;
}

const BottomNavManager = ({ settings, onSettingsChange }: BottomNavManagerProps) => {
  const navItems = [
    {
      key: "bottom_nav_home_link" as const,
      label: "হোম",
      icon: Home,
      defaultValue: "/",
    },
    {
      key: "bottom_nav_shop_link" as const,
      label: "শপ",
      icon: ShoppingBag,
      defaultValue: "/products",
    },
    {
      key: "bottom_nav_whatsapp_link" as const,
      label: "হোয়াটসঅ্যাপ",
      icon: MessageCircle,
      defaultValue: "https://wa.me/8801XXXXXXXXX",
    },
    {
      key: "bottom_nav_account_link" as const,
      label: "অ্যাকাউন্ট",
      icon: User,
      defaultValue: "/dashboard",
    },
    {
      key: "bottom_nav_offers_link" as const,
      label: "অফার",
      icon: Tag,
      defaultValue: "/products?featured=true",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">মোবাইল বটম নেভিগেশন</CardTitle>
        <CardDescription>
          মোবাইলে নিচের নেভিগেশন বারের লিংক পরিবর্তন করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <Input
                    value={settings[item.key] || ""}
                    onChange={(e) => onSettingsChange(item.key, e.target.value)}
                    placeholder={item.defaultValue}
                    className="text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-6 pt-4 border-t">
          <Label className="text-sm text-muted-foreground mb-2 block">প্রিভিউ</Label>
          <div className="bg-background border rounded-xl overflow-hidden">
            <div className="flex items-center justify-around h-14 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex flex-col items-center">
                    <div className={`p-1 rounded-full ${item.key === "bottom_nav_whatsapp_link" ? "bg-green-500 text-white" : "text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] mt-0.5">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BottomNavManager;
