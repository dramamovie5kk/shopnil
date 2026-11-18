import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesPage } from "@/types/salesPage";
import { useCreateSalesPage, useUpdateSalesPage } from "@/hooks/useSalesPages";
import { useProducts } from "@/hooks/useProducts";
import { api } from "@/integrations/cloudflare/client";
import { X, Plus, Upload, Image as ImageIcon, Palette } from "lucide-react";
import { toast } from "sonner";
import TemplateGallery from "./TemplateGallery";
import { salesPageTemplates, SalesPageTemplate, getTemplate } from "@/lib/salesPageTemplates";

interface SalesPageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesPage: SalesPage | null;
}

const defaultFormData = {
  slug: "",
  title: "",
  is_active: true,
  product_id: "",
  template_id: "elegant-dark",
  // Section toggles
  show_hero_section: true,
  show_countdown: true,
  show_gallery_section: true,
  show_features_section: true,
  show_reviews_section: true,
  show_contact_section: true,
  show_checkout_section: true,
  // Section variants
  hero_variant: "01",
  gallery_variant: "01",
  feature_variant: "01",
  review_variant: "01",
  contact_variant: "01",
  // Hero
  hero_badge_text: "🔥স্টক ক্লিয়ারেন্স সেল লাইভ🔥",
  hero_headline: "",
  hero_subheadline: "",
  hero_images: [] as string[],
  hero_video_url: "",
  // Countdown
  countdown_end_date: "",
  countdown_label_days: "দিন",
  countdown_label_hours: "ঘন্টা",
  countdown_label_minutes: "মিনিট",
  countdown_label_seconds: "সেকেন্ড",
  // Pricing
  offer_price: 0,
  original_price: 0,
  discount_text: "২৯% ছাড়",
  price_unit: "৳",
  offer_details: "",
  // Features
  features_headline: "কি কি থাকছে?",
  features_subheadline: "আমাদের বিশেষত্ব ও গ্যারান্টি",
  feature_1_text: "১০০% রঙ গ্যারান্টি",
  feature_1_icon: "🎨",
  feature_1_description: "ইন্ডিয়ান কোয়েড প্রিন্ট",
  feature_2_text: "কোয়েল কাজ",
  feature_2_icon: "✨",
  feature_2_description: "রঙ, ছাতা ও টেনাই কাজ",
  feature_3_text: "সঠিক চেলা",
  feature_3_icon: "👗",
  feature_3_description: "স্ট্যান্ডার্ড মাপের চেলা",
  feature_4_text: "সেম টু সেম",
  feature_4_icon: "✅",
  feature_4_description: "যেমন দেখছেন তেমনই পাবেন",
  feature_5_text: "ক্যাশ অন ডেলিভারি",
  feature_5_icon: "💵",
  feature_5_description: "পণ্য হাতে পেয়ে টাকা দিন",
  feature_6_text: "ফ্রি ডেলিভারি",
  feature_6_icon: "🚚",
  feature_6_description: "সারা দেশ ফ্রি ডেলিভারি",
  feature_card_bg_color: "#1a3a2f",
  feature_icon_bg_color: "#f59e0b",
  // Gallery
  gallery_title: "আমাদের কালেকশন",
  gallery_subtitle: "যেমন দেখছেন, তেমনই পাবেন",
  gallery_images: [] as string[],
  // Reviews
  reviews_headline: "কাস্টমার ফিডব্যাক",
  reviews_subheadline: "আমাদের সন্তুষ্ট গ্রাহকদের মতামত",
  review_images: [] as string[],
  // Contact
  contact_headline: "যেকোনো প্রয়োজনে বা সরাসরি",
  contact_subheadline: "ফোনে অর্ডার করতে কল করুন",
  contact_phone: "01832-677000",
  contact_phone_link: "tel:01832677000",
  contact_whatsapp: "01832677000",
  contact_whatsapp_text: "হোয়াটসঅ্যাপ মেসেজ",
  contact_availability: "AVAILABLE 24/7 FOR YOU",
  // CTA
  cta_button_text: "এখনই অর্ডার করুন",
  cta_urgency_text: "⚡ সীমিত স্টক! মিস করবেন না",
  // Style
  primary_color: "#0f4c3a",
  background_color: "#0a2922",
  text_color: "#ffffff",
  accent_color: "#4ade80",
};

