import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LogoUploader from "@/components/admin/LogoUploader";
import { Search, ShoppingCart, Menu, User, ChevronDown } from "lucide-react";

type MenuItem = { label_bn?: string; label_en?: string; url?: string; type?: string };

interface HeaderCustomizerProps {
  headerBgColor: string;
  headerTextColor: string;
  topbarBgColor: string;
  topbarTextColor: string;
  topbarGradientFrom: string;
  topbarGradientTo: string;
  topbarGradientDirection: string;
  catnavBgColor: string;
  catnavTextColor: string;
  searchBgColor: string;
  searchTextColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  hoverBgColor: string;
  hotdealColor: string;
  topbarEnabled: boolean;
  topbarMessages?: string;
  siteName?: string;
  siteLogoUrl?: string;
  siteLogoText?: string;
  logoSize?: string;
  menuItems?: MenuItem[];
  onHeaderBgChange: (color: string) => void;
  onHeaderTextChange: (color: string) => void;
  onTopbarBgChange: (color: string) => void;
  onTopbarTextChange: (color: string) => void;
  onTopbarGradientFromChange: (color: string) => void;
  onTopbarGradientToChange: (color: string) => void;
  onTopbarGradientDirectionChange: (dir: string) => void;
  onCatnavBgChange: (color: string) => void;
  onCatnavTextChange: (color: string) => void;
  onSearchBgChange: (color: string) => void;
  onSearchTextChange: (color: string) => void;
  onBadgeBgChange: (color: string) => void;
  onBadgeTextChange: (color: string) => void;
  onHoverBgChange: (color: string) => void;
  onHotdealColorChange: (color: string) => void;
  onTopbarEnabledChange: (enabled: boolean) => void;
  onLogoUrlChange: (url: string) => void;
  onLogoTextChange: (text: string) => void;
  onLogoSizeChange: (size: string) => void;
}

const ColorInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-9 rounded cursor-pointer border"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "খালি রাখলে ডিফল্ট"}
        className="h-9 text-sm"
      />
    </div>
  </div>
);

