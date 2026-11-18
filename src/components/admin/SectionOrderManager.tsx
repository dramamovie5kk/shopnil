import { useState, ReactNode } from "react";
 import { Switch } from "@/components/ui/switch";
 import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
 
 interface Section {
   id: string;
   label: string;
   enabledKey: string;
   isCustom?: boolean;
 }
 
  const ALL_SECTIONS: Section[] = [
    { id: 'hero', label: 'হিরো সেকশন', enabledKey: 'show_hero_section' },
    { id: 'video', label: 'ভিডিও সেকশন', enabledKey: 'show_video_section' },
    { id: 'gallery', label: 'গ্যালারি সেকশন', enabledKey: 'show_gallery_section' },
    { id: 'features', label: 'ফিচার সেকশন', enabledKey: 'show_features_section' },
    { id: 'spec', label: 'স্পেসিফিকেশন সেকশন', enabledKey: 'show_spec_section' },
    { id: 'reviews', label: 'রিভিউ সেকশন', enabledKey: 'show_reviews_section' },
    { id: 'contact', label: 'কন্টাক্ট সেকশন', enabledKey: 'show_contact_section' },
    { id: 'extra1', label: 'এক্সট্রা সেকশন ১', enabledKey: 'show_extra_section_1' },
    { id: 'extra2', label: 'এক্সট্রা সেকশন ২', enabledKey: 'show_extra_section_2' },
    { id: 'extra3', label: 'এক্সট্রা সেকশন ৩', enabledKey: 'show_extra_section_3' },
    { id: 'checkout', label: 'চেকআউট সেকশন', enabledKey: 'show_checkout_section' },
  ];
  
  const DEFAULT_ORDER = ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];

export interface CustomSectionInfo {
  id: string;
  title: string;
  type: string;
}
 
 interface SectionOrderManagerProps {
   sectionOrder: string[];
   formData: Record<string, unknown>;
   onOrderChange: (newOrder: string[]) => void;
   onToggle: (key: string, value: boolean) => void;
   onSectionClick: (sectionId: string) => void;
   expandedSection: string | null;
  renderSectionContent?: (sectionId: string) => ReactNode;
  customSections?: CustomSectionInfo[];
  onRemoveCustomSection?: (sectionId: string) => void;
  builtInSectionIds?: string[];
 }
 
 const SectionOrderManager = ({
   sectionOrder,
   formData,
   onOrderChange,
   onToggle,
   onSectionClick,
   expandedSection,
  renderSectionContent,
  customSections = [],
  onRemoveCustomSection,
  builtInSectionIds,
 }: SectionOrderManagerProps) => {
   const [draggedItem, setDraggedItem] = useState<string | null>(null);
 
    // Build combined sections list: built-in + custom
    const customSectionItems: Section[] = customSections.map(cs => ({
      id: cs.id,
      label: `🔧 ${cs.title || 'কাস্টম সেকশন'}`,
      enabledKey: '',
      isCustom: true,
    }));

    const builtIns = builtInSectionIds ? ALL_SECTIONS.filter(s => builtInSectionIds.includes(s.id)) : ALL_SECTIONS;
    const allSections = [...builtIns, ...customSectionItems];

    // Ensure sectionOrder has all sections
    const baseOrder = sectionOrder?.length > 0 ? sectionOrder : DEFAULT_ORDER;
    const allIds = allSections.map(s => s.id);
    const missingIds = allIds.filter(id => !baseOrder.includes(id));
    const currentOrder = [...baseOrder.filter(id => allSections.some(s => s.id === id)), ...missingIds];
   
   // Get ordered sections with their metadata
   const orderedSections = currentOrder
     .map(id => allSections.find(s => s.id === id))
     .filter(Boolean) as Section[];
 
   const moveSection = (sectionId: string, direction: 'up' | 'down') => {
     const currentIndex = currentOrder.indexOf(sectionId);
     if (currentIndex === -1) return;
     
     const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
     if (newIndex < 0 || newIndex >= currentOrder.length) return;
     
     const newOrder = [...currentOrder];
     [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
     onOrderChange(newOrder);
   };
 
   const handleDragStart = (e: React.DragEvent, sectionId: string) => {
     setDraggedItem(sectionId);
     e.dataTransfer.effectAllowed = 'move';
   };
 
   const handleDragOver = (e: React.DragEvent, targetId: string) => {
     e.preventDefault();
     if (!draggedItem || draggedItem === targetId) return;
     
     const dragIndex = currentOrder.indexOf(draggedItem);
     const targetIndex = currentOrder.indexOf(targetId);
     
     if (dragIndex === -1 || targetIndex === -1) return;
     
     const newOrder = [...currentOrder];
     newOrder.splice(dragIndex, 1);
     newOrder.splice(targetIndex, 0, draggedItem);
     onOrderChange(newOrder);
   };
 
   const handleDragEnd = () => {
     setDraggedItem(null);
   };
 
   return (
     <div className="space-y-1">
       {orderedSections.map((section, index) => {
         const isCustom = section.isCustom;
         const isEnabled = isCustom ? true : (formData[section.enabledKey] as boolean);
         const isExpanded = expandedSection === section.id;
         const isFirst = index === 0;
         const isLast = index === orderedSections.length - 1;
         
         return (
           <div
             key={section.id}
             className={`border rounded-lg overflow-hidden transition-all ${
               draggedItem === section.id ? 'opacity-50 border-primary' : ''
             } ${isEnabled ? '' : 'opacity-60'} ${isCustom ? 'border-primary/30' : ''}`}
           >
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-1 px-2 py-1.5 bg-muted/40"
              >
               {/* Drag Handle */}
               <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                 <GripVertical className="h-4 w-4" />
               </div>
               
               {/* Move Buttons */}
               <div className="flex flex-col">
                 <button
                   type="button"
                   onClick={() => moveSection(section.id, 'up')}
                   disabled={isFirst}
                   className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                 >
                   <ChevronUp className="h-3 w-3" />
                 </button>
                 <button
                   type="button"
                   onClick={() => moveSection(section.id, 'down')}
                   disabled={isLast}
                   className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                 >
                   <ChevronDown className="h-3 w-3" />
                 </button>
               </div>
               
               {/* Toggle Switch - only for built-in sections */}
               {!isCustom && (
                 <Switch
                   checked={isEnabled}
                   onCheckedChange={(v) => onToggle(section.enabledKey, v)}
                   className="scale-75"
                 />
               )}
               
               {/* Label - clickable to expand */}
               <button
                 type="button"
                 onClick={() => onSectionClick(section.id)}
                 className={`flex-1 text-left text-sm font-medium ${isEnabled ? '' : 'text-muted-foreground'}`}
               >
                 {section.label}
               </button>

               {/* Delete button for custom sections */}
               {isCustom && onRemoveCustomSection && (
                 <button
                   type="button"
                   onClick={(e) => { e.stopPropagation(); onRemoveCustomSection(section.id); }}
                   className="text-destructive hover:text-destructive/80 p-1"
                 >
                   <Trash2 className="h-3.5 w-3.5" />
                 </button>
               )}
               
               {/* Expand Indicator */}
               {isEnabled && (
                 <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
               )}
             </div>
              
              {/* Expanded Content */}
              {isExpanded && isEnabled && renderSectionContent && (
                <div className="border-t">
                  {renderSectionContent(section.id)}
                </div>
              )}
           </div>
         );
       })}
     </div>
   );
 };
 
 export default SectionOrderManager;
 export { ALL_SECTIONS, DEFAULT_ORDER };