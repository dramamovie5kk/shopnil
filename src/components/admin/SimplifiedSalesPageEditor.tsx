import SectionStepEditor from './SectionStepEditor';
import ExtraSectionEditor from './ExtraSectionEditor';
import type { ExtraSectionNumber } from '@/lib/extraSectionDesigns';
import { useState, useEffect, useRef, type ReactNode } from "react";

 import SalesPreviewViewport from "@/components/admin/SalesPreviewViewport";
 import { SalesPageContent } from "@/pages/SalesPage";
 import { PreviewErrorBoundary } from "@/components/admin/PreviewErrorBoundary";
 import { Monitor, Smartphone } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
  import { SalesPage } from "@/types/salesPage";
import { FeaturePoint, SpecItem } from "@/types/salesPage";
 import { useCreateSalesPage, useUpdateSalesPage } from "@/hooks/useSalesPages";
 import { useProducts } from "@/hooks/useProducts";
 import { api } from "@/integrations/cloudflare/client";
import { X, Upload, Image as ImageIcon, Palette, ChevronDown, Trash2 } from "lucide-react";
import Template15StyleEditor from "./Template15StyleEditor";
import CustomSectionEditor, { CustomSection } from "./CustomSectionEditor";
import CustomSectionInlineEditor from "./CustomSectionInlineEditor";
 import { toast } from "sonner";
import { SalesPageTemplate, getTemplate, selectableSalesPageTemplates } from "@/lib/salesPageTemplates";
import SectionOrderManager, { DEFAULT_ORDER, CustomSectionInfo } from "./SectionOrderManager";
import { checkoutDesigns, getCheckoutDesign, checkoutColorGroups, checkoutTextGroups } from "@/lib/checkoutDesigns";
import { contactDesigns, getContactDesign, contactColorGroups, contactTextFields } from "@/lib/contactDesigns";
import { reviewColorGroups, reviewDefaults, reviewTextFields } from "@/lib/reviewStyles";
import { featureDesigns, featureColorGroups, featurePalette, getFeatureDesign } from "@/lib/featureDesigns";
import { galleryDesigns, galleryColorGroups, galleryPalette, getGalleryDesign } from "@/lib/galleryDesigns";
import { heroDesigns, heroColorFields, offerTimerColorFields } from "@/lib/heroDesigns";
import { builtInSectionsForTemplate, supportsSectionDesigns, toggleSectionDesign } from "@/lib/salesSectionDesignAvailability";
import Hero08Editor from './Hero08Editor';
import Hero09Editor from './Hero09Editor';
import Hero10Editor from './Hero10Editor';
import Template02DesignEditor from './Template02DesignEditor';
import { template02Sections, isTemplate02Design } from '@/lib/template02Designs';
import Template02DefaultHeroEditor from './Template02DefaultHeroEditor';
import { checkoutExtraFields, isCheckoutExtraFieldEnabled } from '@/lib/checkoutExtraFields';
 
// Helper functions to migrate old fixed-column data to new JSONB arrays
const migrateOldFeatures = (page: SalesPage): FeaturePoint[] => {
  const features: FeaturePoint[] = [];
  for (let i = 1; i <= 6; i++) {
    const text = (page as any)[`feature_${i}_text`];
    const icon = (page as any)[`feature_${i}_icon`];
    const description = (page as any)[`feature_${i}_description`];
    if (text && text.trim()) {
      features.push({ icon: icon || '✅', text, description: description || '' });
    }
  }
  return features;
};

