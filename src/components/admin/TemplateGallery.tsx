import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
 import { Check, Eye, Palette, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { selectableSalesPageTemplates, SalesPageTemplate } from "@/lib/salesPageTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTemplateId: string;
  onSelect: (template: SalesPageTemplate) => void;
}

const TemplateGallery = ({
  open,
  onOpenChange,
  currentTemplateId,
  onSelect,
}: TemplateGalleryProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<SalesPageTemplate | null>(null);
   const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleSelect = (template: SalesPageTemplate) => {
    onSelect(template);
    onOpenChange(false);
  };

  // Helper to determine if template is light or dark
  const isLightTemplate = (template: SalesPageTemplate) => 
    ['nature-fresh', 'classic-white', 'soft-elegance', 'bold-orange', 'fresh-lime'].includes(template.id);

   // Category labels in Bengali
   const categoryLabels: Record<string, string> = {
     'all': 'সকল',
     'food': 'ফুড/অর্গানিক',
     'fashion': 'ক্লথিং',
     'gadget': 'গ্যাজেট',
     'health': 'হেলথ',
     'luxury': 'লাক্সারি',
     'beauty': 'বিউটি',
     'home': 'হোম',
     'kids': 'কিডস',
     'general': 'জেনারেল',
   };
 
   // Get unique categories
   const categories = ['all', ...new Set(selectableSalesPageTemplates.map(t => t.category))];
 
   // Filter templates
   const filteredTemplates = categoryFilter === 'all' 
     ? selectableSalesPageTemplates 
     : selectableSalesPageTemplates.filter(t => t.category === categoryFilter);
 
   // Sort: New templates first
   const sortedTemplates = [...filteredTemplates].sort((a, b) => {
     if (a.isNew && !b.isNew) return -1;
     if (!a.isNew && b.isNew) return 1;
     return 0;
   });
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5" />
            টেমপ্লেট গ্যালারি
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
             আপনার সেলস পেজের জন্য রেডি-মেড টেমপ্লেট নির্বাচন করুন
          </p>
           
           {/* Category Filter */}
           <div className="flex flex-wrap gap-1.5 mt-3">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setCategoryFilter(cat)}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                   categoryFilter === cat 
                     ? 'bg-primary text-primary-foreground' 
                     : 'bg-muted text-muted-foreground hover:bg-muted/80'
                 }`}
               >
                 {categoryLabels[cat] || cat}
               </button>
             ))}
           </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="p-4">
            {/* Template Grid - 2 columns on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
               {sortedTemplates.map((template) => {
                const isSelected = currentTemplateId === template.id;
                const isLight = isLightTemplate(template);
                
                return (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelect(template)}
                  >
                     {/* New Badge */}
                     {template.isNew && (
                       <div className="absolute top-1 left-1 z-10">
                         <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                           <Star className="w-2.5 h-2.5 fill-white" />
                           নতুন
                         </Badge>
                       </div>
                     )}
 
                    {/* Mini Preview Card */}
                    <div 
                      className="aspect-[4/3] p-3 flex flex-col"
                      style={{ backgroundColor: template.preview.background }}
                    >
                      {/* Mini Hero Preview */}
                      <div 
                        className="h-6 rounded-lg mb-2 flex items-center justify-center gap-1"
                        style={{ 
                          background: template.heroStyle === 'nature' || template.heroStyle === 'classic' || template.heroStyle === 'elegant'
                            ? template.preview.primary
                            : `linear-gradient(135deg, ${template.preview.primary}, ${template.preview.accent})` 
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-white/70" />
                        <div className="h-1.5 w-12 bg-white/30 rounded-full" />
                      </div>
                      
                      {/* Layout indicator based on template type */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        {/* Features preview */}
                        <div className="flex gap-1">
                          {template.featuresLayout === 'checklist' ? (
                            // Checklist style
                            <div className="flex-1 space-y-0.5">
                              {[1, 2, 3].map((i) => (
                                <div 
                                  key={i}
                                  className="h-2 rounded-sm flex items-center gap-1 px-1"
                                  style={{ 
                                    backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.1)',
                                    borderLeft: `2px solid ${template.preview.primary}`
                                  }}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: template.preview.primary }} />
                                </div>
                              ))}
                            </div>
                          ) : template.featuresLayout === 'icons' ? (
                            // Icons style
                            <div className="flex-1 flex justify-center gap-1">
                              {[1, 2, 3].map((i) => (
                                <div 
                                  key={i}
                                  className="w-4 h-4 rounded-md"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${template.preview.primary}, ${template.preview.accent})`
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            // Grid style
                            <div className="flex-1 grid grid-cols-2 gap-0.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div 
                                  key={i}
                                  className="rounded-sm h-4"
                                  style={{ backgroundColor: template.feature_card_bg_color }}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-sm m-0.5"
                                    style={{ backgroundColor: template.feature_icon_bg_color }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Gallery preview */}
                        <div className="flex gap-0.5">
                          {template.galleryLayout === 'grid' ? (
                            <div className="flex-1 grid grid-cols-2 gap-0.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div 
                                  key={i}
                                  className="rounded-sm h-3"
                                  style={{ backgroundColor: isLight ? '#ddd' : 'rgba(255,255,255,0.15)' }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex-1 flex gap-0.5 overflow-hidden">
                              {[1, 2, 3].map((i) => (
                                <div 
                                  key={i}
                                  className="flex-shrink-0 w-5 h-6 rounded-sm"
                                  style={{ backgroundColor: isLight ? '#ddd' : 'rgba(255,255,255,0.15)' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Mini Button Preview */}
                      <div 
                        className={`h-5 mt-1.5 flex items-center justify-center ${
                          template.buttonStyle === 'pill' ? 'rounded-full' : 
                          template.buttonStyle === 'neon' ? 'rounded-lg border' : 'rounded-lg'
                        }`}
                        style={{ 
                          background: template.buttonStyle === 'neon' || template.buttonStyle === 'outline'
                            ? 'transparent'
                            : `linear-gradient(135deg, ${template.preview.primary}, ${template.preview.accent})`,
                          borderColor: template.buttonStyle === 'neon' ? template.preview.accent : undefined,
                          boxShadow: template.buttonStyle === 'glow' ? `0 0 10px ${template.preview.accent}50` : undefined
                        }}
                      >
                        <div 
                          className="h-1 w-8 rounded-full"
                          style={{ 
                            backgroundColor: template.buttonStyle === 'neon' || template.buttonStyle === 'outline'
                              ? template.preview.accent
                              : 'rgba(255,255,255,0.5)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-2.5 bg-card border-t">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Color Swatches */}
                      <div className="flex gap-1 mt-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: template.preview.primary }}
                          title="Primary"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: template.preview.accent }}
                          title="Accent"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: template.preview.background }}
                          title="Background"
                        />
                        {/* Layout badges */}
                        <div className="flex-1 flex justify-end gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {template.galleryLayout}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      প্রিভিউ
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Full Preview Modal */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setPreviewTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-sm w-full rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: previewTemplate.preview.background }}
              >
                {/* Preview Header */}
                <div 
                  className="p-5"
                  style={{ 
                    background: previewTemplate.heroStyle === 'nature' || previewTemplate.heroStyle === 'classic'
                      ? previewTemplate.preview.background
                      : `linear-gradient(135deg, ${previewTemplate.preview.primary}20, ${previewTemplate.preview.accent}20)` 
                  }}
                >
                  <div 
                    className={`inline-block px-3 py-1 text-xs font-medium mb-3 ${
                      previewTemplate.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-lg'
                    }`}
                    style={{ 
                      backgroundColor: previewTemplate.preview.primary,
                      color: '#fff'
                    }}
                  >
                    সীমিত অফার
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-1"
                    style={{ color: previewTemplate.preview.text }}
                  >
                    মাত্র ৳১৯৯০ টাকায়
                  </h2>
                  <p 
                    className="text-sm opacity-70"
                    style={{ color: previewTemplate.preview.text }}
                  >
                    {previewTemplate.description}
                  </p>
                </div>

                {/* Preview Features */}
                <div className="p-4">
                  {previewTemplate.featuresLayout === 'checklist' ? (
                    <div className="space-y-2">
                      {['ফিচার ১', 'ফিচার ২', 'ফিচার ৩'].map((feature, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg border-l-4"
                          style={{ 
                            backgroundColor: isLightTemplate(previewTemplate) ? '#fff' : 'rgba(255,255,255,0.05)',
                            borderLeftColor: previewTemplate.preview.primary
                          }}
                        >
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: previewTemplate.preview.primary }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: previewTemplate.preview.text }}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : previewTemplate.featuresLayout === 'icons' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {['🎁', '✨', '🚀'].map((icon, i) => (
                        <div key={i} className="text-center">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1 text-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${previewTemplate.preview.primary}, ${previewTemplate.preview.accent})`
                            }}
                          >
                            {icon}
                          </div>
                          <p 
                            className="text-xs font-medium"
                            style={{ color: previewTemplate.preview.text }}
                          >
                            ফিচার {i + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {['ফিচার ১', 'ফিচার ২', 'ফিচার ৩', 'ফিচার ৪'].map((feature, i) => (
                        <div 
                          key={i}
                          className="p-2.5 rounded-xl"
                          style={{ backgroundColor: previewTemplate.feature_card_bg_color }}
                        >
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 text-sm"
                            style={{ backgroundColor: previewTemplate.feature_icon_bg_color }}
                          >
                            🎁
                          </div>
                          <p 
                            className="text-xs font-medium"
                            style={{ color: previewTemplate.preview.text }}
                          >
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Button */}
                <div className="p-4">
                  <button
                    className={`w-full py-3 font-bold text-white ${
                      previewTemplate.buttonStyle === 'pill' ? 'rounded-full' :
                      previewTemplate.buttonStyle === 'neon' ? 'rounded-xl border-2 bg-transparent' : 'rounded-xl'
                    }`}
                    style={{ 
                      background: previewTemplate.buttonStyle === 'neon' 
                        ? 'transparent'
                        : `linear-gradient(135deg, ${previewTemplate.preview.primary}, ${previewTemplate.preview.accent})`,
                      borderColor: previewTemplate.buttonStyle === 'neon' ? previewTemplate.preview.accent : undefined,
                      color: previewTemplate.buttonStyle === 'neon' ? previewTemplate.preview.accent : '#fff',
                      boxShadow: previewTemplate.buttonStyle === 'glow' 
                        ? `0 0 20px ${previewTemplate.preview.accent}50`
                        : undefined
                    }}
                  >
                    অর্ডার করুন
                  </button>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    বন্ধ করুন
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleSelect(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                  >
                    এটি সিলেক্ট করুন
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGallery;
