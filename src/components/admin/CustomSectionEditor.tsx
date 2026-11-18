import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Plus, Trash2, GripVertical, Upload, X } from "lucide-react";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import type { CustomElementStyles, CustomSectionButton } from '@/lib/customSectionElements';
import CustomSectionElementsEditor from './CustomSectionElementsEditor';
import CustomHtmlCodeEditor from './CustomHtmlCodeEditor';

export interface CustomSection {
  id: string;
  name?: string;
  type: "text" | "image-text" | "bullet-points" | "image-grid" | "banner" | "gallery" | "slider" | "image" | "video" | "faq" | "divider" | "html" | "testimonial" | "pricing" | "countdown-timer" | "feature-icons" | "cta-banner" | "comparison" | "button";
  title: string;
  content: string;
  description?: string;
  elementStyles?: CustomElementStyles;
  buttons?: CustomSectionButton[];
  videoUrl: string;
  points: string[];
  images: string[];
  faqItems: { question: string; answer: string }[];
  testimonials: { name: string; text: string; rating: number; image?: string }[];
  pricingData: { originalPrice: string; offerPrice: string; badgeText: string; unit: string; features: string[] };
  countdownEndDate: string;
  featureItems: { icon: string; title: string; description: string }[];
  comparisonItems: { label: string; before: string; after: string }[];
  styles: {
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    headingFontSize: string;
    headingAlignment: "left" | "center" | "right";
    headingBold: boolean;
    contentFontSize: string;
    contentAlignment: "left" | "center" | "right";
    padding: string;
    borderRadius: string;
    borderColor: string;
    borderWidth: string;
    shadow: "none" | "sm" | "md" | "lg";
    imageBorderRadius: string;
    ctaBgColor: string;
    ctaTextColor: string;
    ctaBorderRadius: string;
    showCta: boolean;
    ctaText: string;
    imagePosition: "top" | "left" | "right" | "bottom";
    sectionWidth: string;
    marginX: string;
    marginTop?: string;
    marginBottom?: string;
    radiusTL?: string;
    radiusTR?: string;
    radiusBR?: string;
    radiusBL?: string;
    backgroundOpacity: string;
    backgroundImage: string;
    ctaLink: string;
  };
}

const defaultSectionStyles: CustomSection["styles"] = {
  backgroundColor: "#065f46",
  textColor: "#ffffff",
  headingColor: "#ffffff",
  headingFontSize: "22",
  headingAlignment: "center",
  headingBold: true,
  contentFontSize: "15",
  contentAlignment: "left",
  padding: "24",
  borderRadius: "15",
  borderColor: "#00000000",
  borderWidth: "0",
  shadow: "none",
  imageBorderRadius: "8",
  ctaBgColor: "#064e3b",
  ctaTextColor: "#ffffff",
  ctaBorderRadius: "50",
  showCta: true,
  ctaText: "এখনই অর্ডার করুন",
  imagePosition: "top",
  sectionWidth: "100",
  marginX: "0",
  backgroundOpacity: "100",
  backgroundImage: "",
  ctaLink: "",
};

const sectionTypeLabels: Record<CustomSection["type"], string> = {
  "text": "📝 টেক্সট ব্লক",
  "image-text": "🖼️ ইমেজ + টেক্সট",
  "bullet-points": "✅ বুলেট পয়েন্ট",
  "image-grid": "🎨 ইমেজ গ্রিড",
  "banner": "🏷️ ব্যানার",
  "gallery": "🖼️ গ্যালারি",
  "slider": "🔄 স্লাইডার",
  "image": "📷 ইমেজ",
  "video": "🎬 ভিডিও",
  "faq": "❓ FAQ",
  "divider": "➖ ডিভাইডার",
  "html": "🔧 HTML",
  "testimonial": "💬 টেস্টিমোনিয়াল",
  "pricing": "💰 প্রাইসিং",
  "countdown-timer": "⏰ কাউন্টডাউন",
  "feature-icons": "🎯 ফিচার গ্রিড",
  "cta-banner": "🔥 CTA ব্যানার",
  "comparison": "⚖️ তুলনা",
  "button": "বাটন",
};