const migrateOldPoints = (page: SalesPage, sectionNum: number): string[] => {
  const points: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const point = (page as any)[`extra_section_${sectionNum}_point_${i}`];
    if (point && point.trim()) {
      points.push(point);
    }
  }
  return points;
};

 interface SimplifiedSalesPageEditorProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   salesPage: SalesPage | null;
 }
 
 const defaultFormData = {
   slug: "",
   title: "",
   is_active: true,
   product_id: "",
   template_id: "template-01-organic",
   show_hero_section: true,
   show_video_section: false,
   show_countdown: false,
   show_gallery_section: true,
   show_features_section: true,
   show_reviews_section: true,
   show_contact_section: true,
   show_checkout_section: true,
   hero_variant: "01",
   gallery_variant: "01",
   feature_variant: "01",
   review_variant: "01",
   contact_variant: "01",
   hero_badge_text: "🌿 ১০০% অর্গানিক ও প্রাকৃতিক",
   hero_headline: "",
   hero_subheadline: "",
   hero_images: [] as string[],
   hero_video_url: "",
   countdown_end_date: "",
   countdown_label_days: "দিন",
   countdown_label_hours: "ঘন্টা",
   countdown_label_minutes: "মিনিট",
   countdown_label_seconds: "সেকেন্ড",
   offer_price: 0,
   original_price: 0,
   discount_text: "২৯% ছাড়",
   price_unit: "৳",
   offer_details: "",
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
   gallery_title: "আমাদের কালেকশন",
   gallery_subtitle: "যেমন দেখছেন, তেমনই পাবেন",
    gallery_images: [] as string[],
    gallery_product_prices: [] as number[],
    reviews_headline: "কাস্টমার ফিডব্যাক",
    reviews_subheadline: "আমাদের সন্তুষ্ট গ্রাহকদের মতামত",
    review_images: [] as string[],
    review_video_url: "",
   contact_headline: "যেকোনো প্রয়োজনে কল করুন",
   contact_subheadline: "ফোনে অর্ডার করতে কল করুন",
   contact_phone: "01832-677000",
   contact_phone_link: "tel:01832677000",
   contact_whatsapp: "01832677000",
   contact_whatsapp_text: "হোয়াটসঅ্যাপ মেসেজ",
   contact_availability: "২৪/৭ সার্ভিস",
   cta_button_text: "এখনই অর্ডার করুন",
   cta_urgency_text: "সীমিত স্টক! মিস করবেন না",
    primary_color: "#16a34a",
    background_color: "#052e16",
    text_color: "#ffffff",
    accent_color: "#22c55e",
    headline_color: "#ffff00",
    button_color: "#e8c84a",
  // Extra Sections
  show_extra_section_1: false,
  extra_section_1_heading: "কেন আমাদের উপর আস্থা রাখবেন?",
  show_extra_section_2: false,
  extra_section_2_heading: "আমাদের বিশেষত্ব",
  show_extra_section_3: false,
  extra_section_3_heading: "গ্রাহক সুবিধা",
  section_order: DEFAULT_ORDER,
  // Unlimited points arrays
  feature_points: [] as FeaturePoint[],
  extra_section_1_points: [] as string[],
  extra_section_2_points: [] as string[],
  extra_section_3_points: [] as string[],
  // Footer
  footer_text: "",
  // Spec Section
  show_spec_section: false,
  spec_section_heading: "টেকনিক্যাল স্পেসিফিকেশন",
  spec_items: [] as SpecItem[],
  // Feature Section Image
  feature_section_image: "",
  feature_section_images: [] as string[],
  // Template-specific styles (JSONB)
  template_styles: {} as Record<string, Record<string, string>>,
  };
 
 const SimplifiedSalesPageEditor = ({
   open,
   onOpenChange,
   salesPage,
 }: SimplifiedSalesPageEditorProps) => {
   const createMutation = useCreateSalesPage();
   const updateMutation = useUpdateSalesPage();
   const { data: products } = useProducts();
   const [formData, setFormData] = useState(defaultFormData);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
   // Template 01 offers only the 01–10 designs, Template 02 only the t2-01..t2-05 designs; Custom offers none.
   const sectionDesignsAvailable = supportsSectionDesigns(formData.template_id);
   const isTemplate01 = formData.template_id === 'template-01-organic';
   const isTemplate02 = formData.template_id === 'template-02-clothing';
   const withTemplate02Picker = (sectionId: string, content: ReactNode) => {
     const section = template02Sections.find(s => s === sectionId);
     if (!section || !isTemplate02 || isTemplate02Design(formData.template_styles?.[section]?.design)) return content;
     return <div>
       <div className="p-3 bg-muted/30">
         <Template02DesignEditor section={section} settings={formData.template_styles?.[section] ?? {}} previewPage={formData as unknown as SalesPage} onSetting={(key, value) => setFormData(prev => { const settings = { ...prev.template_styles?.[section] }; if (value === undefined) delete settings[key]; else settings[key] = value; return { ...prev, template_styles: { ...prev.template_styles, [section]: settings } }; })} />
       </div>
       {section === 'hero' && <div className="p-3"><Template02DefaultHeroEditor settings={formData.template_styles?.hero ?? {}} images={<ImageGrid images={formData.hero_images} target="hero" />} onSetting={(key, value) => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; if (value === undefined) delete hero[key]; else hero[key] = value; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })} /></div>}
       {content}
     </div>;
   };
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const heroTimerRef = useRef<HTMLDivElement>(null);
    const [uploadTarget, setUploadTarget] = useState<"hero" | "gallery" | "review" | "feature" | "hero03offer">("hero");
  const [expandedSections, setExpandedSections] = useState<string[]>(["template"]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
 
   useEffect(() => {
     if (salesPage) {
       setFormData({
         slug: salesPage.slug,
         title: salesPage.title,
         is_active: salesPage.is_active,
         product_id: salesPage.product_id || "",
         template_id: salesPage.template_id || "template-01-organic",
         show_hero_section: salesPage.show_hero_section ?? true,
         show_video_section: salesPage.show_video_section ?? false,
         show_countdown: salesPage.show_countdown ?? false,
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
         hero_badge_text: salesPage.hero_badge_text || "",
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
         discount_text: salesPage.discount_text || "",
         price_unit: salesPage.price_unit || "৳",
         offer_details: salesPage.offer_details || "",
         features_headline: salesPage.features_headline || "কি কি থাকছে?",
         features_subheadline: salesPage.features_subheadline || "",
         feature_1_text: salesPage.feature_1_text || "",
         feature_1_icon: salesPage.feature_1_icon || "✅",
         feature_1_description: salesPage.feature_1_description || "",
         feature_2_text: salesPage.feature_2_text || "",
         feature_2_icon: salesPage.feature_2_icon || "✅",
         feature_2_description: salesPage.feature_2_description || "",
         feature_3_text: salesPage.feature_3_text || "",
         feature_3_icon: salesPage.feature_3_icon || "✅",
         feature_3_description: salesPage.feature_3_description || "",
         feature_4_text: salesPage.feature_4_text || "",
         feature_4_icon: salesPage.feature_4_icon || "✅",
         feature_4_description: salesPage.feature_4_description || "",
         feature_5_text: salesPage.feature_5_text || "",
         feature_5_icon: salesPage.feature_5_icon || "✅",
         feature_5_description: salesPage.feature_5_description || "",
         feature_6_text: salesPage.feature_6_text || "",
         feature_6_icon: salesPage.feature_6_icon || "✅",
         feature_6_description: salesPage.feature_6_description || "",
         feature_card_bg_color: salesPage.feature_card_bg_color || "#1a3a2f",
         feature_icon_bg_color: salesPage.feature_icon_bg_color || "#f59e0b",
         gallery_title: salesPage.gallery_title || "",
         gallery_subtitle: salesPage.gallery_subtitle || "",
          gallery_images: salesPage.gallery_images || [],
          gallery_product_prices: salesPage.gallery_product_prices || [],
          reviews_headline: salesPage.reviews_headline || "কাস্টমার ফিডব্যাক",
          reviews_subheadline: salesPage.reviews_subheadline || "",
          review_images: salesPage.review_images || [],
          review_video_url: (salesPage as any).review_video_url || "",
         contact_headline: salesPage.contact_headline || "",
         contact_subheadline: salesPage.contact_subheadline || "",
         contact_phone: salesPage.contact_phone || "",
         contact_phone_link: salesPage.contact_phone_link || "",
         contact_whatsapp: salesPage.contact_whatsapp || "",
         contact_whatsapp_text: salesPage.contact_whatsapp_text || "",
         contact_availability: salesPage.contact_availability || "",
         cta_button_text: salesPage.cta_button_text || "",
         cta_urgency_text: salesPage.cta_urgency_text || "",
          primary_color: salesPage.primary_color || "#16a34a",
          background_color: salesPage.background_color || "#052e16",
          text_color: salesPage.text_color || "#ffffff",
          accent_color: salesPage.accent_color || "#22c55e",
          headline_color: (salesPage as any).headline_color || "#ffff00",
          button_color: (salesPage as any).button_color || "#e8c84a",
        // Extra Sections
        show_extra_section_1: salesPage.show_extra_section_1 ?? false,
        extra_section_1_heading: salesPage.extra_section_1_heading || "কেন আমাদের উপর আস্থা রাখবেন?",
        show_extra_section_2: salesPage.show_extra_section_2 ?? false,
        extra_section_2_heading: salesPage.extra_section_2_heading || "আমাদের বিশেষত্ব",
        show_extra_section_3: salesPage.show_extra_section_3 ?? false,
        extra_section_3_heading: salesPage.extra_section_3_heading || "গ্রাহক সুবিধা",
        section_order: salesPage.section_order || DEFAULT_ORDER,
        // Unlimited points arrays - migrate from old format if needed
        feature_points: salesPage.feature_points || migrateOldFeatures(salesPage),
        extra_section_1_points: salesPage.extra_section_1_points || migrateOldPoints(salesPage, 1),
        extra_section_2_points: salesPage.extra_section_2_points || migrateOldPoints(salesPage, 2),
        extra_section_3_points: salesPage.extra_section_3_points || migrateOldPoints(salesPage, 3),
        // Footer
        footer_text: salesPage.footer_text || "",
        // Spec Section
         show_spec_section: (salesPage as any).show_spec_section ?? false,
         spec_section_heading: (salesPage as any).spec_section_heading || "টেকনিক্যাল স্পেসিফিকেশন",
         spec_items: Array.isArray((salesPage as any).spec_items) ? (salesPage as any).spec_items : [],
          // Feature Section Image
          feature_section_image: (salesPage as any).feature_section_image || "",
          feature_section_images: Array.isArray((salesPage as any).feature_section_images) ? (salesPage as any).feature_section_images : [],
          // Template-specific styles
          template_styles: (salesPage as any).template_styles || {},
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
           if (uploadTarget === "hero03offer") {
              return { ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, offer_image: uploadedUrls[0] } } as any };
           }
           if (uploadTarget === "feature") {
             if (prev.template_id === 'template-09-superfood' && !prev.template_styles?.features?.design) {
               return { ...prev, feature_section_images: [...prev.feature_section_images, ...uploadedUrls] };
             }
             return { ...prev, feature_section_image: uploadedUrls[0] };
          }
          const key = uploadTarget === "hero" ? "hero_images" 
            : uploadTarget === "gallery" ? "gallery_images" 
            : "review_images";
          return { ...prev, [key]: [...prev[key], ...uploadedUrls] };
       });
 
       toast.success(`${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে!`);
     } catch (err: unknown) {
       console.error("Upload error:", err);
       toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
     } finally {
       setUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = "";
     }
   };
 
   const removeImage = (target: "hero" | "gallery" | "review" | "feature", index: number) => {
     if (target === 'feature') {
       setFormData(prev => ({ ...prev, feature_section_images: (prev.feature_section_images || []).filter((_, i) => i !== index) }));
       return;
     }
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
      video_url: formData.hero_video_url || null,
        offer_details: formData.offer_details || null,
        countdown_end_date: formData.countdown_end_date || null,
        feature_section_image: formData.feature_section_image || null,
        feature_section_images: formData.feature_section_images || [],
        template_styles: formData.template_styles || {},
      };
 
     if (salesPage) {
      // Keep the editor open after saving; it closes only via the × button.
      updateMutation.mutate({ id: salesPage.id, ...payload });
     } else {
       createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
     }
   };
 
   const isSubmitting = createMutation.isPending || updateMutation.isPending;
 
     const triggerUpload = (target: "hero" | "gallery" | "review" | "feature" | "hero03offer") => {
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
       ...(template.headline_color ? { headline_color: template.headline_color } : {}),
       ...(template.button_color ? { button_color: template.button_color } : {}),
      // Apply template default sections
      show_hero_section: template.defaultSections.hero,
      show_countdown: template.defaultSections.countdown,
      show_gallery_section: template.defaultSections.gallery,
      show_video_section: template.defaultSections.video,
      show_features_section: template.defaultSections.features,
      show_reviews_section: template.defaultSections.reviews,
      show_contact_section: template.defaultSections.contact,
     }));
    toast.success(`"${template.name}" টেমপ্লেট সিলেক্ট হয়েছে!`);
   };
 
   const currentTemplate = getTemplate(formData.template_id);
  
  const availableTemplates = selectableSalesPageTemplates;
 
   const toggleSection = (section: string) => {
     setExpandedSections(prev => 
       prev.includes(section) 
         ? prev.filter(s => s !== section)
         : [...prev, section]
     );
   };
 
   // Recommended sizes for each upload target
   const getRecommendedSize = (target: "hero" | "gallery" | "review" | "feature") => {
     switch (target) {
       case "hero": return "রিকমেন্ডেড: 800×500px";
       case "gallery": return "রিকমেন্ডেড: 600×600px";
       case "review": return "রিকমেন্ডেড: 600×800px";
       case "feature": return "রিকমেন্ডেড: 700×400px";
       default: return "";
     }
   };

   // Compact Image Grid
   const ImageGrid = ({ images, target }: { images: string[]; target: "hero" | "gallery" | "review" | "feature" }) => (
     <div className="space-y-2">
       <div className="flex justify-between items-center">
         <span className="text-xs text-muted-foreground">{images.length}টি ইমেজ</span>
         <Button 
           type="button" 
           variant="outline" 
           size="sm" 
           onClick={() => triggerUpload(target)}
           disabled={uploading}
           className="h-7 text-xs"
         >
           <Upload className="h-3 w-3 mr-1" />
           {uploading ? "..." : "আপলোড"}
         </Button>
       </div>
       {images.length > 0 ? (
         <div className="grid grid-cols-6 gap-1">
           {images.map((img, i) => (
             <div key={i} className="relative group">
               <img src={img} alt="" className="w-full aspect-square object-cover rounded border" />
               <button
                 type="button"
                 onClick={() => removeImage(target, i)}
                 className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <X className="h-2.5 w-2.5" />
               </button>
             </div>
           ))}
         </div>
       ) : (
         <div className="border border-dashed rounded p-2 text-center text-xs text-muted-foreground">
           ইমেজ আপলোড করুন
         </div>
       )}
       <p className="text-[10px] text-muted-foreground text-center">{getRecommendedSize(target)}</p>
     </div>
   );
 
   // Section Toggle with Collapsible
   const SectionToggle = ({
     id,
     label,
     enabled,
     onToggle,
     children,
   }: {
     id: string;
     label: string;
     enabled: boolean;
     onToggle: (val: boolean) => void;
     children?: React.ReactNode;
   }) => {
     const isExpanded = expandedSections.includes(id);
     
     return (
       <div className="border rounded-lg overflow-hidden">
         <div 
           className="flex items-center justify-between px-3 py-2 bg-muted/40 cursor-pointer"
           onClick={() => enabled && children && toggleSection(id)}
         >
           <div className="flex items-center gap-2">
             <Switch
               checked={enabled}
               onCheckedChange={(e) => {
                 e && toggleSection(id);
                 onToggle(e);
               }}
               className="scale-75"
               onClick={(e) => e.stopPropagation()}
             />
             <span className={`text-sm font-medium ${enabled ? '' : 'text-muted-foreground'}`}>
               {label}
             </span>
           </div>
           {enabled && children && (
             <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
           )}
         </div>
         {enabled && isExpanded && children && (
           <div className="p-3 border-t space-y-2 bg-background">
             {children}
           </div>
         )}
       </div>
     );
   };
 
   return (
      open ? (
      <div className="fixed inset-0 z-50 flex bg-background">
       <div className="flex w-full flex-col border-r lg:w-[480px] lg:shrink-0">
         <div className="flex items-center justify-between px-4 py-3 border-b">
           <h2 className="text-base font-semibold">
             {salesPage ? "সেলস পেজ এডিট করুন" : "নতুন সেলস পেজ"}
           </h2>
           <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="বন্ধ করুন"><X className="h-4 w-4" /></Button>
         </div>
 
         <input
           ref={fileInputRef}
           type="file"
           accept="image/*"
           multiple
           className="hidden"
           onChange={handleImageUpload}
         />
 
         <ScrollArea className="flex-1 min-h-0 px-4">
           <div className="space-y-4 py-4">
             {/* Basic Info Row */}
            <div className="grid grid-cols-2 gap-2">
               <div>
                 <Label className="text-xs">পেজ শিরোনাম *</Label>
                 <Input
                   value={formData.title}
                   onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                   placeholder="স্পেশাল অফার"
                   className="h-8 text-sm"
                 />
               </div>
               <div>
                 <Label className="text-xs">স্লাগ (URL) *</Label>
                 <Input
                   value={formData.slug}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                   }))}
                   placeholder="special-offer"
                   className="h-8 text-sm"
                 />
               </div>
             </div>
 
            {/* Template Selector - Primary Selection */}
            <div className="border rounded-lg overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5">
              <div 
                className="flex items-center justify-between px-3 py-2 cursor-pointer"
                onClick={() => toggleSection("template")}
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">টেমপ্লেট: {currentTemplate.name}</span>
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                     {availableTemplates.length}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes("template") ? 'rotate-180' : ''}`} />
              </div>
              {expandedSections.includes("template") && (
                <div className="p-2 border-t bg-background">
                  <div className="grid grid-cols-3 gap-2">
                    {availableTemplates.map((template) => (
                       <Button
                        key={template.id}
                        type="button"
                         variant="outline"
                        onClick={() => handleTemplateSelect(template)}
                         className={`relative h-auto min-w-0 flex-col items-stretch p-2 rounded-lg border-2 transition-all text-left ${
                          formData.template_id === template.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex gap-0.5 mb-1.5">
                          <div className="h-1.5 flex-1 rounded-full" style={{ background: template.primary_color }} />
                          <div className="h-1.5 flex-1 rounded-full" style={{ background: template.accent_color }} />
                          <div className="h-1.5 flex-1 rounded-full" style={{ background: template.background_color }} />
                        </div>
                        <p className="font-medium text-[10px] truncate">{template.name}</p>
                        <p className="text-[8px] text-muted-foreground">{template.category}</p>
                        {formData.template_id === template.id && (
                          <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full w-3 h-3 flex items-center justify-center text-[8px]">✓</div>
                        )}
                       </Button>
                    ))}
                  </div>

                </div>
              )}
            </div>
 
            {/* Product Selection (multiple) */}
            {(() => {
              const linked = formData.template_styles?.products || {};
              const ids = (linked.ids ? linked.ids.split(",") : (formData.product_id ? [formData.product_id] : [])).filter(Boolean);
              const setIds = (next: string[]) => setFormData(prev => ({
                ...prev,
                product_id: next[0] || "",
                template_styles: { ...prev.template_styles, products: { ...prev.template_styles?.products, ids: next.join(",") } },
              }));
              return (
                <div className="space-y-2">
                  <Label className="text-xs">প্রোডাক্ট লিংক করুন (একাধিক বাছাই করা যাবে)</Label>
                  <div className="max-h-44 overflow-y-auto rounded-md border border-border divide-y divide-border">
                    {products?.map(product => {
                      const checked = ids.includes(product.id);
                      return (
                        <label key={product.id} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted">
                          <input type="checkbox" checked={checked} onChange={() => setIds(checked ? ids.filter(i => i !== product.id) : [...ids, product.id])} />
                          {product.image_url && <img src={product.image_url} alt="" className="h-6 w-6 rounded object-cover" />}
                          <span className="flex-1 truncate">{product.name_bn}</span>
                          <span className="text-xs text-muted-foreground">৳{product.price}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{ids.length}টি প্রোডাক্ট বাছাই করা হয়েছে। প্রথমটা মূল প্রোডাক্ট।</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={linked.multiple === "1"}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        template_styles: { ...prev.template_styles, products: { ...prev.template_styles?.products, multiple: checked ? "1" : "0" } },
                      }))}
                      className="scale-75"
                    />
                    <Label className="text-xs">কাস্টমার একসাথে একাধিক প্রোডাক্ট অর্ডার করতে পারবে</Label>
                  </div>
                </div>
              );
            })()}
             
             {/* Active Status */}
             <div className="flex items-center gap-2">
               <Switch
                 checked={formData.is_active}
                 onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                 className="scale-75"
               />
               <Label className="text-xs">সক্রিয়</Label>
             </div>
 
             {/* Sections */}
             <div className="space-y-2">
               <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">সেকশনসমূহ</Label>
               
              {/* Section Order Manager - Draggable sections */}
              <SectionOrderManager
                sectionOrder={formData.section_order}
                formData={formData as Record<string, unknown>}
                onOrderChange={(newOrder) => setFormData(prev => ({ ...prev, section_order: newOrder }))}
                onToggle={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
                onSectionClick={(id) => setExpandedSection(expandedSection === id ? null : id)}
                expandedSection={expandedSection}
                customSections={
                  (((formData.template_styles as any)?.customSections || []) as CustomSection[]).map(cs => ({
                        id: cs.id,
                        title: cs.name?.trim() || cs.title || 'কাস্টম সেকশন',
                        type: cs.type,
                      } as CustomSectionInfo))
                }
                builtInSectionIds={builtInSectionsForTemplate(formData.template_id)}
                onRemoveCustomSection={(sectionId) => {
                  const currentCustom = ((formData.template_styles as any)?.customSections || []) as CustomSection[];
                  const updated = currentCustom.filter(s => s.id !== sectionId);
                  setFormData(prev => ({
                    ...prev,
                    template_styles: { ...prev.template_styles, customSections: updated } as any,
                    section_order: prev.section_order.filter(id => id !== sectionId),
                  }));
                }}
                 renderSectionContent={(sectionId) => <SectionStepEditor key={`${formData.template_id}-${sectionId}`} section={sectionId} template={formData.template_id} settings={formData.template_styles?.[sectionId] ?? {}} onSettings={settings => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, [sectionId]: settings } }))}>{withTemplate02Picker(sectionId, ((): ReactNode => {
                   if (isTemplate02 && template02Sections.some(s => s === sectionId) && isTemplate02Design(formData.template_styles?.[sectionId]?.design)) {
                     const section = sectionId as typeof template02Sections[number];
                     const fields = section === 'hero' ? [['hero_headline', 'শিরোনাম'], ['hero_subheadline', 'বর্ণনা'], ['hero_badge_text', 'ব্যাজ'], ['offer_price', 'অফার মূল্য'], ['original_price', 'আগের মূল্য']] : section === 'gallery' ? [['gallery_title', 'শিরোনাম'], ['gallery_subtitle', 'বর্ণনা']] : section === 'features' ? [['features_headline', 'শিরোনাম'], ['features_subheadline', 'বর্ণনা']] : section === 'reviews' ? [['reviews_headline', 'শিরোনাম'], ['reviews_subheadline', 'বর্ণনা'], ['review_video_url', 'ভিডিও লিংক']] : [['contact_headline', 'শিরোনাম'], ['contact_subheadline', 'বর্ণনা'], ['contact_phone', 'কল নম্বর'], ['contact_whatsapp', 'হোয়াটসঅ্যাপ নম্বর'], ['contact_whatsapp_text', 'হোয়াটসঅ্যাপ বোতামের লেখা']];
                     return <div className="p-3 bg-muted/30 space-y-3">
                       <Template02DesignEditor section={section} settings={formData.template_styles?.[section] ?? {}} previewPage={formData as unknown as SalesPage} onSetting={(key, value) => setFormData(prev => { const settings = { ...prev.template_styles?.[section] }; if (value === undefined) delete settings[key]; else settings[key] = value; return { ...prev, template_styles: { ...prev.template_styles, [section]: settings } }; })} />
                       {fields.map(([key, label]) => <div key={key}><Label htmlFor={`t2-page-${key}`} className="text-xs">{label}</Label><Input id={`t2-page-${key}`} type={key.includes('price') ? 'number' : 'text'} min={key.includes('price') ? 0 : undefined} value={(formData as unknown as Record<string, string | number>)[key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, [key]: key.includes('price') ? Number(e.target.value) : e.target.value }))} /></div>)}
                       {section === 'hero' && <ImageGrid images={formData.hero_images} target="hero" />}
                       {section === 'gallery' && <ImageGrid images={formData.gallery_images} target="gallery" />}
                       {section === 'reviews' && <ImageGrid images={formData.review_images} target="review" />}
                       {section === 'features' && <><ImageGrid images={formData.feature_section_images || []} target="feature" />{formData.feature_points.map((point, i) => <div key={i} className="flex gap-2 border-b border-border pb-2"><div className="flex-1 space-y-2">{(['icon', 'text', 'description'] as const).map(key => <Input key={key} aria-label={`ফিচার ${i + 1} ${key}`} placeholder={key === 'text' ? 'ফিচারের লেখা' : key === 'description' ? 'বর্ণনা' : 'আইকন'} value={point[key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, feature_points: prev.feature_points.map((f, n) => n === i ? { ...f, [key]: e.target.value } : f) }))} />)}</div><Button type="button" size="icon" variant="ghost" aria-label={`ফিচার ${i + 1} মুছুন`} onClick={() => setFormData(prev => ({ ...prev, feature_points: prev.feature_points.filter((_, n) => n !== i) }))}><Trash2 size={16} /></Button></div>)}<Button type="button" variant="outline" onClick={() => setFormData(prev => ({ ...prev, feature_points: [...prev.feature_points, { text: '', description: '', icon: '✅' }] }))}>ফিচার যোগ করুন</Button></>}
                     </div>;
                   }
                   switch (sectionId) {
                     case 'hero':
                       if (isTemplate01) return (
                         <div className="p-3 bg-muted/30 space-y-4">
                           <Label className="text-sm font-semibold">হিরো সেকশন ডিজাইন</Label>
                           <div role="radiogroup" aria-label="হিরো ডিজাইন" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {heroDesigns.map(design => <Button key={design.id} type="button" role="radio" aria-checked={formData.template_styles?.hero?.design === design.id}
                               variant="outline" className={`h-auto min-h-28 flex-col items-stretch gap-2 whitespace-normal text-left p-2 ${formData.template_styles?.hero?.design === design.id ? 'border-primary bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground ring-2 ring-primary/30' : ''}`}
                               onClick={() => { setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: toggleSectionDesign(prev.template_styles?.hero, design.id) } })); if (formData.template_styles?.hero?.design !== design.id && ['04', '10'].includes(design.id)) window.setTimeout(() => heroTimerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80); }}>
                               <span aria-hidden="true" className={`hero-design-demo hero-design-demo--${design.id}`}><span className="hero-design-demo-image">{formData.hero_images[0] ? <img src={formData.hero_images[0]} alt="" /> : <ImageIcon size={18} />}</span><span className="hero-design-demo-copy"><i /><i /><i /></span></span>
                               <span className="text-xs font-semibold">{design.id} · {design.label}</span><span className="text-[10px] text-muted-foreground">{design.description}</span>
                             </Button>)}
                           </div>
                           {salesPage && !formData.template_styles?.hero?.design && <p className="text-xs text-muted-foreground">বর্তমান পেজের হিরো অপরিবর্তিত আছে। নতুন ডিজাইন বাছলে বদলাবে।</p>}
                           {['04', '10'].includes(formData.template_styles?.hero?.design ?? '') && <div ref={heroTimerRef} className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                             <div className="space-y-1"><Label className="text-sm font-semibold">অফার টাইমার</Label><p className="text-xs text-muted-foreground">শেষ তারিখ ও সময়</p></div>
                             <div className="flex items-center justify-between gap-3"><Label htmlFor="hero-offer-timer" className="text-xs">টাইমার দেখান</Label><Switch id="hero-offer-timer" checked={formData.template_styles?.hero?.timer_enabled !== '0'} onCheckedChange={checked => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, timer_enabled: checked ? '1' : '0' } } }))} /></div>
                             {formData.template_styles?.hero?.timer_enabled !== '0' && <>
                               <div className="space-y-1"><Label htmlFor="hero-offer-deadline">অফারের শেষ তারিখ ও সময়</Label><Input id="hero-offer-deadline" type="datetime-local" value={formData.countdown_end_date ? (() => { const d = new Date(formData.countdown_end_date); return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); })() : ''} onChange={e => setFormData(prev => ({ ...prev, countdown_end_date: e.target.value ? new Date(e.target.value).toISOString() : '' }))} /></div>
                               <div className="space-y-1"><Label htmlFor="hero-timer-title">টাইমারের লেখা</Label><Input id="hero-timer-title" placeholder="অফার শেষ হতে বাকি" value={formData.template_styles?.hero?.text_timer_title ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_timer_title: e.target.value } } }))} /></div>
                               <div className="space-y-1"><Label htmlFor="hero-timer-expired">সময় শেষের লেখা</Label><Input id="hero-timer-expired" placeholder="অফারের সময় শেষ" value={formData.template_styles?.hero?.text_timer_expired ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_timer_expired: e.target.value } } }))} /></div>
                               <div className="grid grid-cols-2 gap-2">{([['text_timer_days', 'দিন'], ['text_timer_hours', 'ঘণ্টা'], ['text_timer_minutes', 'মিনিট'], ['text_timer_seconds', 'সেকেন্ড']] as const).map(([key, label]) => <div key={key} className="space-y-1"><Label htmlFor={`hero-timer-${key}`} className="text-xs">{label} লেবেল</Label><Input id={`hero-timer-${key}`} placeholder={label} value={formData.template_styles?.hero?.[key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [key]: e.target.value } } }))} /></div>)}</div>
                               <div className="space-y-2 border-t border-border pt-3"><Label className="text-xs font-semibold">টাইমারের রং</Label><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{offerTimerColorFields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`hero-timer-color-${field.key}`} className="text-xs">{field.label}</Label><div className="flex items-center gap-1"><Input id={`hero-timer-color-${field.key}`} type="color" aria-label={`${field.label} রং`} className="h-8 w-9 cursor-pointer p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(formData.template_styles?.hero?.[field.key] || '') ? formData.template_styles.hero[field.key] : '#267663'} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [field.key]: e.target.value } } }))} /><Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} placeholder="#rrggbb" value={formData.template_styles?.hero?.[field.key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [field.key]: e.target.value } } }))} />{formData.template_styles?.hero?.[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="রং ফিরিয়ে আনুন" onClick={() => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; delete hero[field.key]; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })}><X size={13} /></Button>}</div></div>)}</div></div>
                              </>}
                           </div>}
                           <div className="space-y-2 border-t border-border pt-3">
                             <Label htmlFor="hero-headline">হিরোর লেখা</Label>
                             <Textarea id="hero-headline" aria-label="হিরোর শিরোনাম" placeholder="পণ্যের নাম" value={formData.template_styles?.hero?.text_headline ?? formData.hero_headline} onChange={e => setFormData(prev => ({ ...prev, hero_headline: e.target.value, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_headline: e.target.value } } }))} />
                             {!['08', '09', '10'].includes(formData.template_styles?.hero?.design ?? '') && <><Input aria-label="হিরোর বর্ণনা" placeholder="সংক্ষিপ্ত বর্ণনা" value={formData.template_styles?.hero?.text_subtitle ?? formData.hero_subheadline} onChange={e => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_subtitle: e.target.value } } }))} />
                             {([{key:'badge', label:'ব্যাজ', value:formData.hero_badge_text}, {key:'button', label:'অর্ডার বোতাম', value:formData.cta_button_text}, {key:'urgency', label:'তাড়ার বার্তা', value:formData.cta_urgency_text}] as const).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero-text-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero-text-${field.key}`} value={formData.template_styles?.hero?.[`text_${field.key}`] ?? field.value} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [`text_${field.key}`]: e.target.value } } }))} /></div>)}</>}
                             {!formData.template_styles?.hero?.design && <div className="space-y-2 border-t border-border pt-3">
                               <Label className="text-sm font-semibold">মূল ডিজাইনের দাম ও সুবিধার লেখা</Label>
                               {([['old_price_label', 'আগের দামের আগের লেখা', 'আগের দাম: '], ['price_suffix', 'দামের পরের লেখা', 'টাকা'], ['perk_1', 'প্রথম সুবিধার লেখা', 'ফ্রি ডেলিভারি'], ['perk_2', 'দ্বিতীয় সুবিধার লেখা', 'ক্যাশ অন ডেলিভারি'], ['perk_3', 'তৃতীয় সুবিধার লেখা', 'গ্যারান্টি']] as const).map(([key, label, placeholder]) => <div key={key} className="space-y-1"><Label htmlFor={`hero-default-${key}`} className="text-xs">{label}</Label><Input id={`hero-default-${key}`} placeholder={placeholder} value={formData.template_styles?.hero?.[`text_${key}`] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [`text_${key}`]: e.target.value } } }))} /></div>)}
                               <p className="text-xs text-muted-foreground">খালি রাখলে মূল লেখাগুলো দেখাবে।</p>
                             </div>}
                             {formData.template_styles?.hero?.design === '08' && <Hero08Editor settings={formData.template_styles?.hero ?? {}} whatsappNumber={formData.contact_whatsapp ?? ''} whatsappMessage={formData.contact_whatsapp_text ?? ''} originalPrice={formData.original_price || 0} offerPrice={formData.offer_price || 0} onPrice={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))} onSetting={(key, value) => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; if (value === undefined) delete hero[key]; else hero[key] = value; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })} />}
                              {formData.template_styles?.hero?.design === '09' && <Hero09Editor settings={formData.template_styles?.hero ?? {}} onSetting={(key, value) => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; if (value === undefined) delete hero[key]; else hero[key] = value; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })} />}
                              {formData.template_styles?.hero?.design === '10' && <Hero10Editor settings={formData.template_styles?.hero ?? {}} originalPrice={formData.original_price || 0} offerPrice={formData.offer_price || 0} onPrice={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))} defaults={{ text_hero10_badge: formData.template_styles?.hero?.text_badge ?? formData.hero_badge_text ?? '', text_hero10_description: formData.template_styles?.hero?.text_subtitle ?? formData.hero_subheadline ?? '', text_hero10_button: formData.template_styles?.hero?.text_button ?? (formData.cta_button_text || 'শুরু করি'), hero10_video_url: formData.hero_video_url ?? salesPage?.video_url ?? '' }} onSetting={(key, value) => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; if (value === undefined) delete hero[key]; else hero[key] = value; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })} />}
                              {formData.template_styles?.hero?.design === '03' && <>
                                <div className="border-t border-border pt-3 space-y-2"><Label className="text-sm font-semibold">৩ নম্বর ডিজাইনের হেডার ও অফার</Label>
                                  {([
                                    { key: 'topbar', label: 'সবার উপরের লেখা', placeholder: 'স্টক খুবই সীমিত — অফার শেষ হওয়ার আগেই অর্ডার করুন' },
                                    { key: 'logo', label: 'হেডারের শব্দ বা অক্ষর', placeholder: 'স' },
                                    { key: 'offer_title', label: 'হেডারের অফারের নাম', placeholder: 'সুপার কোয়ালিটি অফার' },
                                    { key: 'offer_subtitle', label: 'হেডারের ছোট লেখা', placeholder: '৩ পিস থ্রি পিস কালেকশন' },
                                    { key: 'header_button', label: 'হেডারের অর্ডার বোতামের লেখা', placeholder: 'এখনই অর্ডার করুন' },
                                    { key: 'old_price', label: 'আগের দামের আগে লেখা', placeholder: 'আলাদা কিনলে' },
                                    { key: 'savings', label: 'সাশ্রয়ের লেখা', placeholder: 'সাশ্রয়' },
                                    { key: 'ticket_note', label: 'দামের পাশে ছোট লেখা', placeholder: '৩ পিস একসাথে' },
                                  ] as const).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero03-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero03-${field.key}`} placeholder={field.placeholder} value={formData.template_styles?.hero?.[`text_${field.key}`] ?? (field.key === 'topbar' ? formData.template_styles?.hero?.text_urgency ?? formData.cta_urgency_text : field.key === 'header_button' ? formData.template_styles?.hero?.text_button ?? formData.cta_button_text : '')} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [`text_${field.key}`]: e.target.value } } }))} /></div>)}
                                  <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label htmlFor="hero03-original" className="text-xs">আগের দাম (৳)</Label><Input id="hero03-original" type="number" min="0" value={formData.original_price || ''} onChange={e => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) || 0 }))} /></div><div className="space-y-1"><Label htmlFor="hero03-offer" className="text-xs">অফার দাম (৳)</Label><Input id="hero03-offer" type="number" min="0" value={formData.offer_price || ''} onChange={e => setFormData(prev => ({ ...prev, offer_price: Number(e.target.value) || 0 }))} /></div></div>
                                  <div className="space-y-1"><Label htmlFor="hero03-marquee" className="text-xs">নিচের চলমান লেখাগুলো</Label><Textarea id="hero03-marquee" placeholder={'১০০% সুতি কাপড়\nরঙের ১০০% গ্যারান্টি\nসারা বাংলাদেশে ডেলিভারি'} value={formData.template_styles?.hero?.text_marquee ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_marquee: e.target.value } } }))} /><p className="text-xs text-muted-foreground">প্রতিটি লেখা নতুন লাইনে দিন; খালি থাকলে তাড়ার বার্তা দেখাবে।</p></div>
                                  <div className="space-y-1">
                                    <Label htmlFor="hero03-offerimg" className="text-xs">সাশ্রয়ের লেখার নিচের ইমেজ</Label>
                                    {formData.template_styles?.hero?.offer_image ? (
                                      <div className="relative w-fit">
                                        <img src={formData.template_styles.hero.offer_image} alt="" className="h-20 rounded border object-cover" />
                                        <button type="button" aria-label="ইমেজ মুছুন" className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5" onClick={() => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; delete hero.offer_image; return { ...prev, template_styles: { ...prev.template_styles, hero } } as any; })}><X className="h-2.5 w-2.5" /></button>
                                      </div>
                                    ) : (
                                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" disabled={uploading} onClick={() => triggerUpload("hero03offer")}><Upload className="h-3 w-3 mr-1" />{uploading ? "..." : "আপলোড"}</Button>
                                    )}
                                    <p className="text-xs text-muted-foreground">হিরোর হেডলাইনের (সেভ লেখার) ঠিক নিচে দেখাবে। রিকমেন্ডেড: 800×400px। খালি রাখলে ইমেজ দেখাবে না।</p>
                                  </div>
                                </div>
                              </>}
                              {formData.template_styles?.hero?.design === '05' && <div className="border-t border-border pt-3 space-y-2"><Label className="text-sm font-semibold">৫ নম্বর ডিজাইনের হেডার ও অফার</Label>
                                {([
                                  { key: 'topbar', label: 'সবার উপরের লেখা', placeholder: 'লিমিটেড স্টক — এখনই অর্ডার করুন', textarea: false },
                                  { key: 'logo', label: 'হেডারের লোগো শব্দ/অক্ষর', placeholder: 'D', textarea: false },
                                  { key: 'header_title', label: 'হেডারের শিরোনাম', placeholder: 'সুপার কোয়ালিটি অফার', textarea: false },
                                  { key: 'header_subtitle', label: 'হেডারের নিচের ছোট লেখা', placeholder: '৩ পিস বাটিক বেড শীট কালেকশন', textarea: false },
                                  { key: 'header_button', label: 'হেডারের বোতামের লেখা', placeholder: 'অর্ডার করুন', textarea: false },
                                  { key: 'headline_accent', label: 'শিরোনামের রঙিন দ্বিতীয় লাইন', placeholder: 'সাজান আপনার বিছানা', textarea: false },
                                  { key: 'image_label', label: 'ছবির উপরের ট্যাগ', placeholder: 'স্পেশাল অফার', textarea: false },
                                  { key: 'old_price', label: 'নিয়মিত দামের উপরের লেখা', placeholder: 'নিয়মিত মূল্য', textarea: false },
                                  { key: 'price_label', label: 'অফার দামের বক্সের লেখা', placeholder: 'অফার প্রাইস', textarea: false },
                                  { key: 'perks', label: 'দামের নিচের সুবিধা (প্রতি লাইনে একটি)', placeholder: '🚚 সারা বাংলাদেশে ডেলিভারি\n💵 ক্যাশ অন ডেলিভারি', textarea: true },
                                  { key: 'bottom_button', label: 'নিচের বড় বোতামের লেখা', placeholder: 'এখনই অর্ডার করুন — মাত্র ৯৯০ টাকা', textarea: false },
                                  { key: 'call', label: 'কল বোতামের লেখা', placeholder: 'কল করুন', textarea: false },
                                ]).map(field => {
                                  const defaults: Record<string, string> = {
                                    topbar: formData.template_styles?.hero?.text_urgency ?? formData.cta_urgency_text ?? '',
                                    logo: 'D',
                                    header_title: 'সুপার কোয়ালিটি অফার',
                                    header_subtitle: formData.title,
                                    header_button: 'অর্ডার করুন',
                                    image_label: 'স্পেশাল অফার',
                                    old_price: 'নিয়মিত মূল্য',
                                    price_label: 'অফার প্রাইস',
                                    perks: '🚚 সারা বাংলাদেশে ডেলিভারি\n💵 ক্যাশ অন ডেলিভারি',
                                    bottom_button: formData.offer_price > 0
                                      ? `${formData.template_styles?.hero?.text_button ?? formData.cta_button_text ?? 'এখনই অর্ডার করুন'} — মাত্র ${formData.offer_price.toLocaleString('bn-BD')} টাকা`
                                      : formData.template_styles?.hero?.text_button ?? formData.cta_button_text ?? 'এখনই অর্ডার করুন',
                                    call: 'কল করুন',
                                  };
                                  const v = formData.template_styles?.hero?.[`text_${field.key}`] ?? defaults[field.key] ?? '';
                                  const set = (val: string) => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [`text_${field.key}`]: val } } }));
                                  return <div key={field.key} className="space-y-1"><Label htmlFor={`hero05-${field.key}`} className="text-xs">{field.label}</Label>{field.textarea ? <Textarea id={`hero05-${field.key}`} placeholder={field.placeholder} value={v} onChange={e => set(e.target.value)} /> : <Input id={`hero05-${field.key}`} placeholder={field.placeholder} value={v} onChange={e => set(e.target.value)} />}</div>;
                                })}
                                <div className="space-y-2 border-t border-border pt-3"><Label className="text-sm font-semibold">৫ নম্বর হিরোর দাম</Label><div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label htmlFor="hero05-original" className="text-xs">নিয়মিত দাম (৳)</Label><Input id="hero05-original" type="number" min="0" value={formData.original_price || ''} onChange={e => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) || 0 }))} /></div><div className="space-y-1"><Label htmlFor="hero05-offer" className="text-xs">অফার দাম (৳)</Label><Input id="hero05-offer" type="number" min="0" value={formData.offer_price || ''} onChange={e => setFormData(prev => ({ ...prev, offer_price: Number(e.target.value) || 0 }))} /></div></div></div>
                                <p className="text-xs text-muted-foreground">উপরের "হিরোর লেখা" = শিরোনামের প্রথম লাইন, "বর্ণনা" = ফিচার লাইন, "ব্যাজ" = ছোট পিল লেখা। নিচের প্রথম ২টি ছবি পাশাপাশি দেখাবে।</p>
                              </div>}

                              {formData.template_styles?.hero?.design !== '08' && <div className="space-y-1"><Label htmlFor="hero-call-number" className="text-xs">কল নম্বর</Label><Input id="hero-call-number" placeholder="01XXXXXXXXX" value={formData.template_styles?.hero?.call_number ?? formData.contact_phone ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, call_number: e.target.value } } }))} /><p className="text-xs text-muted-foreground">নম্বর দিলে হিরোতে "কল করুন" বোতামে নম্বরসহ দেখাবে; খালি রাখলে বোতাম লুকানো থাকবে।</p></div>}
                              {formData.template_styles?.hero?.design === '06' && <div className="space-y-3 border-t border-border pt-3">
                                <Label className="text-sm font-semibold">৬ নম্বর ডিজাইনের লেখা ও দাম</Label>
                                {([
                                  { key: 'text_hero06_topbar', label: 'সবার উপরের লেখা', fallback: formData.template_styles?.hero?.text_urgency ?? formData.cta_urgency_text ?? '' },
                                  { key: 'text_hero06_accent', label: 'শিরোনামের সোনালি দ্বিতীয় লাইন', fallback: '' },
                                  { key: 'text_hero06_button', label: 'অর্ডার বোতামের লেখা', fallback: formData.template_styles?.hero?.text_button ?? formData.cta_button_text ?? 'অর্ডার করুন এখনই' },
                                  { key: 'text_hero06_call', label: 'কল বোতামের লেখা', fallback: 'কল করুন:' },
                                ]).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero06-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero06-${field.key}`} value={formData.template_styles?.hero?.[field.key] ?? field.fallback} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [field.key]: e.target.value } } }))} /></div>)}
                                <div className="space-y-1"><Label htmlFor="hero06-perks" className="text-xs">নিচের ডেলিভারি ও সুবিধার লেখা</Label><Textarea id="hero06-perks" placeholder={'✅ ক্যাশ অন ডেলিভারি\n🚚 হোম ডেলিভারি'} value={formData.template_styles?.hero?.text_hero06_perks ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, text_hero06_perks: e.target.value } } }))} /></div>
                                <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label htmlFor="hero06-original" className="text-xs">নিয়মিত দাম (৳)</Label><Input id="hero06-original" type="number" min="0" value={formData.original_price || ''} onChange={e => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) || 0 }))} /></div><div className="space-y-1"><Label htmlFor="hero06-offer" className="text-xs">অফার দাম (৳)</Label><Input id="hero06-offer" type="number" min="0" value={formData.offer_price || ''} onChange={e => setFormData(prev => ({ ...prev, offer_price: Number(e.target.value) || 0 }))} /></div></div>
                              </div>}
                              {formData.template_styles?.hero?.design === '06' && <Label className="text-sm font-semibold">হিরোর চার ছবির গ্রিড (প্রথম ৪টি ছবি)</Label>}
                              {formData.template_styles?.hero?.design === '03' && <Label className="text-sm font-semibold">হিরোর স্লাইডারের ছবিগুলো</Label>}
                              {formData.template_styles?.hero?.design === '08' && <Label className="text-sm font-semibold">৮ নম্বর হিরোর পণ্যের ছবি</Label>}
                              {formData.template_styles?.hero?.design === '09' && <Label className="text-sm font-semibold">৯ নম্বর হিরোর ছবি (একটি কম্বো ছবি অথবা প্রথম ৫টি ছবি)</Label>}
                             <ImageGrid images={formData.hero_images} target="hero" />
                           </div>
                           <div className="space-y-2 border-t border-border pt-3"><Label>হিরোর রং</Label><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{heroColorFields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`hero-color-${field.key}`} className="text-xs">{field.label}</Label><div className="flex items-center gap-1"><Input id={`hero-color-${field.key}`} type="color" aria-label={`${field.label} রং`} className="h-8 w-9 cursor-pointer p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(formData.template_styles?.hero?.[field.key] || '') ? formData.template_styles.hero[field.key] : '#267663'} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [field.key]: e.target.value } } }))} /><Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} placeholder="#rrggbb" value={formData.template_styles?.hero?.[field.key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, hero: { ...prev.template_styles?.hero, [field.key]: e.target.value } } }))} />{formData.template_styles?.hero?.[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="রং ফিরিয়ে আনুন" onClick={() => setFormData(prev => { const hero = { ...prev.template_styles?.hero }; delete hero[field.key]; return { ...prev, template_styles: { ...prev.template_styles, hero } }; })}><X size={13} /></Button>}</div></div>)}</div></div>
                         </div>
                       );
                       // Template 05 (Health) has unique hero
                       const isTemplate05 = formData.template_id === 'template-05-countdown';
                       // Template 04 (Gadget) has unique hero with offer box
                       const isTemplate04 = formData.template_id === 'template-04-gadget';
                       
                       if (isTemplate05) {
                         return (
                           <div className="p-3 bg-muted/30 space-y-2">
                             <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (হেলথ)</Label>
                             <Textarea
                               value={formData.hero_headline}
                               onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                               placeholder="হেডলাইন (হলুদ টেক্সট)"
                               className="min-h-[50px] text-sm"
                             />
                             <Textarea
                               value={formData.hero_subheadline}
                               onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                               placeholder="সর্ট ডিসক্রিপশন (সাদা টেক্সট)"
                               className="min-h-[50px] text-sm"
                             />
                             <div>
                               <Label className="text-xs text-muted-foreground">হিরো ভিডিও URL (YouTube)</Label>
                               <Input
                                 value={formData.hero_video_url}
                                 onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                 placeholder="https://www.youtube.com/watch?v=..."
                                 className="h-8 text-sm"
                               />
                             </div>
                             <Input
                               value={formData.cta_button_text}
                               onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                               placeholder="CTA বাটন টেক্সট (যেমন: অর্ডার করতে ক্লিক করুন)"
                               className="h-8 text-sm"
                             />
                           </div>
                         );
                       }

                       if (isTemplate04) {
                         return (
                           <div className="p-3 bg-muted/30 space-y-2">
                             <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (গ্যাজেট)</Label>
                             
                             {/* Offer Heading */}
                             <div>
                               <Label className="text-xs text-muted-foreground">অফার হেডিং (ব্যাজ টেক্সট)</Label>
                               <Input
                                 value={formData.hero_badge_text}
                                 onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                 placeholder="✨ ধামাকা ক্লিয়ারেন্স অফার ✨"
                                 className="h-8 text-sm"
                               />
                             </div>
                             
                             {/* Offer Details Box */}
                             <div className="border rounded-lg p-2 space-y-2 bg-background">
                               <Label className="text-xs font-medium text-muted-foreground">📦 অফার বক্স (ড্যাশড বর্ডার)</Label>
                               <div>
                                 <Label className="text-xs text-muted-foreground">প্রাইস লাইন (গোল্ডেন টেক্সট)</Label>
                                 <Input
                                   value={formData.discount_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, discount_text: e.target.value }))}
                                   placeholder="মাত্র ২০০০ টাকায়"
                                   className="h-8 text-sm"
                                 />
                               </div>
                               <div>
                                 <Label className="text-xs text-muted-foreground">অফার আইটেম (সাদা টেক্সট)</Label>
                                 <Input
                                   value={formData.offer_details}
                                   onChange={(e) => setFormData(prev => ({ ...prev, offer_details: e.target.value }))}
                                   placeholder="৪ সেট কোয়ালিটি থ্রি-পিস"
                                   className="h-8 text-sm"
                                 />
                               </div>
                             </div>

                             {/* Countdown Toggle */}
                             <div className="flex items-center gap-2">
                               <Switch
                                 checked={formData.show_countdown}
                                 onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_countdown: checked }))}
                                 className="scale-75"
                               />
                               <Label className="text-xs">কাউন্টডাউন টাইমার দেখান</Label>
                             </div>
                             {formData.show_countdown && (
                               <div>
                                 <Label className="text-xs text-muted-foreground">কাউন্টডাউন শেষ তারিখ</Label>
                                 <Input
                                   type="datetime-local"
                                   value={formData.countdown_end_date}
                                   onChange={(e) => setFormData(prev => ({ ...prev, countdown_end_date: e.target.value }))}
                                   className="h-8 text-sm"
                                 />
                               </div>
                             )}

                             {/* CTA Button Text */}
                             <div>
                               <Label className="text-xs text-muted-foreground">CTA বাটন টেক্সট</Label>
                               <Input
                                 value={formData.cta_button_text}
                                 onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                 placeholder="অর্ডার করতে এখানে ক্লিক করুন 🛒"
                                 className="h-8 text-sm"
                               />
                             </div>

                             {/* Urgency Text */}
                             <div>
                               <Label className="text-xs text-muted-foreground">আর্জেন্সি টেক্সট (বাটনের নিচে)</Label>
                               <Input
                                 value={formData.cta_urgency_text}
                                 onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                 placeholder="⚠️ অফারটি শেষ হওয়ার আগেই লুফে নিন!"
                                 className="h-8 text-sm"
                               />
                             </div>
                           </div>
                         );
                       }
                       
                        // Template 07 (Gadget) specific hero editor
                        const isTemplate07 = formData.template_id === 'template-07-gadget';
                        
                        if (isTemplate07) {
                          return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (গ্যাজেট)</Label>
                              
                              {/* Badge/Small Title */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ছোট টাইটেল (ব্যাজ)</Label>
                                <Input
                                  value={formData.hero_badge_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                  placeholder="🔥 স্পেশাল গ্যাজেট অফার 🔥"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Countdown */}
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={formData.show_countdown}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_countdown: checked }))}
                                  className="scale-75"
                                />
                                <Label className="text-xs">কাউন্টডাউন টাইমার দেখান</Label>
                              </div>
                              {formData.show_countdown && (
                                <>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">কাউন্টডাউন শেষ তারিখ</Label>
                                    <Input
                                      type="datetime-local"
                                      value={formData.countdown_end_date}
                                      onChange={(e) => setFormData(prev => ({ ...prev, countdown_end_date: e.target.value }))}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">কাউন্টডাউন উপরের টেক্সট</Label>
                                    <Input
                                      value={formData.cta_urgency_text}
                                      onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                      placeholder="⏰ অফার শেষ হতে বাকি"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Main Heading */}
                              <div>
                                <Label className="text-xs text-muted-foreground">মেইন হেডলাইন</Label>
                                <Textarea
                                  value={formData.hero_headline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                  placeholder="প্রিমিয়াম গ্যাজেট"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Sub Headline / Product Name */}
                              <div>
                                <Label className="text-xs text-muted-foreground">সাবহেডলাইন / প্রোডাক্ট নেম</Label>
                                <Input
                                  value={formData.hero_subheadline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                  placeholder="হাই কোয়ালিটি ব্লুটুথ ইয়ারবাড"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Discount Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ডিসকাউন্ট ব্যাজ (লাল)</Label>
                                <Input
                                  value={formData.discount_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, discount_text: e.target.value }))}
                                  placeholder="৩০% অফ"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* CTA Button */}
                              <div>
                                <Label className="text-xs text-muted-foreground">CTA বাটন টেক্সট</Label>
                                <Input
                                  value={formData.cta_button_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                  placeholder="🛒 এখনই অর্ডার করুন"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Hero Image */}
                              {formData.template_styles?.hero?.design === '03' && <p className="text-xs text-muted-foreground">প্রথম ছবি বড় করে দেখাবে; আরও ছবি যোগ করলে বড় ছবির নিচে ছোট ছবির স্লাইডার আসবে।</p>}
                              <ImageGrid images={formData.hero_images} target="hero" />
                            </div>
                          );
                         }

                        // Template 09 (Super Food) specific hero editor
                        const isTemplate09 = formData.template_id === 'template-09-superfood';
                        
                        if (isTemplate09) {
                          return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (সুপার ফুড)</Label>
                              
                              {/* Main Heading */}
                              <div>
                                <Label className="text-xs text-muted-foreground">মেইন হেডলাইন</Label>
                                <Textarea
                                  value={formData.hero_headline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                  placeholder="গ্যারান্টি সহকারে উচ্চরক্তচাপ ও ফ্যাটি লিভার কমাবে"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Badge (Free Delivery etc) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ব্যাজ টেক্সট (পালস এনিমেশন সহ)</Label>
                                <Input
                                  value={formData.hero_badge_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                  placeholder="ডেলিভারি চার্জ একদম ফ্রি!"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Video URL */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ভিডিও URL (YouTube)</Label>
                                <Input
                                  value={formData.hero_video_url}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Sub Headline (Short Title) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">শর্ট টাইটেল (ভিডিওর নিচে)</Label>
                                <Input
                                  value={formData.hero_subheadline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                  placeholder="প্রাকৃতিক উপায়ে সুস্থ থাকুন প্রতিদিন"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* CTA Button Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">অর্ডার বাটন টেক্সট</Label>
                                <Input
                                  value={formData.cta_button_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                  placeholder="অর্ডার করতে চাই"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Colors */}
                              <div className="border rounded-lg p-2 space-y-2 bg-background">
                                <Label className="text-xs font-medium text-muted-foreground">🎨 কালার সেটিংস</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">কার্ড ব্যাকগ্রাউন্ড</Label>
                                    <div className="flex gap-1">
                                      <Input type="color" value={formData.background_color} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                      <Input value={formData.background_color} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">ব্যাজ কালার</Label>
                                    <div className="flex gap-1">
                                      <Input type="color" value={formData.accent_color} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                      <Input value={formData.accent_color} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">হেডলাইন কালার</Label>
                                    <div className="flex gap-1">
                                      <Input type="color" value={formData.headline_color} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                      <Input value={formData.headline_color} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">বাটন কালার</Label>
                                    <div className="flex gap-1">
                                      <Input type="color" value={formData.button_color} onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                      <Input value={formData.button_color} onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Hero Image (fallback when no video) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">প্রোডাক্ট ইমেজ (ভিডিও না থাকলে দেখাবে)</Label>
                                <ImageGrid images={formData.hero_images} target="hero" />
                              </div>
                            </div>
                          );
                        }

                        // Template 08 (Minimal/Promo Card) specific hero editor
                        const isTemplate08 = formData.template_id === 'template-08-minimal';
                        
                        if (isTemplate08) {
                          return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (প্রোমো কার্ড)</Label>
                              
                              {/* Header Heading */}
                              <div>
                                <Label className="text-xs text-muted-foreground">হেডিং (অরেঞ্জ হেডার টেক্সট)</Label>
                                <Textarea
                                  value={formData.hero_headline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                  placeholder="ঘরে বসে মুহূর্তেই তৈরি করুন নির্ভেজাল সুস্বাদু দই"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Colors */}
                              <div className="border rounded-lg p-2 space-y-2 bg-background">
                                <Label className="text-xs font-medium text-muted-foreground">🎨 কালার সেটিংস</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">হেডার ব্যাকগ্রাউন্ড</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">কার্ড ব্যাকগ্রাউন্ড</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.background_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.background_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">বর্ডার কালার</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.accent_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.accent_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">বাটন কালার</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.button_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.button_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">টাইটেল কালার</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.headline_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.headline_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">সাবটাইটেল কালার</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="color"
                                        value={formData.text_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                                        className="h-8 w-10 p-0.5"
                                      />
                                      <Input
                                        value={formData.text_color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                                        className="h-8 text-xs flex-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Title (টাইটেল) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">টাইটেল (গাঢ় টেক্সট)</Label>
                                <Textarea
                                  value={formData.hero_subheadline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                  placeholder="তীব্র গরমে শরীরে প্রয়োজনীয় পুষ্টি জোগাতে"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Subtitle (সাবটাইটেল / হাইলাইট) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">সাবটাইটেল (হাইলাইট টেক্সট)</Label>
                                <Textarea
                                  value={formData.hero_badge_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                  placeholder="অটোমেটিক দই মেকার!"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Video URL */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ভিডিও URL (YouTube)</Label>
                                <Input
                                  value={formData.hero_video_url}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Offer Box */}
                              <div className="border rounded-lg p-2 space-y-2 bg-background">
                                <Label className="text-xs font-medium text-muted-foreground">📦 অফার বক্স (বর্ডার বক্সের মধ্যে)</Label>
                                <Textarea
                                  value={formData.offer_details}
                                  onChange={(e) => setFormData(prev => ({ ...prev, offer_details: e.target.value }))}
                                  placeholder="৩০% ডিসকাউন্ট সাথে ফ্রি ডেলিভারি শুধুমাত্র আজকের জন্য! ১ টাকা অগ্রীম ছাড়া এখনি অর্ডার করুন।"
                                  className="min-h-[60px] text-sm"
                                />
                                <p className="text-[10px] text-muted-foreground">HTML সাপোর্টেড: &lt;span style="color:#f39c12"&gt;গোল্ডেন টেক্সট&lt;/span&gt;</p>
                              </div>
                              
                              {/* CTA Button Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">অর্ডার বাটন টেক্সট</Label>
                                <Input
                                  value={formData.cta_button_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                  placeholder="অর্ডার করতে চাই"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Hero Image (fallback when no video) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">প্রোডাক্ট ইমেজ (ভিডিও না থাকলে দেখাবে)</Label>
                                <ImageGrid images={formData.hero_images} target="hero" />
                              </div>
                            </div>
                          );
                        }

                        // Template 06 (Attar/Perfume) specific hero editor
                         const isTemplate06 = formData.template_id === 'template-06-panjabi';
                         
                         if (isTemplate06) {
                          return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (আতর)</Label>
                              
                              {/* Badge Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ব্যাজ টেক্সট (উপরে ছোট লেখা)</Label>
                                <Input
                                  value={formData.hero_badge_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                  placeholder="প্রিমিয়াম পারফিউম কালেকশন"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Main Headline - Line 1 (Dark/Primary color) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">মেইন হেডলাইন (১ম লাইন - প্রাইমারি কালার)</Label>
                                <Textarea
                                  value={formData.hero_headline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                  placeholder="আপনার ব্যক্তিত্বকে করুন"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>
                              
                              {/* Sub Headline - Line 2 (Accent/Green color) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">সাবহেডলাইন (২য় লাইন - অ্যাকসেন্ট কালার)</Label>
                                <Input
                                  value={formData.hero_subheadline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                  placeholder="মায়াবী ও অতুলনীয়"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Offer Details (Free Delivery Badge) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">অফার ডিটেইলস (সবুজ ব্যাজ)</Label>
                                <Input
                                  value={formData.offer_details}
                                  onChange={(e) => setFormData(prev => ({ ...prev, offer_details: e.target.value }))}
                                  placeholder="সারা বাংলাদেশে ফ্রি হোম ডেলিভারি"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Discount Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ডিসকাউন্ট টেক্সট (লাল ব্যাজ)</Label>
                                <Input
                                  value={formData.discount_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, discount_text: e.target.value }))}
                                  placeholder="৩৫% অফ"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* CTA Button Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">CTA বাটন টেক্সট</Label>
                                <Input
                                  value={formData.cta_button_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                  placeholder="অর্ডার করতে চাই"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Urgency Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">আর্জেন্সি টেক্সট (বাটনের নিচে)</Label>
                                <Input
                                  value={formData.cta_urgency_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                  placeholder="সীমিত স্টক! মিস করবেন না"
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {/* Hero Image */}
                              <ImageGrid images={formData.hero_images} target="hero" />
                            </div>
                          );
                        }

                         // Template 10 (Super Food 2) specific hero editor
                         const isTemplate10 = formData.template_id === 'template-10-superfood2';
                         
                         if (isTemplate10) {
                           return (
                             <div className="p-3 bg-muted/30 space-y-2">
                               <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (সুপার ফুড ২)</Label>
                               
                               {/* Badge Text (Short Subheading) */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">ব্যাজ টেক্সট (ছোট সাবহেডিং)</Label>
                                 <Input
                                   value={formData.hero_badge_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                   placeholder="🌱 ১০০% প্রাকৃতিক সুপারফুড"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Main Headline */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">মেইন হেডলাইন (১ম লাইন)</Label>
                                 <Textarea
                                   value={formData.hero_headline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                   placeholder="সুস্বাস্থ্য নিশ্চিত করুন"
                                   className="min-h-[50px] text-sm"
                                 />
                               </div>

                               {/* Headline 2nd Line (Accent Color) */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">হেডলাইন ২য় লাইন (অ্যাকসেন্ট কালারে দেখাবে)</Label>
                                 <Input
                                   value={formData.discount_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, discount_text: e.target.value }))}
                                   placeholder="সেরা সুপারফুডে"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Subheadline / Description */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">সাবহেডিং / সর্ট ডিস্ক্রিপশন</Label>
                                 <Textarea
                                   value={formData.hero_subheadline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                   placeholder="শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়াতে আমাদের প্রিমিয়াম পণ্যগুলো কার্যকরী।"
                                   className="min-h-[50px] text-sm"
                                 />
                               </div>

                               {/* CTA Button Text */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">অর্ডার বাটন টেক্সট</Label>
                                 <Input
                                   value={formData.cta_button_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                   placeholder="এখনই কিনুন"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Colors */}
                               <div className="border rounded-lg p-2 space-y-2 bg-background">
                                 <Label className="text-xs font-medium text-muted-foreground">🎨 কালার সেটিংস</Label>
                                 <div className="grid grid-cols-2 gap-2">
                                   <div>
                                     <Label className="text-xs text-muted-foreground">গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড</Label>
                                     <div className="flex gap-1">
                                       <Input type="color" value={formData.background_color} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                       <Input value={formData.background_color} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                     </div>
                                   </div>
                                   <div>
                                     <Label className="text-xs text-muted-foreground">গ্রেডিয়েন্ট প্রাইমারি</Label>
                                     <div className="flex gap-1">
                                       <Input type="color" value={formData.primary_color} onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                       <Input value={formData.primary_color} onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                     </div>
                                   </div>
                                   <div>
                                     <Label className="text-xs text-muted-foreground">অ্যাকসেন্ট / বাটন কালার</Label>
                                     <div className="flex gap-1">
                                       <Input type="color" value={formData.accent_color} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                       <Input value={formData.accent_color} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                     </div>
                                   </div>
                                   <div>
                                     <Label className="text-xs text-muted-foreground">হেডলাইন কালার</Label>
                                     <div className="flex gap-1">
                                       <Input type="color" value={formData.headline_color} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                       <Input value={formData.headline_color} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} className="h-8 text-xs flex-1" />
                                     </div>
                                   </div>
                                 </div>
                               </div>

                                  {/* Product Grid in Hero (uses hero_images) */}
                                  <div className="border rounded-lg p-2 space-y-2 bg-background mt-2">
                                    <Label className="text-xs font-medium text-muted-foreground">📦 প্রোডাক্ট গ্রিড (হিরো সেকশনে দেখাবে)</Label>
                                    <Input
                                      value={formData.gallery_title}
                                      onChange={(e) => setFormData(prev => ({ ...prev, gallery_title: e.target.value }))}
                                      placeholder="হেডিং (যেমন: আমাদের প্রডাক্ট সমূহ)"
                                      className="h-8 text-sm"
                                    />
                                    <div>
                                      <Label className="text-xs text-muted-foreground">মুদ্রা চিহ্ন</Label>
                                      <Input
                                        value={formData.price_unit}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price_unit: e.target.value }))}
                                        placeholder="৳"
                                        className="h-8 text-sm w-20"
                                      />
                                    </div>
                                    <ImageGrid images={formData.hero_images} target="hero" />
                                    
                                    {/* Per-image price tags */}
                                    {formData.hero_images.length > 0 && (
                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground">💰 প্রতিটি ইমেজের প্রাইস ট্যাগ</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                          {formData.hero_images.map((img, idx) => (
                                            <div key={idx} className="flex items-center gap-1">
                                              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                              </div>
                                              <Input
                                                type="number"
                                                value={formData.gallery_product_prices[idx] || ''}
                                                onChange={(e) => {
                                                  const newPrices = [...formData.gallery_product_prices];
                                                  while (newPrices.length <= idx) newPrices.push(0);
                                                  newPrices[idx] = Number(e.target.value);
                                                  setFormData(prev => ({ ...prev, gallery_product_prices: newPrices }));
                                                }}
                                                placeholder={`ইমেজ ${idx + 1} প্রাইস`}
                                                className="h-7 text-xs flex-1"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                               </div>
                             );
                           }
                         // Template 11 (Super Food 3) specific hero editor
                         const isTemplate11 = formData.template_id === 'template-11-superfood3';
                         
                         if (isTemplate11) {
                           return (
                             <div className="p-3 bg-muted/30 space-y-2">
                               <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (সুপার ফুড ৩)</Label>
                               
                               {/* Offer Badge Text */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">🔥 অফার ব্যাজ টেক্সট</Label>
                                 <Input
                                   value={formData.hero_badge_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                   placeholder="🔥 ৫০% ডিসকাউন্ট অফার!"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Urgency Text */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">⚡ আর্জেন্সি টেক্সট</Label>
                                 <Input
                                   value={formData.cta_urgency_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                   placeholder="সীমিত স্টক! মিস করবেন না"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Countdown Toggle */}
                               <div className="flex items-center gap-2">
                                 <Switch
                                   checked={formData.show_countdown}
                                   onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_countdown: checked }))}
                                   className="scale-75"
                                 />
                                 <Label className="text-xs">⏰ কাউন্টডাউন টাইমার দেখান</Label>
                               </div>
                               {formData.show_countdown && (
                                 <div>
                                   <Label className="text-xs text-muted-foreground">কাউন্টডাউন শেষ তারিখ</Label>
                                   <Input
                                     type="datetime-local"
                                     value={formData.countdown_end_date}
                                     onChange={(e) => setFormData(prev => ({ ...prev, countdown_end_date: e.target.value }))}
                                     className="h-8 text-sm"
                                   />
                                 </div>
                               )}

                               {/* Headline */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">📝 হেডলাইন</Label>
                                 <Textarea
                                   value={formData.hero_headline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                   placeholder="আপনার প্রিমিয়াম প্রোডাক্টের আকর্ষণীয় নাম দিন"
                                   className="min-h-[50px] text-sm"
                                 />
                               </div>

                               {/* Short Description */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">📄 শর্ট ডেসক্রিপশন</Label>
                                 <Textarea
                                   value={formData.hero_subheadline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                   placeholder="সেরা মানের এবং আধুনিক ডিজাইনের এই প্রোডাক্টটি..."
                                   className="min-h-[40px] text-sm"
                                 />
                               </div>

                               {/* Hero Image */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">🖼️ প্রোডাক্ট ইমেজ</Label>
                                 <ImageGrid images={formData.hero_images} target="hero" />
                               </div>

                               {/* Video URL (embedded in hero) */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">🎬 ভিডিও URL (হিরোতে দেখাবে)</Label>
                                 <Input
                                   value={formData.hero_video_url}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                   placeholder="https://www.youtube.com/watch?v=..."
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* CTA Button Text */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">🛒 অর্ডার বাটন টেক্সট</Label>
                                 <Input
                                   value={formData.cta_button_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                   placeholder="অর্ডার করুন"
                                   className="h-8 text-sm"
                                 />
                               </div>
                             </div>
                           );
                          }

                          // Template 12 (Gadget 3) specific hero editor - Fullscreen BG Image
                          const isTemplate12 = formData.template_id === 'template-12-gadget3';
                          
                          if (isTemplate12) {
                            return (
                              <div className="p-3 bg-muted/30 space-y-2">
                                <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (গ্যাজেট ৩)</Label>

                                {/* Header Title Text */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">🏷️ হেডার টাইটেল (GadgetStore)</Label>
                                  <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="GadgetStore"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                
                                {/* Badge Text */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">🔥 ব্যাজ টেক্সট (পালস অ্যানিমেশন)</Label>
                                  <Input
                                    value={formData.hero_badge_text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                    placeholder="সীমিত সময়ের অফার!"
                                    className="h-8 text-sm"
                                  />
                                </div>

                                {/* Main Heading (white text) */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">📝 মেইন হেডলাইন (সাদা টেক্সট)</Label>
                                  <Textarea
                                    value={formData.hero_headline}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                    placeholder="আপনার গেমিং অভিজ্ঞতাকে করুন"
                                    className="min-h-[50px] text-sm"
                                  />
                                </div>

                                {/* Highlighted Text (gradient color) */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">✨ হাইলাইটেড টেক্সট (গ্রাডিয়েন্ট কালার)</Label>
                                  <Input
                                    value={formData.hero_subheadline}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                    placeholder="আরো স্মার্ট!"
                                    className="h-8 text-sm"
                                  />
                                </div>

                                {/* Description */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">📄 ডিসক্রিপশন</Label>
                                  <Textarea
                                    value={formData.offer_details}
                                    onChange={(e) => setFormData(prev => ({ ...prev, offer_details: e.target.value }))}
                                    placeholder="সেরা কোয়ালিটি এবং প্রিমিয়াম ডিজাইনের ব্লুটুথ হেডফোন, এখন বিশেষ ডিসকাউন্টে।"
                                    className="min-h-[50px] text-sm"
                                  />
                                </div>

                                {/* CTA Button Text */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">🛒 CTA বাটন টেক্সট</Label>
                                  <Input
                                    value={formData.cta_button_text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                    placeholder="অফারটি লুফে নিন"
                                    className="h-8 text-sm"
                                  />
                                </div>

                                {/* Phone Number for Header */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">📞 হেডারে ফোন নাম্বার</Label>
                                  <Input
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                                    placeholder="01XXXXXXXXX"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">📞 ফোন লিংক (tel:)</Label>
                                  <Input
                                    value={formData.contact_phone_link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone_link: e.target.value }))}
                                    placeholder="tel:01XXXXXXXXX"
                                    className="h-8 text-sm"
                                  />
                                </div>

                                {/* Color Settings */}
                                <div className="border rounded-lg p-2 space-y-2 bg-background">
                                  <Label className="text-xs font-medium text-muted-foreground">🎨 কালার সেটিংস</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">হেডার কালার</Label>
                                      <div className="flex gap-1">
                                        <Input type="color" value={formData.primary_color || '#0f172a'} onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                        <Input value={formData.primary_color || '#0f172a'} onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))} placeholder="#0f172a" className="h-8 text-xs flex-1" />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">ব্যাকগ্রাউন্ড কালার</Label>
                                      <div className="flex gap-1">
                                        <Input type="color" value={formData.background_color || '#0f172a'} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                        <Input value={formData.background_color || '#0f172a'} onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))} placeholder="#0f172a" className="h-8 text-xs flex-1" />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">বাটন কালার</Label>
                                      <div className="flex gap-1">
                                        <Input type="color" value={formData.button_color || '#ff4757'} onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                        <Input value={formData.button_color || '#ff4757'} onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))} placeholder="#ff4757" className="h-8 text-xs flex-1" />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">অ্যাকসেন্ট কালার</Label>
                                      <div className="flex gap-1">
                                        <Input type="color" value={formData.accent_color || '#ff4757'} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                        <Input value={formData.accent_color || '#ff4757'} onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))} placeholder="#ff4757" className="h-8 text-xs flex-1" />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">হেডলাইন কালার</Label>
                                      <div className="flex gap-1">
                                        <Input type="color" value={formData.headline_color || '#ffffff'} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} className="h-8 w-10 p-0.5" />
                                        <Input value={formData.headline_color || '#ffffff'} onChange={(e) => setFormData(prev => ({ ...prev, headline_color: e.target.value }))} placeholder="#ffffff" className="h-8 text-xs flex-1" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Hero Images */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">🖼️ হিরো ইমেজ (স্লাইডার)</Label>
                                  <ImageGrid images={formData.hero_images} target="hero" />
                                </div>

                                {/* Hero Video URL */}
                                <div>
                                  <Label className="text-xs text-muted-foreground">🎬 হিরো ভিডিও URL (YouTube)</Label>
                                  <Input
                                    value={formData.hero_video_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            );
                          }

                         // Template 13 (Natural Card) specific hero editor
                         const isTemplate13 = formData.template_id === 'template-13-natural-card';
                         
                         if (isTemplate13) {
                           return (
                             <div className="p-3 bg-muted/30 space-y-2">
                               <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (ন্যাচারাল কার্ড)</Label>
                               
                               {/* Main Heading */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">মেইন হেডলাইন</Label>
                                 <Textarea
                                   value={formData.hero_headline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                   placeholder="☘️রূপচর্চায় ব্যবহার করুন প্রাকৃতিক উপাদান☘️"
                                   className="min-h-[50px] text-sm"
                                 />
                               </div>

                               {/* Sub Headline (accent color text) */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">সাবহেডলাইন (অ্যাকসেন্ট কালারে দেখাবে)</Label>
                                 <Input
                                   value={formData.hero_subheadline}
                                   onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                   placeholder="প্রকৃতির মধ্যে রয়েছে সকল সমস্যার সমাধান"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Badge & Urgency */}
                               <div className="grid grid-cols-2 gap-2">
                                 <div>
                                   <Label className="text-xs text-muted-foreground">ব্যাজ টেক্সট</Label>
                                   <Input
                                     value={formData.hero_badge_text}
                                     onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                     placeholder="🌿 ১০০% অর্গানিক ও প্রাকৃতিক"
                                     className="h-8 text-sm"
                                   />
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">আর্জেন্সি টেক্সট</Label>
                                   <Input
                                     value={formData.cta_urgency_text}
                                     onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                     placeholder="সীমিত স্টক! মিস করবেন না"
                                     className="h-8 text-sm"
                                   />
                                 </div>
                               </div>

                               {/* CTA Button Text */}
                               <div>
                                 <Label className="text-xs text-muted-foreground">CTA বাটন টেক্সট</Label>
                                 <Input
                                   value={formData.cta_button_text}
                                   onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                   placeholder="অর্ডার করুন"
                                   className="h-8 text-sm"
                                 />
                               </div>

                               {/* Hero Images */}
                               <ImageGrid images={formData.hero_images} target="hero" />
                             </div>
                           );
                         }

                        // Template 14 (Video Organic) specific hero editor
                        const isTemplate14 = formData.template_id === 'template-14-video-organic';
                        
                        if (isTemplate14) {
                          return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস (ভিডিও অর্গানিক)</Label>
                              
                              {/* Main Heading */}
                              <div>
                                <Label className="text-xs text-muted-foreground">মেইন হেডিং (গ্রিন হেডার বক্স)</Label>
                                <Textarea
                                  value={formData.hero_headline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                  placeholder="পুষ্টির ঘাটতি পূরণ, শারীরিক শক্তি ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি..."
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Sub Heading */}
                              <div>
                                <Label className="text-xs text-muted-foreground">সাব হেডিং (গ্রিন টেক্সট)</Label>
                                <Input
                                  value={formData.hero_subheadline}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                                  placeholder="আমাদের 11 টি প্রোডাক্ট আপনি কীভাবে হাতে পাবেন দেখুন"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Video URL */}
                              <div>
                                <Label className="text-xs text-muted-foreground">ভিডিও লিঙ্ক (YouTube)</Label>
                                <Input
                                  value={formData.hero_video_url}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Short Description */}
                              <div>
                                <Label className="text-xs text-muted-foreground">সর্ট ডিস্ক্রিপশন (ভিডিওর নিচে)</Label>
                                <Textarea
                                  value={formData.offer_details}
                                  onChange={(e) => setFormData(prev => ({ ...prev, offer_details: e.target.value }))}
                                  placeholder="সম্পূর্ণ অর্গানিক উপাদান দিয়ে তৈরি (কোন পার্শ্ব প্রতিক্রিয়া নেই)"
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* CTA Button Text */}
                              <div>
                                <Label className="text-xs text-muted-foreground">অর্ডার বাটন টেক্সট</Label>
                                <Input
                                  value={formData.cta_button_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                                  placeholder="অর্ডার করুন"
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Hero Image (fallback when no video) */}
                              <div>
                                <Label className="text-xs text-muted-foreground">প্রোডাক্ট ইমেজ (ভিডিও না থাকলে দেখাবে)</Label>
                                <ImageGrid images={formData.hero_images} target="hero" />
                              </div>
                            </div>
                          );
                        }

                             // Default hero editor for all other templates (unchanged)
                         return (
                            <div className="p-3 bg-muted/30 space-y-2">
                              <Label className="text-xs font-medium">হিরো সেকশন সেটিংস</Label>
                              <Textarea
                                value={formData.hero_headline}
                                onChange={(e) => setFormData(prev => ({ ...prev, hero_headline: e.target.value }))}
                                placeholder="হেডলাইন"
                                className="min-h-[50px] text-sm"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  value={formData.hero_badge_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, hero_badge_text: e.target.value }))}
                                  placeholder="ব্যাজ টেক্সট"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  value={formData.cta_urgency_text}
                                  onChange={(e) => setFormData(prev => ({ ...prev, cta_urgency_text: e.target.value }))}
                                  placeholder="আর্জেন্সি টেক্সট"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <ImageGrid images={formData.hero_images} target="hero" />
                            </div>
                          );
                     case 'video':
                      return (
                        <div className="p-3 bg-muted/30 space-y-2">
                          <Label className="text-xs font-medium">ভিডিও সেকশন সেটিংস</Label>
                          <Input
                            value={formData.hero_video_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="h-8 text-sm"
                          />
                        </div>
                      );
                    case 'gallery':
                       if (isTemplate01) return (
                         <div className="p-3 bg-muted/30 space-y-4">
                           <Label className="text-sm font-semibold">গ্যালারি সেকশন</Label>
                           <div role="radiogroup" aria-label="গ্যালারি ডিজাইন" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {galleryDesigns.map(design => <Button key={design.id} type="button" role="radio"
                               aria-checked={formData.template_styles?.gallery?.design === design.id}
                                variant="outline" className={`h-auto min-h-28 flex-col items-stretch gap-2 whitespace-normal text-left p-2 ${formData.template_styles?.gallery?.design === design.id ? "border-primary bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground ring-2 ring-primary/30" : ""}`}
                               onClick={() => setFormData(prev => ({ ...prev, gallery_variant: prev.template_styles?.gallery?.design === design.id ? (salesPage?.gallery_variant ?? "01") : design.id, template_styles: { ...prev.template_styles, gallery: toggleSectionDesign(prev.template_styles?.gallery, design.id) } }))}>
                               <span aria-hidden="true" className={`gallery-design-demo gallery-design-demo--${design.id}`}>
                                 {[0, 1, 2].map(index => <span key={index} className="gallery-design-demo-tile">{formData.gallery_images[index] ? <img src={formData.gallery_images[index]} alt="" /> : <ImageIcon size={15} />}</span>)}
                               </span>
                               <span className="text-xs font-semibold">{design.id} · {design.label}</span>
                               <span className="text-[10px] text-muted-foreground">{design.description}</span>
                             </Button>)}
                           </div>
                           <div className="space-y-2 border-t border-border pt-3">
                             <Label htmlFor="gallery-heading">গ্যালারির লেখা</Label>
                             <Input id="gallery-heading" value={formData.template_styles?.gallery?.text_heading ?? formData.gallery_title} placeholder="শিরোনাম" onChange={e => setFormData(prev => ({ ...prev, gallery_title: e.target.value, template_styles: { ...prev.template_styles, gallery: { ...prev.template_styles?.gallery, text_heading: e.target.value } } }))} />
                             <Input aria-label="গ্যালারির বর্ণনা" value={formData.template_styles?.gallery?.text_subtitle ?? formData.gallery_subtitle} placeholder="বর্ণনা" onChange={e => setFormData(prev => ({ ...prev, gallery_subtitle: e.target.value, template_styles: { ...prev.template_styles, gallery: { ...prev.template_styles?.gallery, text_subtitle: e.target.value } } }))} />
                              {([{ key: "caption", label: "ছবির নিচের নাম", placeholder: "কালেকশন" }, { key: "order", label: "অর্ডার বোতামের লেখা", placeholder: "অর্ডার করুন" }, { key: "imageAlt", label: "ছবির বর্ণনা", placeholder: "কালেকশনের ছবি" }, { key: "close", label: "ছবি বন্ধের বোতাম", placeholder: "ছবি বন্ধ করুন" }] as const).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`gallery-text-${field.key}`} className="text-xs">{field.label}</Label><Input id={`gallery-text-${field.key}`} className="h-8 text-sm" placeholder={field.placeholder} value={formData.template_styles?.gallery?.[`text_${field.key}`] ?? ""} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, gallery: { ...prev.template_styles?.gallery, [`text_${field.key}`]: e.target.value } } }))} /></div>)}
                           </div>
                           <ImageGrid images={formData.gallery_images} target="gallery" />
                           <div className="space-y-3 border-t border-border pt-3">
                             <Label className="text-sm font-semibold">গ্যালারির রং</Label>
                             {galleryColorGroups.map(group => <div key={group.label} className="space-y-2"><p className="text-xs text-muted-foreground">{group.label}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{group.fields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`gallery-color-${field.key}`} className="text-xs leading-tight">{field.label}</Label><div className="flex items-center gap-1 shrink-0"><Input id={`gallery-color-${field.key}`} aria-label={field.label} type="color" className="h-8 w-9 cursor-pointer p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(formData.template_styles?.gallery?.[field.key] || "") ? formData.template_styles.gallery[field.key] : galleryPalette[getGalleryDesign(formData.template_styles?.gallery?.design)][field.key]} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, gallery: { ...prev.template_styles?.gallery, [field.key]: e.target.value } } }))} /><Input className="h-8 w-20 text-xs" maxLength={7} placeholder="#000000" aria-label={`${field.label} হেক্স রং`} value={formData.template_styles?.gallery?.[field.key] ?? ""} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, gallery: { ...prev.template_styles?.gallery, [field.key]: e.target.value } } }))} />{formData.template_styles?.gallery?.[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`${field.label} আগের রং ফিরিয়ে আনুন`} onClick={() => setFormData(prev => { const gallery = { ...prev.template_styles?.gallery }; delete gallery[field.key]; return { ...prev, template_styles: { ...prev.template_styles, gallery } }; })}><X className="h-3 w-3" /></Button>}</div></div>)}</div></div>)}
                           </div>
                         </div>
                       );
                      // Template 10: Simple gallery (product grid is in hero)
                      if (formData.template_id === 'template-10-superfood2') {
                        return (
                          <div className="p-3 bg-muted/30 space-y-2">
                            <Label className="text-xs font-medium">🖼️ গ্যালারি সেকশন (ইমেজ শোকেস)</Label>
                            <Input
                              value={formData.gallery_title}
                              onChange={(e) => setFormData(prev => ({ ...prev, gallery_title: e.target.value }))}
                              placeholder="গ্যালারি শিরোনাম"
                              className="h-8 text-sm"
                            />
                            <Input
                              value={formData.gallery_subtitle}
                              onChange={(e) => setFormData(prev => ({ ...prev, gallery_subtitle: e.target.value }))}
                              placeholder="গ্যালারি সাবটাইটেল"
                              className="h-8 text-sm"
                            />
                            <ImageGrid images={formData.gallery_images} target="gallery" />
                          </div>
                        );
                      }
                      return (
                        <div className="p-3 bg-muted/30 space-y-2">
                          <Label className="text-xs font-medium">গ্যালারি সেকশন</Label>
                          <Input
                            value={formData.gallery_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, gallery_title: e.target.value }))}
                            placeholder="গ্যালারি শিরোনাম (যেমন: আমাদের সার্টিফিকেশন)"
                            className="h-8 text-sm"
                          />
                          <Input
                            value={formData.gallery_subtitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, gallery_subtitle: e.target.value }))}
                            placeholder="গ্যালারি সাবটাইটেল"
                            className="h-8 text-sm"
                          />
                          <ImageGrid images={formData.gallery_images} target="gallery" />
                        </div>
                      );
                    case 'features':
                      return (
                         <div className="p-3 bg-muted/30 space-y-4">
                           <Label className="text-sm font-semibold">ফিচার সেকশন</Label>
                           {isTemplate01 && <div role="radiogroup" aria-label="ফিচার ডিজাইন" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {featureDesigns.map(design => <Button key={design.id} type="button" role="radio"
                               aria-checked={formData.template_styles?.features?.design === design.id}
                                 variant="outline" className={`h-auto min-h-24 flex-col items-stretch gap-1 whitespace-normal text-left p-2 ${formData.template_styles?.features?.design === design.id ? "border-primary bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground ring-2 ring-primary/30" : ""}`}
                               onClick={() => setFormData(prev => ({ ...prev, feature_variant: prev.template_styles?.features?.design === design.id ? (salesPage?.feature_variant ?? "01") : design.id,
                                 template_styles: { ...prev.template_styles, features: toggleSectionDesign(prev.template_styles?.features, design.id) } }))}>
                                <span aria-hidden="true" className={`feature-design-demo feature-design-demo--${design.id}`}><span/><span/><span/></span>
                                <span className="text-xs font-semibold">{design.id} · {design.label}</span>
                               <span className="text-[10px] text-muted-foreground">{design.description}</span>
                             </Button>)}
                           </div>}
                          <Input
                            value={formData.features_headline}
                            onChange={(e) => setFormData(prev => ({ ...prev, features_headline: e.target.value }))}
                            placeholder="হেডলাইন (যেমন: কি কি থাকছে?)"
                            className="h-8 text-sm"
                          />
                          <Input
                            value={formData.features_subheadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, features_subheadline: e.target.value }))}
                            placeholder="সাবহেডলাইন (যেমন: আমাদের বিশেষত্ব ও গ্যারান্টি)"
                            className="h-8 text-sm"
                          />
                           {formData.feature_points.map((feature, index) => (
                             <div key={index} className="space-y-1 rounded border border-border bg-background p-2">
                             <div className="flex items-center gap-1">
                              <Input
                                value={feature.icon}
                                onChange={(e) => {
                                  const newFeatures = [...formData.feature_points];
                                  newFeatures[index] = { ...newFeatures[index], icon: e.target.value };
                                  setFormData(prev => ({ ...prev, feature_points: newFeatures }));
                                }}
                                className="w-12 h-7 text-center text-sm"
                                placeholder="✅"
                              />
                              <Input
                                value={feature.text}
                                onChange={(e) => {
                                  const newFeatures = [...formData.feature_points];
                                  newFeatures[index] = { ...newFeatures[index], text: e.target.value };
                                  setFormData(prev => ({ ...prev, feature_points: newFeatures }));
                                }}
                                className="flex-1 h-7 text-sm"
                                placeholder="ফিচার টেক্সট"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  const newFeatures = formData.feature_points.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, feature_points: newFeatures }));
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                             </div>
                             <Input value={feature.description || ""} placeholder="ফিচারের বিস্তারিত লেখা"
                               aria-label={`ফিচার ${index + 1} বিস্তারিত লেখা`} className="h-8 text-sm"
                               onChange={e => setFormData(prev => ({ ...prev, feature_points: prev.feature_points.map((point, i) => i === index ? { ...point, description: e.target.value } : point) }))} />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              feature_points: [...prev.feature_points, { icon: '✅', text: '', description: '' }]
                            }))}
                          >
                             + ফিচার যোগ করুন
                          </Button>

                           {/* Optional image, also available for each of the six shared designs. */}
                           {((sectionDesignsAvailable && formData.template_styles?.features?.design) || formData.template_id === 'template-08-minimal' || formData.template_id === 'template-14-video-organic') && (
                            <div className="border rounded-lg p-2 space-y-2 bg-background">
                              <Label className="text-xs font-medium text-muted-foreground">🖼️ ফিচার সেকশন ইমেজ</Label>
                              {formData.feature_section_image ? (
                                <div className="relative group">
                                  <img 
                                    src={formData.feature_section_image} 
                                    alt="Feature" 
                                    className="w-full rounded border object-cover max-h-40" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, feature_section_image: "" }))}
                                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="border border-dashed rounded p-3 text-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50"
                                  onClick={() => triggerUpload("feature")}
                                >
                                   <Upload className="h-4 w-4 mx-auto mb-1" />
                                   ইমেজ আপলোড করুন
                                   <p className="text-[10px] mt-1 opacity-70">{getRecommendedSize("feature")}</p>
                                 </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={() => triggerUpload("feature")}
                                disabled={uploading}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {uploading ? "..." : "ইমেজ পরিবর্তন করুন"}
                              </Button>
                            </div>
                          )}

                          {/* Feature Section Images - Multiple/Carousel (Template 09) */}
                          {formData.template_id === 'template-09-superfood' && (
                            <div className="border rounded-lg p-2 space-y-2 bg-background">
                              <Label className="text-xs font-medium text-muted-foreground">🖼️ ফিচার ক্যারোসেল ইমেজ</Label>
                              {formData.feature_section_images.length > 0 && (
                                <div className="grid grid-cols-3 gap-1">
                                  {formData.feature_section_images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                      <img 
                                        src={img} 
                                        alt={`Feature ${idx + 1}`} 
                                        className="w-full rounded border object-cover h-20" 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ 
                                          ...prev, 
                                          feature_section_images: prev.feature_section_images.filter((_, i) => i !== idx) 
                                        }))}
                                        className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={() => triggerUpload("feature")}
                                disabled={uploading}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {uploading ? "..." : "ইমেজ যুক্ত করুন"}
                              </Button>
                            </div>
                          )}
                           {sectionDesignsAvailable && formData.template_styles?.features?.design && <>
                             <div className="space-y-1 border-t border-border pt-3">
                               <Label htmlFor="feature-image-alt" className="text-xs">ছবির বর্ণনা</Label>
                               <Input id="feature-image-alt" className="h-8 text-sm" placeholder="ফিচার ছবি"
                                 value={formData.template_styles?.features?.text_imageAlt ?? ""}
                                 onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, features: { ...prev.template_styles?.features, text_imageAlt: e.target.value } } }))} />
                             </div>
                             <div className="space-y-3 border-t border-border pt-3">
                               <Label className="text-sm font-semibold">ফিচারের রং</Label>
                               {featureColorGroups.map(group => <div key={group.label} className="space-y-2">
                                 <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                   {group.fields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2">
                                     <Label htmlFor={`feature-color-${field.key}`} className="text-xs leading-tight">{field.label}</Label>
                                     <div className="flex items-center gap-1 shrink-0">
                                       <Input id={`feature-color-${field.key}`} type="color" className="h-8 w-9 cursor-pointer p-0.5" aria-label={field.label}
                                         value={/^#[0-9a-fA-F]{6}$/.test(formData.template_styles?.features?.[field.key] || "") ? formData.template_styles.features[field.key] : featurePalette[getFeatureDesign(formData.template_styles?.features?.design)][field.key]}
                                         onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, features: { ...prev.template_styles?.features, [field.key]: e.target.value } } }))} />
                                       <Input className="h-8 w-20 text-xs" maxLength={7} placeholder="#000000" aria-label={`${field.label} হেক্স রং`}
                                         value={formData.template_styles?.features?.[field.key] ?? ""}
                                         onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, features: { ...prev.template_styles?.features, [field.key]: e.target.value } } }))} />
                                       {formData.template_styles?.features?.[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`${field.label} আগের রং ফিরিয়ে আনুন`} onClick={() => setFormData(prev => {
                                         const features = { ...prev.template_styles?.features }; delete features[field.key];
                                         return { ...prev, template_styles: { ...prev.template_styles, features } };
                                       })}><X className="h-3 w-3" /></Button>}
                                     </div>
                                   </div>)}
                                 </div>
                               </div>)}
                             </div>
                           </>}
                        </div>
                      );
                    case 'reviews':
                      return (
                        <div className="p-3 bg-muted/30 space-y-4">
                          <Label className="text-sm font-semibold">কাস্টমার ফিডব্যাক</Label>
                          <Label className="text-xs" htmlFor="reviews-headline">শিরোনাম</Label>
                          <Input
                            id="reviews-headline"
                            value={formData.reviews_headline}
                            onChange={(e) => setFormData(prev => ({ ...prev, reviews_headline: e.target.value }))}
                            placeholder="রিভিউ শিরোনাম (যেমন: সম্মানিত কাস্টমারদের মতামত)"
                            className="h-8 text-sm"
                          />
                          <Label className="text-xs" htmlFor="reviews-subheadline">শিরোনামের নিচের লেখা</Label>
                          <Input
                            id="reviews-subheadline"
                            value={formData.reviews_subheadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, reviews_subheadline: e.target.value }))}
                            placeholder="রিভিউ সাবটাইটেল"
                            className="h-8 text-sm"
                          />
                          <Label className="text-xs" htmlFor="reviews-video">রিভিউ ভিডিও লিংক</Label>
                          <Input
                            id="reviews-video"
                            value={formData.review_video_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, review_video_url: e.target.value }))}
                            placeholder="YouTube, Facebook, Vimeo বা সরাসরি ভিডিও লিংক"
                            className="h-8 text-sm"
                          />
                          <ImageGrid images={formData.review_images} target="review" />
                          {sectionDesignsAvailable && <><div className="space-y-2 border-t border-border pt-3">
                            <Label className="text-sm font-semibold">ফিডব্যাকের লেখা</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {reviewTextFields.map(field => <div key={field.key} className="space-y-1">
                                <Label htmlFor={`review-text-${field.key}`} className="text-xs">{field.label}</Label>
                                <Input id={`review-text-${field.key}`} className="h-9 text-sm" placeholder={field.defaultText}
                                  value={formData.template_styles?.reviews?.[`text_${field.key}`] ?? ""}
                                  onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles,
                                    reviews: { ...prev.template_styles?.reviews, [`text_${field.key}`]: e.target.value } } }))} />
                              </div>)}
                            </div>
                          </div>
                          <div className="space-y-3 border-t border-border pt-3">
                            <Label className="text-sm font-semibold">ফিডব্যাকের রং</Label>
                            {reviewColorGroups.map(group => <div key={group.label} className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {group.fields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 rounded border border-border bg-background px-2 py-1.5">
                                  <Label htmlFor={`review-color-${field.key}`} className="text-xs leading-tight">{field.label}</Label>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Input id={`review-color-${field.key}`} type="color" aria-label={field.label} className="h-8 w-9 cursor-pointer p-0.5"
                                      value={/^#[0-9a-fA-F]{6}$/.test(formData.template_styles?.reviews?.[field.key] || "") ? formData.template_styles.reviews[field.key] : reviewDefaults(formData.template_id)[field.key]}
                                      onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles,
                                        reviews: { ...prev.template_styles?.reviews, [field.key]: e.target.value } } }))} />
                                    <Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} placeholder="#000000"
                                      value={formData.template_styles?.reviews?.[field.key] ?? ""}
                                      onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles,
                                        reviews: { ...prev.template_styles?.reviews, [field.key]: e.target.value } } }))} />
                                    {formData.template_styles?.reviews?.[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`${field.label} আগের রং ফিরিয়ে আনুন`}
                                      aria-label={`${field.label} আগের রং ফিরিয়ে আনুন`} onClick={() => setFormData(prev => {
                                        const reviews = { ...prev.template_styles?.reviews }; delete reviews[field.key];
                                        return { ...prev, template_styles: { ...prev.template_styles, reviews } };
                                      })}><X className="h-3 w-3" /></Button>}
                                  </div>
                                </div>)}
                              </div>
                            </div>)}
                          </div></>}
                        </div>
                      );
                    case 'contact':
                      return (
                         <div className="p-3 bg-muted/30 space-y-4">
                           {isTemplate01 && <><Label className="text-sm font-semibold">কন্টাক্ট ডিজাইন</Label>
                           <div role="radiogroup" aria-label="কন্টাক্ট ডিজাইন" className="grid grid-cols-3 gap-2">
                             {contactDesigns.map(design => {
                               const selected = formData.template_styles?.contact?.design === design.id;
                               return (
                                 <Button key={design.id} type="button" role="radio" aria-checked={selected} variant="outline"
                                   className={`h-auto min-h-20 flex-col items-stretch gap-2 p-2 text-left ${selected ? "border-primary ring-2 ring-primary/40" : ""}`}
                                   onClick={() => setFormData(prev => ({ ...prev, contact_variant: prev.template_styles?.contact?.design === design.id ? (salesPage?.contact_variant ?? "01") : design.id,
                                     template_styles: { ...prev.template_styles, contact: toggleSectionDesign(prev.template_styles?.contact, design.id) }
                                   }))}>
                                   <span className={`contact-design-swatch contact-design-swatch--${design.id}`} aria-hidden="true"><span /><span /></span>
                                   <span className="w-full text-xs font-semibold">{design.label}</span>
                                   <span className="w-full text-[10px] text-muted-foreground whitespace-normal">{design.description}</span>
                                 </Button>
                               );
                             })}
                           </div></>}
                           <div className="space-y-2 border-t border-border pt-3">
                             <Label className="text-sm font-semibold">কন্টাক্টের লেখা ও নম্বর</Label>
                              {([
                                { key: "contact_headline", label: "শিরোনাম" },
                                { key: "contact_subheadline", label: "শিরোনামের নিচের লেখা" },
                                { key: "contact_whatsapp_text", label: "হোয়াটসঅ্যাপ বাটনের লেখা" },
                               ] as const).map(field => (
                                <div key={field.key} className="space-y-1">
                                  <Label htmlFor={`contact-${field.key}`} className="text-xs">{field.label}</Label>
                                  <Input id={`contact-${field.key}`} value={formData[field.key]}
                                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))} className="h-9 text-sm" />
                                </div>
                              ))}
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {([
                                   { key: "contact_phone", code: "phoneCountryCode", label: "কলের নম্বর" },
                                   { key: "contact_whatsapp", code: "whatsappCountryCode", label: "হোয়াটসঅ্যাপ নম্বর" },
                                 ] as const).map(field => (
                                   <div key={field.key} className="space-y-2">
                                     <div className="space-y-1">
                                       <Label htmlFor={`contact-${field.key}`} className="text-xs">{field.label}</Label>
                                       <Input id={`contact-${field.key}`} type="tel" value={formData[field.key]}
                                         placeholder="01XXXXXXXXX" className="h-9 text-sm"
                                         onChange={e => setFormData(prev => {
                                           const value = e.target.value;
                                           const code = prev.template_styles?.contact?.phoneCountryCode?.replace(/\D/g, "") ?? "";
                                           const digits = value.replace(/\D/g, "");
                                           const dial = code && !value.trim().startsWith("+")
                                             ? `+${digits.startsWith(code) ? digits : code + digits.replace(/^0/, "")}` : value.replace(/[^\d+]/g, "");
                                           return { ...prev, [field.key]: value,
                                             ...(field.key === "contact_phone" ? { contact_phone_link: digits ? `tel:${dial}` : "" } : {}) };
                                         })} />
                                     </div>
                                     <div className="space-y-1">
                                       <Label htmlFor={`contact-${field.code}`} className="text-xs">দেশের কোড (ঐচ্ছিক)</Label>
                                       <Input id={`contact-${field.code}`} inputMode="tel" value={formData.template_styles?.contact?.[field.code] ?? ""}
                                         placeholder="যেমন: +88" className="h-9 text-sm"
                                         onChange={e => setFormData(prev => {
                                           const code = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
                                           const digits = formData.contact_phone.replace(/\D/g, "");
                                           const dialCode = code.replace(/\D/g, "");
                                           const dial = dialCode && !formData.contact_phone.trim().startsWith("+")
                                             ? `+${digits.startsWith(dialCode) ? digits : dialCode + digits.replace(/^0/, "")}`
                                             : formData.contact_phone.replace(/[^\d+]/g, "");
                                           return { ...prev, template_styles: { ...prev.template_styles,
                                             contact: { ...prev.template_styles?.contact, [field.code]: code } },
                                             ...(field.key === "contact_phone" ? { contact_phone_link: digits ? `tel:${dial}` : "" } : {}) };
                                         })} />
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             {sectionDesignsAvailable && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {contactTextFields.map(field => {
                                 const key = `text_${field.key}`;
                                 return (
                                   <div key={key} className="space-y-1">
                                     <Label htmlFor={`contact-${key}`} className="text-xs">{field.label}</Label>
                                     <Input id={`contact-${key}`} value={formData.template_styles?.contact?.[key] ?? ""} placeholder={field.defaultText}
                                       onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles,
                                         contact: { ...prev.template_styles?.contact, [key]: e.target.value } } }))} className="h-9 text-sm" />
                                   </div>
                                 );
                               })}
                             </div>}
                           </div>
                           {sectionDesignsAvailable && <div className="space-y-3 border-t border-border pt-3">
                             <Label className="text-sm font-semibold">কন্টাক্টের রং</Label>
                             {contactColorGroups.map(group => (
                               <div key={group.label} className="space-y-2">
                                 <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                   {group.fields.map(field => (
                                     <div key={field.key} className="flex items-center justify-between gap-2 rounded border border-border bg-background px-2 py-1.5">
                                       <Label htmlFor={`contact-color-${field.key}`} className="text-xs leading-tight">{field.label}</Label>
                                       <div className="flex items-center gap-1 shrink-0">
                                         <Input id={`contact-color-${field.key}`} type="color" aria-label={field.label}
                                           value={formData.template_styles?.contact?.[field.key] || field.defaultColor}
                                           onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles,
                                             contact: { ...prev.template_styles?.contact, [field.key]: e.target.value } } }))}
                                           className="h-8 w-9 cursor-pointer p-0.5" />
                                         {formData.template_styles?.contact?.[field.key] && (
                                           <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`${field.label} আগের রং ফিরিয়ে আনুন`}
                                             aria-label={`${field.label} আগের রং ফিরিয়ে আনুন`} onClick={() => setFormData(prev => {
                                               const contact = { ...prev.template_styles?.contact };
                                               delete contact[field.key];
                                               return { ...prev, template_styles: { ...prev.template_styles, contact } };
                                             })}><X className="h-3 w-3" /></Button>
                                         )}
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>}
                        </div>
                      );
                    case 'spec':
                      return (
                        <div className="p-3 bg-muted/30 space-y-2">
                          <Label className="text-xs font-medium">টেকনিক্যাল স্পেসিফিকেশন সেকশন</Label>
                          <div>
                            <Label className="text-xs text-muted-foreground">সেকশন হেডিং</Label>
                            <Input
                              value={formData.spec_section_heading}
                              onChange={(e) => setFormData(prev => ({ ...prev, spec_section_heading: e.target.value }))}
                              placeholder="টেকনিক্যাল স্পেসিফিকেশন"
                              className="h-8 text-sm"
                            />
                          </div>
                          {formData.spec_items.map((item, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <Input
                                value={item.label}
                                onChange={(e) => {
                                  const newItems = [...formData.spec_items];
                                  newItems[index] = { ...newItems[index], label: e.target.value };
                                  setFormData(prev => ({ ...prev, spec_items: newItems }));
                                }}
                                placeholder="লেবেল (যেমন: পাওয়ার)"
                                className="flex-1 h-7 text-sm"
                              />
                              <Input
                                value={item.value}
                                onChange={(e) => {
                                  const newItems = [...formData.spec_items];
                                  newItems[index] = { ...newItems[index], value: e.target.value };
                                  setFormData(prev => ({ ...prev, spec_items: newItems }));
                                }}
                                placeholder="মান (যেমন: ১৪০০ ওয়াট)"
                                className="flex-1 h-7 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  const newItems = formData.spec_items.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, spec_items: newItems }));
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              spec_items: [...prev.spec_items, { label: '', value: '' }]
                            }))}
                          >
                            + স্পেক যোগ করুন
                          </Button>
                        </div>
                      );
                    case 'extra1':
                    case 'extra2':
                    case 'extra3': {
                      const number = Number(sectionId.slice(-1)) as ExtraSectionNumber;
                      const headingKey = `extra_section_${number}_heading` as const;
                      const pointsKey = `extra_section_${number}_points` as const;
                      return <ExtraSectionEditor key={sectionId} number={number}
                        heading={formData[headingKey]} points={formData[pointsKey]}
                        settings={formData.template_styles?.[sectionId] ?? {}}
                        onHeading={value => setFormData(prev => { const settings = { ...prev.template_styles?.[sectionId] }; delete settings.text_heading; return { ...prev, [headingKey]: value, template_styles: { ...prev.template_styles, [sectionId]: settings } }; })}
                        onPoints={(points, settings) => setFormData(prev => ({ ...prev, [pointsKey]: points, template_styles: { ...prev.template_styles, [sectionId]: settings } }))}
                        onSettings={settings => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, [sectionId]: settings } }))}
                      />;
                    }
                    case 'checkout':
                      return (
                         <div className="p-3 bg-muted/30 space-y-3">
                           <Label className="text-sm font-medium">চেকআউট ডিজাইন</Label>
                           <div className="grid grid-cols-2 gap-3 border-b pb-3">
                             {([['width', 'উইথ (%)', '100'], ['marginLeft', 'বাম মার্জিন (px)', '0'], ['marginRight', 'ডান মার্জিন (px)', '0']] as const).map(([key, label, placeholder]) => <div key={key}>
                               <Label htmlFor={`checkout-${key}`} className="text-xs">{label}</Label>
                               <Input id={`checkout-${key}`} type="number" min="0" max={key === 'width' ? 100 : 400} placeholder={placeholder} value={formData.template_styles?.checkout?.[key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, checkout: { ...prev.template_styles?.checkout, [key]: e.target.value } } }))} className="h-8 text-xs" />
                              </div>)}
                             <Button type="button" variant="ghost" size="sm" className="h-7 text-xs col-span-3" onClick={() => setFormData(prev => { const checkout = { ...prev.template_styles?.checkout }; delete checkout.width; delete checkout.marginLeft; delete checkout.marginRight; return { ...prev, template_styles: { ...prev.template_styles, checkout } }; })}>উইথ ও মার্জিন রিসেট</Button>
                           </div>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="চেকআউট ডিজাইন">
                             {checkoutDesigns.map((design) => {
                               const selected = formData.template_styles?.checkout?.design === design.id;
                               return (
                                 <Button
                                   key={design.id}
                                   type="button"
                                   role="radio"
                                   aria-checked={selected}
                                   variant="outline"
                                   onClick={() => setFormData(prev => ({
                                     ...prev,
                                     template_styles: {
                                       ...prev.template_styles,
                                       checkout: toggleSectionDesign(prev.template_styles?.checkout, design.id),
                                     },
                                   }))}
                                   className={`h-auto min-h-24 flex-col items-stretch gap-2 p-2 text-left ${selected ? 'border-primary ring-2 ring-primary/40' : ''}`}
                                 >
                                   <span className={`checkout-design-swatch checkout-design-swatch--${design.id}`} aria-hidden="true">
                                     <span /><span /><span />
                                   </span>
                                   <span className="w-full text-xs font-medium">{design.label}</span>
                                 </Button>
                               );
                             })}
                            </div>
                            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                              <Label htmlFor="checkout-coupon-toggle" className="text-sm">কুপন কোড অপশন</Label>
                              <Switch
                                id="checkout-coupon-toggle"
                                checked={formData.template_styles?.checkout?.coupon !== "0"}
                                onCheckedChange={(checked) => setFormData(prev => ({
                                  ...prev,
                                  template_styles: {
                                    ...prev.template_styles,
                                    checkout: { ...prev.template_styles?.checkout, coupon: checked ? "1" : "0" },
                                  },
                                }))}
                              />
                            </div>
                              <div className="space-y-4 border-t border-border pt-3">
                                 <Label className="text-sm font-semibold">অতিরিক্ত চেকআউট ফিল্ড</Label>
                                 {checkoutExtraFields.map(field => <div key={field.key} className="space-y-2">
                                   <div className="flex items-center justify-between gap-3">
                                     <Label htmlFor={`checkout-show-${field.key}`} className="text-sm">{field.label}</Label>
                                     <Switch id={`checkout-show-${field.key}`} checked={isCheckoutExtraFieldEnabled(formData.template_styles?.checkout, field.key)} onCheckedChange={checked => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, checkout: { ...prev.template_styles?.checkout, [`show_${field.key}`]: checked ? '1' : '0' } } }))} />
                                   </div>
                                   {field.key === 'additionalInfo' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                     {(['Label', 'Placeholder'] as const).map(suffix => <div key={suffix} className="space-y-1">
                                       <Label htmlFor={`checkout-custom-${suffix}`} className="text-xs">{suffix === 'Label' ? 'কাস্টম ফিল্ডের নাম' : 'কাস্টম ফিল্ডের ইঙ্গিত'}</Label>
                                       <Input id={`checkout-custom-${suffix}`} placeholder={suffix === 'Label' ? field.label : field.placeholder} value={formData.template_styles?.checkout?.[`text_additionalInfo${suffix}`] ?? ''} onChange={e => setFormData(prev => ({ ...prev, template_styles: { ...prev.template_styles, checkout: { ...prev.template_styles?.checkout, [`text_additionalInfo${suffix}`]: e.target.value } } }))} />
                                     </div>)}
                                   </div>}
                                 </div>)}
                                 <Label className="text-sm font-semibold">চেকআউটের রং</Label>
                                 {checkoutColorGroups.map(group => (
                                  <div key={group.label} className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {group.fields.map(field => (
                                        <div key={field.key} className="flex items-center justify-between gap-2 rounded border border-border bg-background px-2 py-1.5">
                                          <Label htmlFor={`checkout-${field.key}`} className="text-xs leading-tight">{field.label}</Label>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <Input
                                              id={`checkout-${field.key}`}
                                              type="color"
                                              aria-label={field.label}
                                              value={formData.template_styles?.checkout?.[field.key] || field.defaultColor}
                                              onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                template_styles: {
                                                  ...prev.template_styles,
                                                  checkout: { ...prev.template_styles?.checkout, [field.key]: e.target.value },
                                                },
                                              }))}
                                              className="h-8 w-9 cursor-pointer p-0.5"
                                            />
                                            {formData.template_styles?.checkout?.[field.key] && (
                                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`${field.label} আগের রং ফিরিয়ে আনুন`} aria-label={`${field.label} আগের রং ফিরিয়ে আনুন`} onClick={() => setFormData(prev => {
                                                const checkout = { ...prev.template_styles?.checkout };
                                                delete checkout[field.key];
                                                return { ...prev, template_styles: { ...prev.template_styles, checkout } };
                                              })}>
                                                <X className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                               </div>
                              <div className="space-y-4 border-t border-border pt-3">
                                <Label className="text-sm font-semibold">চেকআউটের লেখা</Label>
                                {(["basic", "advanced"] as const).map(tier => {
                                  const groups = checkoutTextGroups.filter(g => (("advanced" in g && g.advanced) ? "advanced" : "basic") === tier);
                                  if (!groups.length) return null;
                                  const content = (
                                    <div className="space-y-4">
                                      {groups.map(group => (
                                        <div key={group.label} className="space-y-2">
                                          <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {group.fields.map(field => {
                                              const key = `text_${field.key}`;
                                              return (
                                                <div key={key} className="space-y-1">
                                                  <Label htmlFor={`checkout-${key}`} className="text-xs">{field.label}</Label>
                                                  <div className="flex items-center gap-1">
                                                    <Input
                                                      id={`checkout-${key}`}
                                                      value={formData.template_styles?.checkout?.[key] ?? ""}
                                                      placeholder={field.key === "urgency" ? formData.cta_urgency_text : field.defaultText}
                                                      onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        template_styles: {
                                                          ...prev.template_styles,
                                                          checkout: { ...prev.template_styles?.checkout, [key]: e.target.value },
                                                        },
                                                      }))}
                                                      className="h-9 text-sm"
                                                    />
                                                    {formData.template_styles?.checkout?.[key] && (
                                                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`${field.label} আগের লেখা ফিরিয়ে আনুন`} aria-label={`${field.label} আগের লেখা ফিরিয়ে আনুন`} onClick={() => setFormData(prev => {
                                                        const checkout = { ...prev.template_styles?.checkout };
                                                        delete checkout[key];
                                                        return { ...prev, template_styles: { ...prev.template_styles, checkout } };
                                                      })}>
                                                        <X className="h-3 w-3" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                  if (tier === "basic") return <div key={tier}>{content}</div>;
                                  return (
                                    <details key={tier} className="rounded-md border border-border">
                                      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-muted-foreground">আরও লেখা বদলান (ফর্ম, পেমেন্ট, কুপন)</summary>
                                      <div className="px-3 pb-3 pt-2">{content}</div>
                                    </details>
                                  );
                                })}
                              </div>
                        </div>
                      );
                    default:
                      // Handle custom sections (cs-xxx)
                      if (sectionId.startsWith('cs-')) {
                        const customSections = ((formData.template_styles as any)?.customSections || []) as CustomSection[];
                        const cs = customSections.find(c => c.id === sectionId);
                        if (cs) {
                          const updateCS = (updates: Partial<CustomSection>) => {
                            const updated = customSections.map(s => s.id === sectionId ? { ...s, ...updates } : s);
                            setFormData(prev => ({
                              ...prev,
                              template_styles: { ...prev.template_styles, customSections: updated } as any
                            }));
                          };
                          const updateCSStyle = (key: string, value: string | boolean) => {
                            const updated = customSections.map(s => s.id === sectionId ? { ...s, styles: { ...s.styles, [key]: value } } : s);
                            setFormData(prev => ({
                              ...prev,
                              template_styles: { ...prev.template_styles, customSections: updated } as any
                            }));
                          };
                          return (
                            <CustomSectionInlineEditor
                              section={cs}
                              onUpdate={updateCS}
                              onUpdateStyle={updateCSStyle}
                            />
                          );
                        }
                      }
                      return null;
                  }
                })())}</SectionStepEditor>}
              />

              {/* Template 15 Universal Style Customization */}
              {formData.template_id === 'template-15-universal' && (
                <Template15StyleEditor
                  templateStyles={formData.template_styles}
                  onChange={(styles) => setFormData(prev => ({ ...prev, template_styles: styles }))}
                />
              )}

              {/* Shared custom-section builder for every template */}
              {(
                <div className="space-y-2 pt-2 border-t mt-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ➕ কাস্টম সেকশন যোগ করুন
                  </Label>
                  <div className="grid grid-cols-3 gap-1">
                    {([
                      { type: "text" as const, label: "📝 টেক্সট" },
                      { type: "image-text" as const, label: "🖼️ ইমেজ+টেক্সট" },
                      { type: "bullet-points" as const, label: "✅ বুলেট" },
                      { type: "image-grid" as const, label: "🎨 ইমেজ গ্রিড" },
                      { type: "banner" as const, label: "🏷️ ব্যানার" },
                      { type: "gallery" as const, label: "🖼️ গ্যালারি" },
                      { type: "slider" as const, label: "🔄 স্লাইডার" },
                      { type: "image" as const, label: "📷 ইমেজ" },
                      { type: "video" as const, label: "🎬 ভিডিও" },
                      { type: "faq" as const, label: "❓ FAQ" },
                      { type: "divider" as const, label: "➖ ডিভাইডার" },
                      { type: "html" as const, label: "🔧 HTML" },
                      { type: "testimonial" as const, label: "💬 টেস্টিমোনিয়াল" },
                      { type: "pricing" as const, label: "💰 প্রাইসিং" },
                      { type: "countdown-timer" as const, label: "⏰ কাউন্টডাউন" },
                      { type: "feature-icons" as const, label: "🎯 ফিচার গ্রিড" },
                      { type: "cta-banner" as const, label: "🔥 CTA ব্যানার" },
                      { type: "comparison" as const, label: "⚖️ তুলনা" },
                      { type: "button" as const, label: "বাটন" },
                    ]).map(({ type, label }) => (
                      <Button
                        key={type}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] justify-start"
                        onClick={() => {
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
                            styles: {
                              backgroundColor: "#065f46",
                              textColor: "#ffffff",
                              headingColor: "#ffffff",
                              headingFontSize: "22",
                              headingAlignment: "center" as const,
                              headingBold: true,
                              contentFontSize: "15",
                              contentAlignment: "left" as const,
                              padding: "24",
                              borderRadius: "15",
                              borderColor: "#00000000",
                              borderWidth: "0",
                              shadow: "none" as const,
                              imageBorderRadius: "8",
                              ctaBgColor: "#064e3b",
                              ctaTextColor: "#ffffff",
                              ctaBorderRadius: "50",
                              showCta: true,
                              ctaText: "এখনই অর্ডার করুন",
                              imagePosition: "top" as const,
                              sectionWidth: "100",
                              marginX: "0",
                              backgroundOpacity: "100",
                              backgroundImage: "",
                              ctaLink: "",
                            },
                          };
                          const currentCustom = ((formData.template_styles as any)?.customSections || []) as CustomSection[];
                          setFormData(prev => ({
                            ...prev,
                            template_styles: { ...prev.template_styles, customSections: [...currentCustom, newSection] } as any,
                            section_order: [...prev.section_order, newSection.id],
                          }));
                          setExpandedSection(newSection.id);
                        }}
                      >
                        <span className="truncate">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Text */}
              <div>
                <Label className="text-xs">ফুটার টেক্সট (ঐচ্ছিক)</Label>
                <Textarea
                  value={formData.footer_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                  placeholder="পেজের নিচে দেখাবে এমন কাস্টম টেক্সট লিখুন..."
                  className="min-h-[60px] text-sm"
                />
              </div>
             </div>
           </div>
         </ScrollArea>
 
         {/* Actions */}
         <div className="flex justify-end gap-2 px-4 py-3 border-t">
           <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
             {isSubmitting ? "সেভ হচ্ছে..." : salesPage ? "আপডেট করুন" : "তৈরি করুন"}
           </Button>
         </div>
       </div>
       <div className="hidden min-w-0 flex-1 flex-col bg-muted lg:flex">
         <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
           <span className="text-sm font-medium">লাইভ প্রিভিউ</span>
           <div className="flex gap-1">
             <Button type="button" size="sm" aria-label="মোবাইল প্রিভিউ" title="মোবাইল প্রিভিউ" variant={previewDevice === 'mobile' ? 'default' : 'outline'} onClick={() => setPreviewDevice('mobile')}><Smartphone className="h-4 w-4" /></Button>
             <Button type="button" size="sm" aria-label="ডেস্কটপ প্রিভিউ" title="ডেস্কটপ প্রিভিউ" variant={previewDevice === 'desktop' ? 'default' : 'outline'} onClick={() => setPreviewDevice('desktop')}><Monitor className="h-4 w-4" /></Button>
           </div>
         </div>
         <div className="flex-1 min-h-0 p-4">
           <SalesPreviewViewport device={previewDevice}>
             <PreviewErrorBoundary resetKey={JSON.stringify(formData).length}>
               <SalesPageContent page={{ ...(salesPage ?? {}), ...formData, id: salesPage?.id ?? 'preview' } as unknown as SalesPage} />
             </PreviewErrorBoundary>
           </SalesPreviewViewport>
         </div>
       </div>
      </div>
      ) : null
   );
 };
 
 export default SimplifiedSalesPageEditor;