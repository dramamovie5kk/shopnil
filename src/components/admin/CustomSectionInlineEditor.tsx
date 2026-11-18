import { useRef, useState } from "react";
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
import { Upload, X, Plus } from "lucide-react";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { CustomSection } from "./CustomSectionEditor";
import CustomSectionElementsEditor from './CustomSectionElementsEditor';
import CustomHtmlCodeEditor from './CustomHtmlCodeEditor';

interface CustomSectionInlineEditorProps {
  section: CustomSection;
  onUpdate: (updates: Partial<CustomSection>) => void;
  onUpdateStyle: (key: string, value: string | boolean) => void;
}

const CustomSectionInlineEditor = ({ section, onUpdate, onUpdateStyle }: CustomSectionInlineEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sales-pages/custom-sections/${fileName}`;
      const { error: uploadError } = await api.storage.from("products").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = api.storage.from("products").getPublicUrl(filePath);
      onUpdateStyle("backgroundImage", urlData.publicUrl);
      toast.success("ব্যাকগ্রাউন্ড ইমেজ আপলোড হয়েছে!");
    } catch {
      toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setBgUploading(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = "";
    }
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
      onUpdate({ images: [...section.images, ...uploadedUrls] });
      toast.success(`${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে!`);
    } catch {
      toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (section.type === 'html') return <div className="p-3 bg-muted/30"><CustomHtmlCodeEditor section={section} onUpdate={onUpdate} /></div>;

  const needsTitle = true;
  const needsContent = true;
  const needsPoints = ["bullet-points", "image-text"].includes(section.type);
  const needsImages = true;
  const needsVideo = true; // যেকোনো সেকশনে ভিডিও যোগ করা যাবে
  const needsFaq = section.type === "faq";
  const needsImagePosition = section.type === "image-text";
  const needsTestimonials = section.type === "testimonial";
  const needsPricing = section.type === "pricing";
  const needsCountdown = section.type === "countdown-timer";
  const needsFeatureIcons = section.type === "feature-icons";
  const needsComparison = section.type === "comparison";

  return (
    <div className="p-3 bg-muted/30 space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBgImageUpload}
      />

      <div>
        <Label htmlFor={`${section.id}-name`} className="text-[10px]">সেকশনের নাম</Label>
        <Input
          id={`${section.id}-name`}
          value={section.name ?? ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="যেমন: হিরো সেকশন, গ্যালারি সেকশন"
          className="h-7 text-xs"
        />
      </div>

      {/* Title / Heading */}
      {needsTitle && (
        <div>
          <Label className="text-[10px]">শিরোনাম / হেডিং</Label>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="সেকশনের শিরোনাম..."
            className="h-7 text-xs"
          />
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1">
              <Label className="text-[9px] text-muted-foreground">ফন্ট সাইজ: {section.styles.headingFontSize || '22'}px</Label>
              <input
                type="range" min="14" max="42"
                value={section.styles.headingFontSize || '22'}
                onChange={(e) => onUpdateStyle("headingFontSize", e.target.value)}
                className="w-full h-1.5 accent-primary"
              />
            </div>
            <div>
              <Label className="text-[9px] text-muted-foreground">অ্যালাইনমেন্ট</Label>
              <div className="flex gap-0.5 mt-0.5">
                {(["left", "center", "right"] as const).map(align => (
                  <button
                    key={align} type="button"
                    onClick={() => onUpdateStyle("headingAlignment", align)}
                    className={`px-2 py-0.5 text-[9px] rounded border ${
                      (section.styles.headingAlignment || 'center') === align
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 border-border'
                    }`}
                  >
                    {align === 'left' ? '◀' : align === 'center' ? '◆' : '▶'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[9px] text-muted-foreground">বোল্ড</Label>
              <div className="mt-0.5">
                <button type="button"
                  onClick={() => onUpdateStyle("headingBold", !(section.styles.headingBold !== false))}
                  className={`px-2 py-0.5 text-[9px] rounded border font-bold ${
                    section.styles.headingBold !== false
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 border-border'
                  }`}>B</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Font Size & Alignment */}
      {needsTitle && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-[9px] text-muted-foreground">কন্টেন্ট ফন্ট সাইজ: {section.styles.contentFontSize || '15'}px</Label>
            <input
              type="range" min="12" max="32"
              value={section.styles.contentFontSize || '15'}
              onChange={(e) => onUpdateStyle("contentFontSize", e.target.value)}
              className="w-full h-1.5 accent-primary"
            />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">কন্টেন্ট অ্যালাইন</Label>
            <div className="flex gap-0.5 mt-0.5">
              {(["left", "center", "right"] as const).map(align => (
                <button
                  key={align} type="button"
                  onClick={() => onUpdateStyle("contentAlignment", align)}
                  className={`px-2 py-0.5 text-[9px] rounded border ${
                    (section.styles.contentAlignment || 'left') === align
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 border-border'
                  }`}>
                  {align === 'left' ? '◀' : align === 'center' ? '◆' : '▶'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {needsContent && (
        <div>
          <Label className="text-[10px]">কন্টেন্ট</Label>
          <Textarea
            value={section.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="টেক্সট কন্টেন্ট লিখুন..."
            className="min-h-[60px] text-xs"
          />
        </div>
      )}

      <div>
        <Label htmlFor={`${section.id}-description`} className="text-[10px]">বর্ণনা / ডিসক্রিপশন</Label>
        <Textarea id={`${section.id}-description`} value={section.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="সেকশনের বিস্তারিত বর্ণনা..." className="min-h-[60px] text-xs" />
      </div>

      {/* Video URL (any section) */}
      {needsVideo && (
        <div>
          <Label className="text-[10px]">ভিডিও URL (ঐচ্ছিক — YouTube/Vimeo)</Label>
          <Input
            value={section.videoUrl || ""}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-7 text-xs"
          />
        </div>
      )}

      {/* FAQ Items */}
      {needsFaq && (
        <div className="space-y-2">
          <Label className="text-[10px]">FAQ আইটেমসমূহ</Label>
          {(section.faqItems || []).map((item, i) => (
            <div key={i} className="border rounded p-2 space-y-1 bg-background">
              <div className="flex gap-1">
                <Input
                  value={item.question}
                  onChange={(e) => {
                    const newItems = [...(section.faqItems || [])];
                    newItems[i] = { ...newItems[i], question: e.target.value };
                    onUpdate({ faqItems: newItems });
                  }}
                  className="h-7 text-xs flex-1"
                  placeholder={`প্রশ্ন ${i + 1}`}
                />
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => onUpdate({ faqItems: (section.faqItems || []).filter((_, idx) => idx !== i) })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Textarea
                value={item.answer}
                onChange={(e) => {
                  const newItems = [...(section.faqItems || [])];
                  newItems[i] = { ...newItems[i], answer: e.target.value };
                  onUpdate({ faqItems: newItems });
                }}
                className="min-h-[40px] text-xs"
                placeholder="উত্তর..."
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ faqItems: [...(section.faqItems || []), { question: "", answer: "" }] })}>
            <Plus className="h-3 w-3 mr-1" /> FAQ যোগ করুন
          </Button>
        </div>
      )}

      {/* Bullet points */}
      {needsPoints && (
        <div className="space-y-1">
          <Label className="text-[10px]">বুলেট পয়েন্ট</Label>
          {section.points.map((point, pi) => (
            <div key={pi} className="flex gap-1">
              <Input
                value={point}
                onChange={(e) => {
                  const newPoints = [...section.points];
                  newPoints[pi] = e.target.value;
                  onUpdate({ points: newPoints });
                }}
                className="h-7 text-xs flex-1"
                placeholder={`পয়েন্ট ${pi + 1}`}
              />
              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => onUpdate({ points: section.points.filter((_, i) => i !== pi) })}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ points: [...section.points, ""] })}>
            + পয়েন্ট যোগ করুন
          </Button>
        </div>
      )}

      {/* Images */}
      {needsImages && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-[10px]">সেকশনের ইমেজ ({section.images.length}টি)</Label>
            <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]"
              onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-3 w-3 mr-1" />
              {uploading ? "..." : "আপলোড"}
            </Button>
          </div>
          {section.images.length > 0 && (
            <div className="grid grid-cols-6 gap-1">
              {section.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full aspect-square object-cover rounded border" />
                  <button type="button"
                    onClick={() => onUpdate({ images: section.images.filter((_, idx) => idx !== i) })}
                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image position (for image-text) */}
      {needsImagePosition && (
        <div>
          <Label className="text-[10px]">ইমেজ পজিশন</Label>
          <Select value={section.styles.imagePosition} onValueChange={(v) => onUpdateStyle("imagePosition", v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">উপরে</SelectItem>
              <SelectItem value="bottom">নিচে</SelectItem>
              <SelectItem value="left">বামে</SelectItem>
              <SelectItem value="right">ডানে</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Divider info */}
      {section.type === 'divider' && (
        <div className="text-xs text-muted-foreground text-center py-2">
          এটি সেকশনের মাঝে একটি ডিভাইডার লাইন দেখাবে
        </div>
      )}

      {/* Testimonials */}
      {needsTestimonials && (
        <div className="space-y-2">
          <Label className="text-[10px]">টেস্টিমোনিয়াল</Label>
          {(section.testimonials || []).map((t, i) => (
            <div key={i} className="border rounded p-2 space-y-1 bg-background">
              <div className="flex gap-1">
                <Input value={t.name}
                  onChange={(e) => {
                    const newT = [...(section.testimonials || [])];
                    newT[i] = { ...newT[i], name: e.target.value };
                    onUpdate({ testimonials: newT });
                  }}
                  className="h-7 text-xs flex-1" placeholder="গ্রাহকের নাম" />
                <Select value={String(t.rating)} onValueChange={(v) => {
                  const newT = [...(section.testimonials || [])];
                  newT[i] = { ...newT[i], rating: Number(v) };
                  onUpdate({ testimonials: newT });
                }}>
                  <SelectTrigger className="h-7 text-xs w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{'⭐'.repeat(r)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => onUpdate({ testimonials: (section.testimonials || []).filter((_, idx) => idx !== i) })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Textarea value={t.text}
                onChange={(e) => {
                  const newT = [...(section.testimonials || [])];
                  newT[i] = { ...newT[i], text: e.target.value };
                  onUpdate({ testimonials: newT });
                }}
                className="min-h-[40px] text-xs" placeholder="রিভিউ টেক্সট..." />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ testimonials: [...(section.testimonials || []), { name: "", text: "", rating: 5 }] })}>
            <Plus className="h-3 w-3 mr-1" /> টেস্টিমোনিয়াল যোগ করুন
          </Button>
        </div>
      )}

      {/* Pricing */}
      {needsPricing && (
        <div className="space-y-2">
          <Label className="text-[10px]">প্রাইসিং তথ্য</Label>
          <div className="grid grid-cols-2 gap-1">
            <Input value={section.pricingData?.offerPrice || ""} onChange={(e) => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), offerPrice: e.target.value } })} className="h-7 text-xs" placeholder="অফার মূল্য" />
            <Input value={section.pricingData?.originalPrice || ""} onChange={(e) => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), originalPrice: e.target.value } })} className="h-7 text-xs" placeholder="আসল মূল্য" />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <Input value={section.pricingData?.badgeText || "অফার"} onChange={(e) => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), badgeText: e.target.value } })} className="h-7 text-xs" placeholder="ব্যাজ টেক্সট" />
            <Input value={section.pricingData?.unit || "৳"} onChange={(e) => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), unit: e.target.value } })} className="h-7 text-xs" placeholder="মুদ্রা (৳)" />
          </div>
          <Label className="text-[10px]">সুবিধা তালিকা</Label>
          {(section.pricingData?.features || []).map((f, i) => (
            <div key={i} className="flex gap-1">
              <Input value={f} onChange={(e) => {
                const newF = [...(section.pricingData?.features || [])];
                newF[i] = e.target.value;
                onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), features: newF } });
              }} className="h-7 text-xs flex-1" placeholder={`সুবিধা ${i + 1}`} />
              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={() => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), features: (section.pricingData?.features || []).filter((_, idx) => idx !== i) } })}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ pricingData: { ...(section.pricingData || { originalPrice: "", offerPrice: "", badgeText: "অফার", unit: "৳", features: [] }), features: [...(section.pricingData?.features || []), ""] } })}>
            + সুবিধা যোগ করুন
          </Button>
        </div>
      )}

      {/* Countdown Timer */}
      {needsCountdown && (
        <div>
          <Label className="text-[10px]">কাউন্টডাউন শেষ তারিখ ও সময়</Label>
          <Input type="datetime-local" value={section.countdownEndDate || ""}
            onChange={(e) => onUpdate({ countdownEndDate: e.target.value })}
            className="h-7 text-xs" />
        </div>
      )}

      {/* Feature Icons */}
      {needsFeatureIcons && (
        <div className="space-y-2">
          <Label className="text-[10px]">ফিচার আইটেম</Label>
          {(section.featureItems || []).map((item, i) => (
            <div key={i} className="border rounded p-2 space-y-1 bg-background">
              <div className="flex gap-1">
                <Input value={item.icon} onChange={(e) => {
                  const newItems = [...(section.featureItems || [])];
                  newItems[i] = { ...newItems[i], icon: e.target.value };
                  onUpdate({ featureItems: newItems });
                }} className="h-7 text-xs w-14" placeholder="🎯" />
                <Input value={item.title} onChange={(e) => {
                  const newItems = [...(section.featureItems || [])];
                  newItems[i] = { ...newItems[i], title: e.target.value };
                  onUpdate({ featureItems: newItems });
                }} className="h-7 text-xs flex-1" placeholder="শিরোনাম" />
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => onUpdate({ featureItems: (section.featureItems || []).filter((_, idx) => idx !== i) })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input value={item.description} onChange={(e) => {
                const newItems = [...(section.featureItems || [])];
                newItems[i] = { ...newItems[i], description: e.target.value };
                onUpdate({ featureItems: newItems });
              }} className="h-7 text-xs" placeholder="বর্ণনা (ঐচ্ছিক)" />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ featureItems: [...(section.featureItems || []), { icon: "✅", title: "", description: "" }] })}>
            <Plus className="h-3 w-3 mr-1" /> ফিচার যোগ করুন
          </Button>
        </div>
      )}

      {/* Comparison */}
      {needsComparison && (
        <div className="space-y-2">
          <Label className="text-[10px]">তুলনা আইটেম</Label>
          {(section.comparisonItems || []).map((item, i) => (
            <div key={i} className="border rounded p-2 bg-background">
              <div className="flex gap-1">
                <Input value={item.label} onChange={(e) => {
                  const newItems = [...(section.comparisonItems || [])];
                  newItems[i] = { ...newItems[i], label: e.target.value };
                  onUpdate({ comparisonItems: newItems });
                }} className="h-7 text-xs flex-1" placeholder="বিষয়" />
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => onUpdate({ comparisonItems: (section.comparisonItems || []).filter((_, idx) => idx !== i) })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <Input value={item.before} onChange={(e) => {
                  const newItems = [...(section.comparisonItems || [])];
                  newItems[i] = { ...newItems[i], before: e.target.value };
                  onUpdate({ comparisonItems: newItems });
                }} className="h-7 text-xs" placeholder="❌ আগে / ছাড়া" />
                <Input value={item.after} onChange={(e) => {
                  const newItems = [...(section.comparisonItems || [])];
                  newItems[i] = { ...newItems[i], after: e.target.value };
                  onUpdate({ comparisonItems: newItems });
                }} className="h-7 text-xs" placeholder="✅ পরে / সাথে" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-full h-6 text-[10px]"
            onClick={() => onUpdate({ comparisonItems: [...(section.comparisonItems || []), { label: "", before: "", after: "" }] })}>
            <Plus className="h-3 w-3 mr-1" /> তুলনা যোগ করুন
          </Button>
        </div>
      )}

      <CustomSectionElementsEditor section={section} onUpdate={onUpdate} />
      {/* Legacy CTA controls remain available until buttons are customized. */}
      {needsTitle && section.buttons === undefined && (
        <>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={section.styles.showCta}
              onChange={(e) => onUpdateStyle("showCta", e.target.checked)} className="rounded" />
            <Label className="text-[10px]">CTA বাটন দেখান</Label>
          </div>
          {section.styles.showCta && (
            <>
              <Input value={section.styles.ctaText}
                onChange={(e) => onUpdateStyle("ctaText", e.target.value)}
                placeholder="বাটন টেক্সট" className="h-7 text-xs" />
              <Input value={section.styles.ctaLink || ""}
                onChange={(e) => onUpdateStyle("ctaLink", e.target.value)}
                placeholder="বাটন লিংক (ঐচ্ছিক — খালি রাখলে অর্ডার ফর্মে যাবে)" className="h-7 text-xs" />
            </>
          )}
        </>
      )}

      {/* Styles */}
      <div className="border-t pt-2">
        <Label className="text-[10px] font-medium text-muted-foreground">🎨 স্টাইল</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div>
            <Label className="text-[9px] text-muted-foreground">ব্যাকগ্রাউন্ড</Label>
            <div className="flex gap-1">
              <input type="color" value={section.styles.backgroundColor}
                onChange={(e) => onUpdateStyle("backgroundColor", e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer" />
              <Input value={section.styles.backgroundColor} onChange={(e) => onUpdateStyle("backgroundColor", e.target.value)} className="h-6 text-[9px] flex-1" />
            </div>
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">টেক্সট</Label>
            <div className="flex gap-1">
              <input type="color" value={section.styles.textColor}
                onChange={(e) => onUpdateStyle("textColor", e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer" />
              <Input value={section.styles.textColor} onChange={(e) => onUpdateStyle("textColor", e.target.value)} className="h-6 text-[9px] flex-1" />
            </div>
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">হেডিং</Label>
            <div className="flex gap-1">
              <input type="color" value={section.styles.headingColor}
                onChange={(e) => onUpdateStyle("headingColor", e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer" />
              <Input value={section.styles.headingColor} onChange={(e) => onUpdateStyle("headingColor", e.target.value)} className="h-6 text-[9px] flex-1" />
            </div>
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">বর্ডার কালার</Label>
            <div className="flex gap-1">
              <input type="color" value={section.styles.borderColor || '#000000'}
                onChange={(e) => onUpdateStyle("borderColor", e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer" />
              <Input value={section.styles.borderColor || '#00000000'} onChange={(e) => onUpdateStyle("borderColor", e.target.value)} className="h-6 text-[9px] flex-1" />
            </div>
          </div>
          {section.styles.showCta && (
            <>
              <div>
                <Label className="text-[9px] text-muted-foreground">CTA ব্যাকগ্রাউন্ড</Label>
                <div className="flex gap-1">
                  <input type="color" value={section.styles.ctaBgColor}
                    onChange={(e) => onUpdateStyle("ctaBgColor", e.target.value)}
                    className="w-6 h-6 rounded border cursor-pointer" />
                  <Input value={section.styles.ctaBgColor} onChange={(e) => onUpdateStyle("ctaBgColor", e.target.value)} className="h-6 text-[9px] flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-[9px] text-muted-foreground">CTA টেক্সট</Label>
                <div className="flex gap-1">
                  <input type="color" value={section.styles.ctaTextColor}
                    onChange={(e) => onUpdateStyle("ctaTextColor", e.target.value)}
                    className="w-6 h-6 rounded border cursor-pointer" />
                  <Input value={section.styles.ctaTextColor} onChange={(e) => onUpdateStyle("ctaTextColor", e.target.value)} className="h-6 text-[9px] flex-1" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
          <div>
            <Label className="text-[9px] text-muted-foreground">প্যাডিং: {section.styles.padding || '24'}px</Label>
            <input type="range" min="0" max="60"
              value={section.styles.padding || '24'}
              onChange={(e) => onUpdateStyle("padding", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">বর্ডার রেডিয়াস: {section.styles.borderRadius}px</Label>
            <input type="range" min="0" max="60"
              value={section.styles.borderRadius}
              onChange={(e) => onUpdateStyle("borderRadius", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">বর্ডার উইথ: {section.styles.borderWidth || '0'}px</Label>
            <input type="range" min="0" max="8"
              value={section.styles.borderWidth || '0'}
              onChange={(e) => onUpdateStyle("borderWidth", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          {needsImages && (
            <div>
              <Label className="text-[9px] text-muted-foreground">ইমেজ রেডিয়াস: {section.styles.imageBorderRadius || '8'}px</Label>
              <input type="range" min="0" max="30"
                value={section.styles.imageBorderRadius || '8'}
                onChange={(e) => onUpdateStyle("imageBorderRadius", e.target.value)}
                className="w-full h-1.5 accent-primary" />
            </div>
          )}
          {section.styles.showCta && (
            <div>
              <Label className="text-[9px] text-muted-foreground">CTA রেডিয়াস: {section.styles.ctaBorderRadius || '50'}px</Label>
              <input type="range" min="0" max="50"
                value={section.styles.ctaBorderRadius || '50'}
                onChange={(e) => onUpdateStyle("ctaBorderRadius", e.target.value)}
                className="w-full h-1.5 accent-primary" />
            </div>
          )}
        </div>

        {/* Shadow */}
        <div className="mt-2">
          <Label className="text-[9px] text-muted-foreground">শ্যাডো</Label>
          <div className="flex gap-0.5 mt-0.5">
            {(["none", "sm", "md", "lg"] as const).map(sh => (
              <button key={sh} type="button"
                onClick={() => onUpdateStyle("shadow", sh)}
                className={`px-2 py-0.5 text-[9px] rounded border ${
                  (section.styles.shadow || 'none') === sh
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/40 border-border'
                }`}>
                {sh === 'none' ? 'নেই' : sh.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Layout: width, side margin, transparency */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 border-t pt-2">
          <div>
            <Label className="text-[9px] text-muted-foreground">সেকশন উইথ: {section.styles.sectionWidth || '100'}%</Label>
            <input type="range" min="50" max="100"
              value={section.styles.sectionWidth || '100'}
              onChange={(e) => onUpdateStyle("sectionWidth", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">সাইড মার্জিন: {section.styles.marginX || '0'}px</Label>
            <input type="range" min="0" max="40"
              value={section.styles.marginX || '0'}
              onChange={(e) => onUpdateStyle("marginX", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">ব্যাকগ্রাউন্ড স্বচ্ছতা: {section.styles.backgroundOpacity || '100'}%</Label>
            <input type="range" min="0" max="100"
              value={section.styles.backgroundOpacity || '100'}
              onChange={(e) => onUpdateStyle("backgroundOpacity", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">উপরের মার্জিন: {section.styles.marginTop || '0'}px</Label>
            <input type="range" min="-20" max="80"
              value={section.styles.marginTop || '0'}
              onChange={(e) => onUpdateStyle("marginTop", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">নিচের মার্জিন (গ্যাপ): {section.styles.marginBottom || '0'}px</Label>
            <input type="range" min="-20" max="80"
              value={section.styles.marginBottom || '0'}
              onChange={(e) => onUpdateStyle("marginBottom", e.target.value)}
              className="w-full h-1.5 accent-primary" />
          </div>
        </div>

        {/* Per-corner radius (empty = uses main border radius) */}
        <div className="mt-2 border-t pt-2">
          <Label className="text-[9px] text-muted-foreground">কোনা আলাদা রেডিয়াস (খালি রাখলে মূল বর্ডার রেডিয়াস)</Label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
            {([
              ["radiusTL", "উপরে বাম"], ["radiusTR", "উপরে ডান"],
              ["radiusBL", "নিচে বাম"], ["radiusBR", "নিচে ডান"],
            ] as const).map(([k, label]) => {
              const v = (section.styles as any)[k] ?? '';
              return (
                <div key={k}>
                  <Label className="text-[9px] text-muted-foreground">{label}: {v === '' ? `${section.styles.borderRadius}px (মূল)` : `${v}px`}</Label>
                  <div className="flex items-center gap-1">
                    <input type="range" min="0" max="60"
                      value={v === '' ? section.styles.borderRadius : v}
                      onChange={(e) => onUpdateStyle(k, e.target.value)}
                      className="w-full h-1.5 accent-primary" />
                    {v !== '' && (
                      <button type="button" onClick={() => onUpdateStyle(k, '')} className="text-[9px] text-muted-foreground underline">রিসেট</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Background image */}
        <div className="mt-2">
          <Label className="text-[9px] text-muted-foreground">ব্যাকগ্রাউন্ড ইমেজ (ঐচ্ছিক)</Label>
          <div className="flex gap-1 mt-0.5">
            <Input value={section.styles.backgroundImage || ""}
              onChange={(e) => onUpdateStyle("backgroundImage", e.target.value)}
              placeholder="ইমেজ URL..." className="h-6 text-[9px] flex-1" />
            <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] px-2"
              onClick={() => bgFileInputRef.current?.click()} disabled={bgUploading}>
              <Upload className="h-3 w-3" />
            </Button>
            {section.styles.backgroundImage && (
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0"
                onClick={() => onUpdateStyle("backgroundImage", "")}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSectionInlineEditor;