const HeaderCustomizer = ({
  headerBgColor,
  headerTextColor,
  topbarBgColor,
  topbarTextColor,
  topbarGradientFrom,
  topbarGradientTo,
  topbarGradientDirection,
  catnavBgColor,
  catnavTextColor,
  searchBgColor,
  searchTextColor,
  badgeBgColor,
  badgeTextColor,
  hoverBgColor,
  hotdealColor,
  topbarEnabled,
  topbarMessages,
  siteName,
  siteLogoUrl,
  siteLogoText,
  logoSize,
  menuItems,
  onHeaderBgChange,
  onHeaderTextChange,
  onTopbarBgChange,
  onTopbarTextChange,
  onTopbarGradientFromChange,
  onTopbarGradientToChange,
  onTopbarGradientDirectionChange,
  onCatnavBgChange,
  onCatnavTextChange,
  onSearchBgChange,
  onSearchTextChange,
  onBadgeBgChange,
  onBadgeTextChange,
  onHoverBgChange,
  onHotdealColorChange,
  onTopbarEnabledChange,
  onLogoUrlChange,
  onLogoTextChange,
  onLogoSizeChange,
}: HeaderCustomizerProps) => {
  const presetColors = [
    { name: "স্লেট ডার্ক", bg: "#0f172a", text: "#ffffff" },
    { name: "ইন্ডিগো", bg: "#312e81", text: "#ffffff" },
    { name: "এমেরাল্ড", bg: "#064e3b", text: "#ffffff" },
    { name: "রোজ", bg: "#9f1239", text: "#ffffff" },
    { name: "অ্যাম্বার", bg: "#78350f", text: "#ffffff" },
    { name: "সায়ান", bg: "#155e75", text: "#ffffff" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">লোগো, মেনু ও সাধারণ সেটিংস</CardTitle>
        <CardDescription>
          লোগো ও মেনু পরিবর্তন করুন। সাধারণ রং মোবাইলের মূল থিমে প্রযোজ্য; উপরের কম্পোনেন্ট সেটিংস অগ্রাধিকার পাবে।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Colors */}
        <div className="space-y-2">
          <Label>প্রিসেট থিম</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presetColors.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onHeaderBgChange(preset.bg);
                  onHeaderTextChange(preset.text);
                }}
                className="flex flex-col items-center gap-1 p-2 border rounded-lg hover:border-primary transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: preset.bg }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Logo */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">লোগো</h4>
          <LogoUploader currentLogoUrl={siteLogoUrl || ""} onLogoChange={onLogoUrlChange} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">লোগো টেক্সট (ইমেজ না থাকলে)</Label>
              <Input
                value={siteLogoText || ""}
                onChange={(e) => onLogoTextChange(e.target.value)}
                placeholder="SE"
                maxLength={4}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">লোগো সাইজ (px)</Label>
              <Input
                type="number"
                value={logoSize || "44"}
                onChange={(e) => onLogoSizeChange(e.target.value)}
                min="24"
                max="120"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            লোগো আপলোড করলে হেডারে সেটাই দেখাবো; ইমেজ না থাকলে লোগো টেক্সট দেখাবে।
          </p>
        </div>

        <Separator />

        {/* Top Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">টপ বার</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{topbarEnabled ? "অন" : "অফ"}</span>
              <Switch checked={topbarEnabled} onCheckedChange={onTopbarEnabledChange} />
            </div>
          </div>
          {topbarEnabled && (
          <>
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorInput label="ব্যাকগ্রাউন্ড" value={topbarBgColor} onChange={onTopbarBgChange} placeholder="খালি = প্রাইমারি" />
            <ColorInput label="টেক্সট" value={topbarTextColor} onChange={onTopbarTextChange} placeholder="#ffffff" />
          </div>
          <div className="pt-2 space-y-2">
            <Label className="text-sm font-medium">গ্রেডিয়েন্ট কালার (দুটো দিলে গ্রেডিয়েন্ট সক্রিয় হবে)</Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorInput label="গ্রেডিয়েন্ট ফ্রম" value={topbarGradientFrom} onChange={onTopbarGradientFromChange} placeholder="#16a34a" />
              <ColorInput label="গ্রেডিয়েন্ট টু" value={topbarGradientTo} onChange={onTopbarGradientToChange} placeholder="#15803d" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">দিক (direction)</Label>
              <select
                value={topbarGradientDirection || "to right"}
                onChange={(e) => onTopbarGradientDirectionChange(e.target.value)}
                className="w-full h-9 px-2 border rounded text-sm bg-background"
              >
                <option value="to right">বাম → ডান</option>
                <option value="to left">ডান → বাম</option>
                <option value="to bottom">উপর → নিচ</option>
                <option value="to top">নিচ → উপর</option>
                <option value="135deg">কোণাকুণি (135°)</option>
                <option value="45deg">কোণাকুণি (45°)</option>
              </select>
            </div>
          </div>
          </>
          )}
        </div>

        <Separator />

        {/* Main Header */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">মূল হেডার</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorInput label="ব্যাকগ্রাউন্ড" value={headerBgColor} onChange={onHeaderBgChange} placeholder="#0f172a" />
            <ColorInput label="টেক্সট" value={headerTextColor} onChange={onHeaderTextChange} placeholder="#ffffff" />
            <ColorInput label="হোভার ব্যাকগ্রাউন্ড" value={hoverBgColor} onChange={onHoverBgChange} placeholder="খালি = white/10" />
          </div>
        </div>

        <Separator />

        {/* Search Bar */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">সার্চ বার</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorInput label="ব্যাকগ্রাউন্ড" value={searchBgColor} onChange={onSearchBgChange} placeholder="খালি = white/10" />
            <ColorInput label="টেক্সট / প্লেসহোল্ডার" value={searchTextColor} onChange={onSearchTextChange} placeholder="খালি = white/50" />
          </div>
        </div>

        <Separator />

        {/* Category Nav */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">ক্যাটাগরি নেভিগেশন</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorInput label="ব্যাকগ্রাউন্ড" value={catnavBgColor} onChange={onCatnavBgChange} placeholder="খালি = হেডার BG" />
            <ColorInput label="টেক্সট" value={catnavTextColor} onChange={onCatnavTextChange} placeholder="খালি = white/85" />
          </div>
        </div>

        <Separator />

        {/* Cart Badge & Hot Deal */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">কার্ট ব্যাজ ও হট ডিল</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorInput label="ব্যাজ ব্যাকগ্রাউন্ড" value={badgeBgColor} onChange={onBadgeBgChange} placeholder="খালি = প্রাইমারি" />
            <ColorInput label="ব্যাজ টেক্সট" value={badgeTextColor} onChange={onBadgeTextChange} placeholder="খালি = সাদা" />
            <ColorInput label="হট ডিল টেক্সট" value={hotdealColor} onChange={onHotdealColorChange} placeholder="খালি = কমলা" />
          </div>
        </div>

        <Separator />

        {/* Real-time Preview */}
        {(() => {
          const message = (topbarMessages || "👉 অফার চলছে|🚚 ফ্রি ডেলিভারি|🏆 ১০০% অরিজিনাল")
            .split(/\n|\|/).map(s => s.trim()).filter(Boolean)[0] || "";
          const topbarStyle = {
            backgroundColor: (topbarGradientFrom && topbarGradientTo) ? undefined : (topbarBgColor || "hsl(var(--primary))"),
            backgroundImage: (topbarGradientFrom && topbarGradientTo)
              ? `linear-gradient(${topbarGradientDirection || "to right"}, ${topbarGradientFrom}, ${topbarGradientTo})`
              : undefined,
            color: topbarTextColor || "#ffffff",
          };
          const renderTopBar = (height: string, fontSize: string) => (
            topbarEnabled && message ? (
              <div className={`${height} overflow-hidden flex items-center justify-center`} style={topbarStyle}>
                <span className="font-medium text-center px-2 truncate" style={{ fontSize }}>{message}</span>
              </div>
            ) : null
          );
          const logoSizePx = Math.min(120, Math.max(24, Number(logoSize) || 44));
          const renderLogo = (size: number) => (
            siteLogoUrl ? (
              <img src={siteLogoUrl} alt={siteName || "logo"} style={{ height: `${size}px` }} className="w-auto object-contain" />
            ) : (
              <span className="font-bold" style={{ fontSize: size * 0.55 }}>{siteName || siteLogoText || "লোগো"}</span>
            )
          );
          return (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">লোগো ও সাধারণ রঙের নমুনা</Label>
                <div className="rounded-lg overflow-hidden border">
                  {renderTopBar("h-9", "13px")}
                   <div className="h-16 flex items-center justify-between px-6 gap-4" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                     {renderLogo(logoSizePx)}
                     <div className="flex items-center gap-5 text-sm">
                       {(menuItems && menuItems.length > 0
                         ? menuItems
                         : [
                             { label_bn: "হোম" },
                             { label_bn: "শপ" },
                             { type: "categories", label_bn: "ক্যাটেগরি" },
                           ]
                       ).map((it, i) => (
                         <span key={i} className="inline-flex items-center gap-1">
                           {it.label_bn || it.label_en}
                           {it.type === "categories" && <ChevronDown className="h-3.5 w-3.5 opacity-80" />}
                         </span>
                       ))}
                     </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="p-2 rounded-xl" style={{ color: headerTextColor }}>
                        <Search className="h-5 w-5 opacity-90" />
                      </button>
                      <div className="flex items-center gap-2 p-2 rounded-xl" style={{ color: headerTextColor }}>
                        <User className="h-5 w-5 opacity-90" />
                        <div className="text-left leading-tight">
                          <p className="text-[10px] opacity-70">আমার</p>
                          <p className="text-xs font-medium">অ্যাকাউন্ট</p>
                        </div>
                      </div>
                      <button className="relative p-2 rounded-lg" style={{ color: headerTextColor }}>
                        <ShoppingCart className="h-5 w-5 opacity-90" />
                        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1" style={{ backgroundColor: badgeBgColor || "hsl(var(--primary))", color: badgeTextColor || "#ffffff" }}>3</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">মোবাইলের সাধারণ রঙের নমুনা</Label>
                <div className="rounded-lg overflow-hidden border mx-auto" style={{ maxWidth: 380 }}>
                  {renderTopBar("h-8", "11px")}
                  <div className="h-14 flex items-center px-3 gap-2" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                    <div className="shrink-0">{renderLogo(Math.round(logoSizePx * 0.72))}</div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="p-1.5 rounded-lg border border-white/30" style={{ color: headerTextColor }}>
                        <Search className="h-4 w-4 opacity-90" />
                      </button>
                      <button className="relative p-1.5 rounded-lg border border-white/30" style={{ color: headerTextColor }}>
                        <ShoppingCart className="h-4 w-4 opacity-90" />
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] text-[9px] font-bold rounded-full flex items-center justify-center px-1" style={{ backgroundColor: badgeBgColor || "hsl(var(--primary))", color: badgeTextColor || "#ffffff" }}>3</span>
                      </button>
                      <button className="p-1.5 rounded-lg border border-white/30" style={{ color: headerTextColor }}>
                        <Menu className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default HeaderCustomizer;