const SalesPageEditorDialog = ({
  open,
  onOpenChange,
  salesPage,
}: SalesPageEditorDialogProps) => {
  const createMutation = useCreateSalesPage();
  const updateMutation = useUpdateSalesPage();
  const { data: products } = useProducts();
  const [formData, setFormData] = useState(defaultFormData);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"hero" | "gallery" | "review">("hero");
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);

  useEffect(() => {
    if (salesPage) {
      setFormData({
        slug: salesPage.slug,
        title: salesPage.title,
        is_active: salesPage.is_active,
        product_id: salesPage.product_id || "",
        template_id: salesPage.template_id || "elegant-dark",
        show_hero_section: salesPage.show_hero_section ?? true,
        show_countdown: salesPage.show_countdown ?? true,
        show_gallery_section: salesPage.show_gallery_section ?? true,
        show_features_section: salesPage.show_features_section ?? true,
        show_reviews_section: salesPage.show_reviews_section ?? true,
        show_contact_section: salesPage.show_contact_section ?? true,
        show_checkout_section: salesPage.show_checkout_section ?? true,
        hero_variant: salesPage.hero_variant || "01",
        gallery_variant: salesPage.gallery_variant || "01",
        feature_variant: salesPage.feature_variant || "01",
        review_variant: salesPage.review_variant || "01",
        contact_variant: salesPage.contact_variant || "01",
        hero_badge_text: salesPage.hero_badge_text,
        hero_headline: salesPage.hero_headline,
        hero_subheadline: salesPage.hero_subheadline || "",
        hero_images: salesPage.hero_images || [],
        hero_video_url: salesPage.hero_video_url || "",
        countdown_end_date: salesPage.countdown_end_date || "",
        countdown_label_days: salesPage.countdown_label_days || "দিন",
        countdown_label_hours: salesPage.countdown_label_hours || "ঘন্টা",
        countdown_label_minutes: salesPage.countdown_label_minutes || "মিনিট",
        countdown_label_seconds: salesPage.countdown_label_seconds || "সেকেন্ড",
        offer_price: salesPage.offer_price,
        original_price: salesPage.original_price || 0,
        discount_text: salesPage.discount_text,
        price_unit: salesPage.price_unit,
        offer_details: salesPage.offer_details || "",
        features_headline: salesPage.features_headline || "কি কি থাকছে?",
        features_subheadline: salesPage.features_subheadline || "আমাদের বিশেষত্ব ও গ্যারান্টি",
        feature_1_text: salesPage.feature_1_text,
        feature_1_icon: salesPage.feature_1_icon,
        feature_1_description: salesPage.feature_1_description || "",
        feature_2_text: salesPage.feature_2_text,
        feature_2_icon: salesPage.feature_2_icon,
        feature_2_description: salesPage.feature_2_description || "",
        feature_3_text: salesPage.feature_3_text,
        feature_3_icon: salesPage.feature_3_icon,
        feature_3_description: salesPage.feature_3_description || "",
        feature_4_text: salesPage.feature_4_text || "",
        feature_4_icon: salesPage.feature_4_icon || "🎨",
        feature_4_description: salesPage.feature_4_description || "",
        feature_5_text: salesPage.feature_5_text || "",
        feature_5_icon: salesPage.feature_5_icon || "👗",
        feature_5_description: salesPage.feature_5_description || "",
        feature_6_text: salesPage.feature_6_text || "",
        feature_6_icon: salesPage.feature_6_icon || "✅",
        feature_6_description: salesPage.feature_6_description || "",
        feature_card_bg_color: salesPage.feature_card_bg_color || "#1a3a2f",
        feature_icon_bg_color: salesPage.feature_icon_bg_color || "#f59e0b",
        gallery_title: salesPage.gallery_title,
        gallery_subtitle: salesPage.gallery_subtitle,
        gallery_images: salesPage.gallery_images || [],
        reviews_headline: salesPage.reviews_headline || "কাস্টমার ফিডব্যাক",
        reviews_subheadline: salesPage.reviews_subheadline || "",
        review_images: salesPage.review_images || [],
        contact_headline: salesPage.contact_headline || "",
        contact_subheadline: salesPage.contact_subheadline || "",
        contact_phone: salesPage.contact_phone || "",
        contact_phone_link: salesPage.contact_phone_link || "",
        contact_whatsapp: salesPage.contact_whatsapp || "",
        contact_whatsapp_text: salesPage.contact_whatsapp_text || "",
        contact_availability: salesPage.contact_availability || "",
        cta_button_text: salesPage.cta_button_text,
        cta_urgency_text: salesPage.cta_urgency_text,
        primary_color: salesPage.primary_color,
        background_color: salesPage.background_color,
        text_color: salesPage.text_color,
        accent_color: salesPage.accent_color,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [salesPage, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `sales-pages/${formData.slug || "temp"}/${fileName}`;

        const { error: uploadError } = await api.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = api.storage.from("products").getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }

      setFormData((prev) => {
        const key = uploadTarget === "hero" ? "hero_images" 
          : uploadTarget === "gallery" ? "gallery_images" 
          : "review_images";
        return { ...prev, [key]: [...prev[key], ...uploadedUrls] };
      });

      toast.success(`${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (target: "hero" | "gallery" | "review", index: number) => {
    const key = target === "hero" ? "hero_images" 
      : target === "gallery" ? "gallery_images" 
      : "review_images";
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      product_id: formData.product_id || null,
      original_price: formData.original_price || null,
      hero_subheadline: formData.hero_subheadline || null,
      hero_video_url: formData.hero_video_url || null,
      offer_details: formData.offer_details || null,
      countdown_end_date: formData.countdown_end_date || null,
    };

    if (salesPage) {
      updateMutation.mutate(
        { id: salesPage.id, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const triggerUpload = (target: "hero" | "gallery" | "review") => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleTemplateSelect = (template: SalesPageTemplate) => {
    setFormData((prev) => ({
      ...prev,
      template_id: template.id,
      primary_color: template.primary_color,
      accent_color: template.accent_color,
      background_color: template.background_color,
      text_color: template.text_color,
      feature_card_bg_color: template.feature_card_bg_color,
      feature_icon_bg_color: template.feature_icon_bg_color,
    }));
    toast.success(`"${template.name}" টেমপ্লেট প্রয়োগ করা হয়েছে!`);
  };

  const currentTemplate = getTemplate(formData.template_id);

  const ImageGrid = ({ 
    images, 
    target, 
    title 
  }: { 
    images: string[]; 
    target: "hero" | "gallery" | "review"; 
    title: string;
  }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>{title}</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => triggerUpload(target)}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "আপলোড হচ্ছে..." : "আপলোড"}
        </Button>
      </div>
      {images.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`${title} ${i + 1}`}
                className="w-full aspect-square object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(target, i)}
                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">ইমেজ আপলোড করুন</p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {salesPage ? "সেলস পেজ এডিট করুন" : "নতুন সেলস পেজ তৈরি করুন"}
          </DialogTitle>
        </DialogHeader>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-7 text-xs">
              <TabsTrigger value="basic">বেসিক</TabsTrigger>
              <TabsTrigger value="hero">হিরো</TabsTrigger>
              <TabsTrigger value="gallery">গ্যালারি</TabsTrigger>
              <TabsTrigger value="features">ফিচার</TabsTrigger>
              <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
              <TabsTrigger value="contact">কন্টাক্ট</TabsTrigger>
              <TabsTrigger value="style">স্টাইল</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">পেজ শিরোনাম *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: স্পেশাল থ্রি-পিস অফার"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">স্লাগ (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))}
                    placeholder="offer-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL হবে: /lp/{formData.slug || "your-slug"}
                  </p>
                </div>
              </div>

              {/* Template Selector */}
              <div className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">টেমপ্লেট স্টাইল</Label>
                    <p className="text-sm text-muted-foreground">
                      বর্তমান: <span className="font-medium text-foreground">{currentTemplate.name}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTemplateGalleryOpen(true)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    টেমপ্লেট বদলান
                  </Button>
                </div>
                
                {/* Mini Preview */}
                <div 
                  className="h-16 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentTemplate.primary_color}, ${currentTemplate.accent_color})` 
                  }}
                >
                  {currentTemplate.name} প্রিভিউ
                </div>
              </div>

              <div>
                <Label htmlFor="product">লিংকড প্রোডাক্ট</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, product_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="প্রোডাক্ট নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name_bn} - ৳{product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offer_price">অফার প্রাইস *</Label>
                  <Input
                    id="offer_price"
                    type="number"
                    value={formData.offer_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, offer_price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">আসল প্রাইস</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, original_price: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="offer_details">অফার ডিটেইলস</Label>
                <Input
                  id="offer_details"
                  value={formData.offer_details}
                  onChange={(e) => setFormData((prev) => ({ ...prev, offer_details: e.target.value }))}
                  placeholder="৫ সেট প্রিমিয়াম থ্রি-পিস"
                />
              </div>

              {/* Section Toggles */}
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-base font-semibold">সেকশন দেখান/লুকান</Label>
                {[
                  { key: "show_hero_section", label: "হিরো সেকশন" },
                  { key: "show_countdown", label: "কাউন্টডাউন টাইমার" },
                  { key: "show_gallery_section", label: "গ্যালারি সেকশন" },
                  { key: "show_features_section", label: "ফিচার সেকশন" },
                  { key: "show_reviews_section", label: "রিভিউ সেকশন" },
                  { key: "show_contact_section", label: "কন্টাক্ট সেকশন" },
                  { key: "show_checkout_section", label: "চেকআউট সেকশন" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <Switch
                      id={item.key}
                      checked={(formData as any)[item.key]}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, [item.key]: checked }))}
                    />
                  </div>
                ))}
              </div>

              {/* Section Variants */}
              <div className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <Label className="text-base font-semibold">সেকশন ভ্যারিয়েন্ট সিলেক্ট করুন</Label>
                <p className="text-xs text-muted-foreground mb-3">প্রতিটি সেকশনের জন্য আলাদা স্টাইল বেছে নিন</p>
                
                {[
                  { key: "hero_variant", label: "হিরো সেকশন", options: [
                    { value: "01", label: "০১: টাইটেল + ইমেজ + চেকলিস্ট" },
                    { value: "02", label: "০২: কাউন্টডাউন + প্রাইস" },
                    { value: "03", label: "০৩: ৪টা ইমেজ গ্রিড + বাটন" },
                    { value: "04", label: "০৪: শুধু ইমেজ (বাটন নিচে)" },
                    { value: "05", label: "০৫: সিম্পল প্রাইস + ফোন" },
                  ]},
                  { key: "gallery_variant", label: "গ্যালারি সেকশন", options: [
                    { value: "01", label: "গ্রিড লেআউট" },
                    { value: "02", label: "স্লাইডার লেআউট" },
                    { value: "03", label: "ক্যারোসেল লেআউট" },
                  ]},
                  { key: "feature_variant", label: "ফিচার সেকশন", options: [
                    { value: "01", label: "চেকলিস্ট স্টাইল" },
                    { value: "02", label: "কার্ড স্টাইল" },
                    { value: "03", label: "আইকন স্টাইল" },
                  ]},
                  { key: "review_variant", label: "রিভিউ সেকশন", options: [
                    { value: "01", label: "গ্রিড লেআউট" },
                    { value: "02", label: "ক্যারোসেল লেআউট" },
                    { value: "03", label: "মেসোনারি লেআউট" },
                  ]},
                  { key: "contact_variant", label: "কন্টাক্ট সেকশন", options: [
                    { value: "01", label: "স্ট্যান্ডার্ড লেআউট" },
                    { value: "02", label: "কমপ্যাক্ট কার্ড" },
                    { value: "03", label: "মিনিমাল আইকন" },
                  ]},
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <Label htmlFor={item.key} className="min-w-[100px]">{item.label}</Label>
                    <Select
                      value={(formData as any)[item.key]}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, [item.key]: value }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {item.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">সক্রিয় (পাবলিক ভিজিবল)</Label>
              </div>
            </TabsContent>

            {/* Hero Section */}
            <TabsContent value="hero" className="space-y-4 mt-4">
              <div>
                <Label>ব্যাজ টেক্সট</Label>
                <Input
                  value={formData.hero_badge_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hero_badge_text: e.target.value }))}
                  placeholder="🔥স্টক ক্লিয়ারেন্স সেল লাইভ🔥"
                />
              </div>

              <div>
                <Label>হেডলাইন *</Label>
                <Textarea
                  value={formData.hero_headline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hero_headline: e.target.value }))}
                  placeholder="মাত্র ২০০০ টাকায় ৫ সেট থ্রি-পিস"
                />
              </div>

              <div>
                <Label>সাব-হেডলাইন</Label>
                <Input
                  value={formData.hero_subheadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hero_subheadline: e.target.value }))}
                />
              </div>

              {/* Countdown Settings */}
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-base font-semibold">কাউন্টডাউন সেটিংস</Label>
                <div>
                  <Label>অফার শেষের তারিখ ও সময়</Label>
                  <Input
                    type="datetime-local"
                    value={formData.countdown_end_date ? formData.countdown_end_date.slice(0, 16) : ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, countdown_end_date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "countdown_label_days", label: "দিন লেবেল" },
                    { key: "countdown_label_hours", label: "ঘন্টা লেবেল" },
                    { key: "countdown_label_minutes", label: "মিনিট লেবেল" },
                    { key: "countdown_label_seconds", label: "সেকেন্ড লেবেল" },
                  ].map((item) => (
                    <div key={item.key}>
                      <Label className="text-xs">{item.label}</Label>
                      <Input
                        value={(formData as any)[item.key]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [item.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>CTA বাটন টেক্সট</Label>
                <Input
                  value={formData.cta_button_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cta_button_text: e.target.value }))}
                />
              </div>

              <div>
                <Label>আর্জেন্সি টেক্সট</Label>
                <Input
                  value={formData.cta_urgency_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cta_urgency_text: e.target.value }))}
                />
              </div>

              <div>
                <Label>ভিডিও URL (YouTube)</Label>
                <Input
                  value={formData.hero_video_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hero_video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <ImageGrid images={formData.hero_images} target="hero" title="হিরো ইমেজ" />
            </TabsContent>

            {/* Gallery Section */}
            <TabsContent value="gallery" className="space-y-4 mt-4">
              <div>
                <Label>গ্যালারি শিরোনাম</Label>
                <Input
                  value={formData.gallery_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gallery_title: e.target.value }))}
                />
              </div>

              <div>
                <Label>গ্যালারি সাব-শিরোনাম</Label>
                <Input
                  value={formData.gallery_subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gallery_subtitle: e.target.value }))}
                />
              </div>

              <ImageGrid images={formData.gallery_images} target="gallery" title="গ্যালারি ইমেজ" />
            </TabsContent>

            {/* Features Section */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ফিচার হেডলাইন</Label>
                  <Input
                    value={formData.features_headline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, features_headline: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>ফিচার সাব-হেডলাইন</Label>
                  <Input
                    value={formData.features_subheadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, features_subheadline: e.target.value }))}
                  />
                </div>
              </div>

              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="border rounded-lg p-3 space-y-2">
                  <Label className="font-semibold">ফিচার {num}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">আইকন</Label>
                      <Input
                        value={(formData as any)[`feature_${num}_icon`]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [`feature_${num}_icon`]: e.target.value }))}
                        className="text-center text-lg"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">শিরোনাম</Label>
                      <Input
                        value={(formData as any)[`feature_${num}_text`]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [`feature_${num}_text`]: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">বিবরণ</Label>
                      <Input
                        value={(formData as any)[`feature_${num}_description`]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [`feature_${num}_description`]: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>কার্ড ব্যাকগ্রাউন্ড</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.feature_card_bg_color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feature_card_bg_color: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.feature_card_bg_color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feature_card_bg_color: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>আইকন ব্যাকগ্রাউন্ড</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.feature_icon_bg_color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feature_icon_bg_color: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.feature_icon_bg_color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feature_icon_bg_color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Section */}
            <TabsContent value="reviews" className="space-y-4 mt-4">
              <div>
                <Label>রিভিউ হেডলাইন</Label>
                <Input
                  value={formData.reviews_headline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reviews_headline: e.target.value }))}
                />
              </div>

              <div>
                <Label>রিভিউ সাব-হেডলাইন</Label>
                <Input
                  value={formData.reviews_subheadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reviews_subheadline: e.target.value }))}
                />
              </div>

              <ImageGrid images={formData.review_images} target="review" title="রিভিউ ইমেজ (হরিজেন্টাল স্ক্রল)" />
            </TabsContent>

            {/* Contact Section */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div>
                <Label>কন্টাক্ট হেডলাইন</Label>
                <Input
                  value={formData.contact_headline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_headline: e.target.value }))}
                />
              </div>

              <div>
                <Label>কন্টাক্ট সাব-হেডলাইন</Label>
                <Input
                  value={formData.contact_subheadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_subheadline: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ফোন নম্বর</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="01832-677000"
                  />
                </div>
                <div>
                  <Label>ফোন লিংক</Label>
                  <Input
                    value={formData.contact_phone_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone_link: e.target.value }))}
                    placeholder="tel:01832677000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>হোয়াটসঅ্যাপ নম্বর</Label>
                  <Input
                    value={formData.contact_whatsapp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_whatsapp: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>হোয়াটসঅ্যাপ বাটন টেক্সট</Label>
                  <Input
                    value={formData.contact_whatsapp_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_whatsapp_text: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>অ্যাভেইলেবিলিটি টেক্সট</Label>
                <Input
                  value={formData.contact_availability}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_availability: e.target.value }))}
                  placeholder="AVAILABLE 24/7 FOR YOU"
                />
              </div>
            </TabsContent>

            {/* Style Section */}
            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "primary_color", label: "প্রাইমারি কালার" },
                  { key: "background_color", label: "ব্যাকগ্রাউন্ড কালার" },
                  { key: "text_color", label: "টেক্সট কালার" },
                  { key: "accent_color", label: "অ্যাকসেন্ট কালার" },
                ].map((item) => (
                  <div key={item.key}>
                    <Label>{item.label}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={(formData as any)[item.key]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [item.key]: e.target.value }))}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={(formData as any)[item.key]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [item.key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div
                className="rounded-lg p-6 mt-4"
                style={{
                  background: `linear-gradient(135deg, ${formData.background_color} 0%, ${formData.primary_color} 100%)`,
                  color: formData.text_color,
                }}
              >
                <p className="text-sm opacity-70">প্রিভিউ</p>
                <h3 className="text-xl font-bold">
                  স্যাম্পল{" "}
                  <span style={{ color: formData.accent_color }}>হেডলাইন</span>
                </h3>
                <button
                  className="mt-2 px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: formData.accent_color }}
                >
                  বাটন
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || uploading}>
            {isSubmitting ? "সেভ হচ্ছে..." : salesPage ? "আপডেট করুন" : "তৈরি করুন"}
          </Button>
        </div>
      </DialogContent>

      {/* Template Gallery */}
      <TemplateGallery
        open={templateGalleryOpen}
        onOpenChange={setTemplateGalleryOpen}
        currentTemplateId={formData.template_id}
        onSelect={handleTemplateSelect}
      />
    </Dialog>
  );
};

export default SalesPageEditorDialog;