interface CustomSectionEditorProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

const CustomSectionEditor = ({ sections, onChange }: CustomSectionEditorProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string>("");

  const addSection = (type: CustomSection["type"]) => {
    const newSection: CustomSection = {
      id: `cs-${Date.now()}`,
      type,
      title: "",
      content: "",
      videoUrl: "",
      points: [],
      images: [],
      faqItems: [],
      testimonials: [],
      pricingData: { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] },
      countdownEndDate: "",
      featureItems: [],
      comparisonItems: [],
      styles: { ...defaultSectionStyles },
    };
    onChange([...sections, newSection]);
    setExpandedId(newSection.id);
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<CustomSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateSectionStyle = (id: string, key: string, value: string | boolean) => {
    onChange(
      sections.map((s) =>
        s.id === id ? { ...s, styles: { ...s.styles, [key]: value } } : s
      )
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    onChange(newSections);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `sales-pages/custom-sections/${fileName}`;
        const { error: uploadError } = await api.storage.from("products").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = api.storage.from("products").getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }
      const section = sections.find((s) => s.id === uploadTargetId);
      if (section) {
        updateSection(uploadTargetId, { images: [...section.images, ...uploadedUrls] });
      }
      toast.success(`${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে!`);
    } catch {
      toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (sectionId: string) => {
    setUploadTargetId(sectionId);
    fileInputRef.current?.click();
  };

  const removeImage = (sectionId: string, index: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, { images: section.images.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t mt-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        ➕ কাস্টম সেকশনসমূহ ({sections.length}টি)
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Existing sections */}
      {sections.map((section, index) => (
        <div key={section.id} className="border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-2 py-1.5 bg-muted/40 cursor-pointer"
            onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0}
                  onClick={(e) => { e.stopPropagation(); moveSection(index, "up"); }}
                >
                  <GripVertical className="h-3 w-3 rotate-180" />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === sections.length - 1}
                  onClick={(e) => { e.stopPropagation(); moveSection(index, "down"); }}
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">{sectionTypeLabels[section.type]}</span>
              <span className="text-xs font-medium truncate">{section.name?.trim() || section.title || "কাস্টম সেকশন"}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-destructive hover:text-destructive/80 p-1"
                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedId === section.id ? "rotate-180" : ""}`} />
            </div>
          </div>

          {expandedId === section.id && (
            <div className="p-3 border-t space-y-3 bg-background">
              {section.type === 'html' ? <CustomHtmlCodeEditor section={section} onUpdate={updates => updateSection(section.id, updates)} /> : <>
              <div>
                <Label htmlFor={`${section.id}-name`} className="text-[10px]">সেকশনের নাম</Label>
                <Input
                  id={`${section.id}-name`}
                  value={section.name ?? ""}
                  onChange={(e) => updateSection(section.id, { name: e.target.value })}
                  placeholder="যেমন: হিরো সেকশন, গ্যালারি সেকশন"
                  className="h-7 text-xs"
                />
              </div>
              {/* Title */}
              <div>
                <Label className="text-[10px]">শিরোনাম</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="সেকশনের শিরোনাম..."
                  className="h-7 text-xs"
                />
              </div>

              {/* Content (for text, image-text, banner) */}
              {(

                <div>
                  <Label className="text-[10px]">কন্টেন্ট</Label>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="টেক্সট কন্টেন্ট লিখুন..."
                    className="min-h-[60px] text-xs"
                  />
                </div>
              )}

              <div>
                <Label className="text-[10px]">বর্ণনা / ডিসক্রিপশন</Label>
                <Textarea value={section.description ?? ""}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  className="min-h-[60px] text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">ভিডিও URL</Label>
                <Input value={section.videoUrl || ""}
                  onChange={(e) => updateSection(section.id, { videoUrl: e.target.value })}
                  className="h-7 text-xs" />
              </div>

              {/* Bullet points */}
              {["bullet-points", "image-text"].includes(section.type) && (
                <div className="space-y-1">
                  <Label className="text-[10px]">বুলেট পয়েন্ট</Label>
                  {section.points.map((point, pi) => (
                    <div key={pi} className="flex gap-1">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...section.points];
                          newPoints[pi] = e.target.value;
                          updateSection(section.id, { points: newPoints });
                        }}
                        className="h-7 text-xs flex-1"
                        placeholder={`পয়েন্ট ${pi + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateSection(section.id, { points: section.points.filter((_, i) => i !== pi) })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => updateSection(section.id, { points: [...section.points, ""] })}
                  >
                    + পয়েন্ট যোগ করুন
                  </Button>
                </div>
              )}

              {/* Images (for image-text, image-grid, banner) */}
              {(

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px]">ইমেজ</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() => triggerUpload(section.id)}
                      disabled={uploading}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {uploading ? "..." : "আপলোড"}
                    </Button>
                  </div>
                  {section.images.length > 0 && (
                    <div className="grid grid-cols-6 gap-1">
                      {section.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt="" className="w-full aspect-square object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeImage(section.id, i)}
                            className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Image position (for image-text) */}
              {section.type === "image-text" && (
                <div>
                  <Label className="text-[10px]">ইমেজ পজিশন</Label>
                  <Select
                    value={section.styles.imagePosition}
                    onValueChange={(v) => updateSectionStyle(section.id, "imagePosition", v)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">উপরে</SelectItem>
                      <SelectItem value="bottom">নিচে</SelectItem>
                      <SelectItem value="left">বামে</SelectItem>
                      <SelectItem value="right">ডানে</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <CustomSectionElementsEditor section={section} onUpdate={updates => updateSection(section.id, updates)} />
              {/* CTA toggle + text */}
              {section.buttons === undefined && <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={section.styles.showCta}
                  onChange={(e) => updateSectionStyle(section.id, "showCta", e.target.checked)}
                  className="rounded"
                />
                <Label className="text-[10px]">CTA বাটন দেখান</Label>
              </div>
              {section.styles.showCta && (
                <Input
                  value={section.styles.ctaText}
                  onChange={(e) => updateSectionStyle(section.id, "ctaText", e.target.value)}
                  placeholder="বাটন টেক্সট"
                  className="h-7 text-xs"
                />
              )}
              </>}

              {/* Styles */}
              <div className="border-t pt-2">
                <Label className="text-[10px] font-medium text-muted-foreground">স্টাইল</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <Label className="text-[9px] text-muted-foreground">ব্যাকগ্রাউন্ড</Label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={section.styles.backgroundColor}
                        onChange={(e) => updateSectionStyle(section.id, "backgroundColor", e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer"
                      />
                      <Input value={section.styles.backgroundColor} onChange={(e) => updateSectionStyle(section.id, "backgroundColor", e.target.value)} className="h-6 text-[9px] flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] text-muted-foreground">টেক্সট</Label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={section.styles.textColor}
                        onChange={(e) => updateSectionStyle(section.id, "textColor", e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer"
                      />
                      <Input value={section.styles.textColor} onChange={(e) => updateSectionStyle(section.id, "textColor", e.target.value)} className="h-6 text-[9px] flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] text-muted-foreground">হেডিং</Label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={section.styles.headingColor}
                        onChange={(e) => updateSectionStyle(section.id, "headingColor", e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer"
                      />
                      <Input value={section.styles.headingColor} onChange={(e) => updateSectionStyle(section.id, "headingColor", e.target.value)} className="h-6 text-[9px] flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              </>}
            </div>
          )}
        </div>
      ))}

      {/* Add section buttons */}
      <div className="grid grid-cols-3 gap-1">
        {(Object.keys(sectionTypeLabels) as CustomSection["type"][]).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[10px] justify-start"
            onClick={() => addSection(type)}
          >
            <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{sectionTypeLabels[type]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CustomSectionEditor;
