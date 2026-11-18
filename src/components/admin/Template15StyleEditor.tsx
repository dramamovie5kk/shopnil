import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

// Default styles matching Template15Universal.tsx
const defaultStyles: Record<string, Record<string, string>> = {
  global: {
    backgroundColor: "#f4f4f4",
    maxWidth: "650",
    sectionGap: "5",
    fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
  },
  hero: {
    backgroundColor: "#f0fdf4",
    headerBgColor: "#065f46",
    headerTextColor: "#ffffff",
    subheadlineColor: "#16a34a",
    borderRadius: "15",
    videoBorderColor: "#4ade80",
    videoBorderWidth: "4",
    offerTextColor: "#16a34a",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
    ctaFontSize: "20",
  },
  features: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    itemBgColor: "rgba(255,255,255,0.1)",
    itemTextColor: "#ffffff",
    checkBgColor: "#4ade80",
    checkIconColor: "#065f46",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
  },
  reviews: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    imageBorderColor: "#4ade80",
    imageBorderWidth: "3",
  },
  contact: {
    borderRadius: "15",
  },
  checkout: {
    borderRadius: "15",
  },
  extra: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    itemBgColor: "rgba(255,255,255,0.1)",
    itemTextColor: "#ffffff",
    checkBgColor: "#4ade80",
    checkIconColor: "#065f46",
    ctaBgColor: "#064e3b",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "50",
  },
  gallery: {
    borderRadius: "15",
  },
  video: {
    backgroundColor: "#065f46",
    borderRadius: "15",
    headingColor: "#ffffff",
    subheadingColor: "rgba(255,255,255,0.7)",
    videoBorderColor: "#4ade80",
    videoBorderWidth: "3",
  },
  countdown: {
    backgroundColor: "#064e3b",
    borderRadius: "15",
    textColor: "#ffffff",
    numberBgColor: "rgba(255,255,255,0.15)",
    numberColor: "#ffffff",
    labelColor: "rgba(255,255,255,0.7)",
  },
  footer: {
    backgroundColor: "#065f46",
    textColor: "#ffffff",
  },
};

interface Template15StyleEditorProps {
  templateStyles: Record<string, Record<string, string>>;
  onChange: (styles: Record<string, Record<string, string>>) => void;
}

const Template15StyleEditor = ({ templateStyles, onChange }: Template15StyleEditorProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Merge with defaults
  const getVal = (section: string, key: string): string => {
    return templateStyles?.[section]?.[key] ?? defaultStyles[section]?.[key] ?? "";
  };

  const setVal = (section: string, key: string, value: string) => {
    const updated = { ...templateStyles };
    if (!updated[section]) updated[section] = {};
    updated[section] = { ...updated[section], [key]: value };
    onChange(updated);
  };

  const ColorField = ({ section, field, label }: { section: string; field: string; label: string }) => (
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        <input
          type="color"
          value={getVal(section, field)}
          onChange={(e) => setVal(section, field, e.target.value)}
          className="w-7 h-7 rounded border cursor-pointer flex-shrink-0"
        />
        <Input
          value={getVal(section, field)}
          onChange={(e) => setVal(section, field, e.target.value)}
          className="h-7 text-[10px] flex-1"
        />
      </div>
    </div>
  );

  const RadiusSlider = ({ section, field, label, max = 50 }: { section: string; field: string; label: string; max?: number }) => (
    <div>
      <div className="flex justify-between items-center">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground">{getVal(section, field)}px</span>
      </div>
      <Slider
        value={[parseInt(getVal(section, field)) || 0]}
        onValueChange={([v]) => setVal(section, field, String(v))}
        max={max}
        min={0}
        step={1}
        className="mt-1"
      />
    </div>
  );

  const FontSizeSlider = ({ section, field, label }: { section: string; field: string; label: string }) => (
    <div>
      <div className="flex justify-between items-center">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground">{getVal(section, field)}px</span>
      </div>
      <Slider
        value={[parseInt(getVal(section, field)) || 16]}
        onValueChange={([v]) => setVal(section, field, String(v))}
        max={48}
        min={10}
        step={1}
        className="mt-1"
      />
    </div>
  );

  const SectionGroup = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-muted/40 cursor-pointer"
        onClick={() => setExpandedGroup(expandedGroup === id ? null : id)}
      >
        <span className="text-xs font-medium">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedGroup === id ? 'rotate-180' : ''}`} />
      </div>
      {expandedGroup === id && (
        <div className="p-3 border-t space-y-3 bg-background">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2 pt-2 border-t mt-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        🎨 কাস্টম টেমপ্লেট স্টাইল
      </Label>

      {/* Global */}
      {SectionGroup({ id: "global", label: "🌐 গ্লোবাল সেটিংস", children: (<>
        {ColorField({ section: "global", field: "backgroundColor", label: "পেজ ব্যাকগ্রাউন্ড", })}
        <div>
          <Label className="text-[10px] text-muted-foreground">ম্যাক্স-উইথ</Label>
          <Select value={getVal("global", "maxWidth")} onValueChange={(v) => setVal("global", "maxWidth", v)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="480">৪৮০px (মোবাইল)</SelectItem>
              <SelectItem value="550">৫৫০px (কম্প্যাক্ট)</SelectItem>
              <SelectItem value="650">৬৫০px (ডিফল্ট)</SelectItem>
              <SelectItem value="800">৮০০px (ওয়াইড)</SelectItem>
              <SelectItem value="1024">১০২৪px (ডেস্কটপ)</SelectItem>
              <SelectItem value="1200">১২০০px (ফুল-উইথ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Label className="text-[10px] text-muted-foreground">সেকশন গ্যাপ</Label>
            <span className="text-[10px] text-muted-foreground">{getVal("global", "sectionGap")}px</span>
          </div>
          <Slider
            value={[parseInt(getVal("global", "sectionGap")) || 5]}
            onValueChange={([v]) => setVal("global", "sectionGap", String(v))}
            max={30}
            min={0}
            step={1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">ফন্ট ফ্যামিলি</Label>
          <Select value={getVal("global", "fontFamily")} onValueChange={(v) => setVal("global", "fontFamily", v)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="'Baloo Da Digits', 'Hind Siliguri', sans-serif">Hind Siliguri</SelectItem>
              <SelectItem value="'Noto Sans Bengali', sans-serif">Noto Sans Bengali</SelectItem>
              <SelectItem value="'Tiro Bangla', serif">Tiro Bangla (সেরিফ)</SelectItem>
              <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
              <SelectItem value="system-ui, sans-serif">সিস্টেম ডিফল্ট</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>) })}

      {/* Contact & Checkout */}
      {SectionGroup({ id: "contact-checkout", label: "🛒 চেকআউট", children: (<>
        {RadiusSlider({ section: "checkout", field: "borderRadius", label: "চেকআউট বর্ডার রেডিয়াস", })}
      </>) })}

      {/* Footer */}
      {SectionGroup({ id: "footer", label: "📄 ফুটার", children: (<>
        <div className="grid grid-cols-2 gap-2">
          {ColorField({ section: "footer", field: "backgroundColor", label: "ব্যাকগ্রাউন্ড", })}
          {ColorField({ section: "footer", field: "textColor", label: "টেক্সট কালার", })}
        </div>
      </>) })}
    </div>
  );
};

export default Template15StyleEditor;
