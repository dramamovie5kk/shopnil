import { renderSalesText } from '@/components/salespage/SalesRichText';
 import { useState, useEffect } from "react";
 import { cn } from "@/lib/utils";
 import { ProductVariation } from "@/types";
 import { groupVariations, defaultSelection } from "@/lib/variationGroups";
 
 interface VariationSelectorProps {
   variations: ProductVariation[];
   variationType: string;
   /** Currently selected options (one per group). */
   selected: ProductVariation[];
   onSelect: (selected: ProductVariation[]) => void;
   primaryColor: string;
   accentColor: string;
   priceUnit: string;
    labels?: Record<string, string>;
 }
 
 const VARIATION_TYPE_LABELS: Record<string, string> = {
   size: "সাইজ বাছুন",
   color: "রঙ বাছুন",
   pack: "প্যাক বাছুন",
   custom: "অপশন বাছুন",
 };
 
 const VariationSelector = ({
   variations,
   variationType,
   selected,
   onSelect,
   primaryColor,
   accentColor,
   priceUnit,
    labels,
 }: VariationSelectorProps) => {
   const groups = groupVariations(variations);
 
   // Auto-pick defaults once variations load
   useEffect(() => {
     if (selected.length === 0 && groups.length > 0) {
       onSelect(defaultSelection(groups));
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [variations]);
 
   const handleSelect = (groupKey: string, option: ProductVariation) => {
     const group = groups.find((g) => g.key === groupKey);
     if (!group) return;
     const groupOptionIds = new Set(group.options.map((o) => o.id));
     const rest = selected.filter((v) => !groupOptionIds.has(v.id));
     onSelect([...rest, option]);
   };
 
   if (variations.length === 0) return null;
 
   const selectedIds = new Set(selected.map((v) => v.id));
 
   return (
       <div className="checkout-variation-options space-y-3">
       {groups.map((group) => (
         <div key={group.key || "legacy"} className="space-y-2">
           <p className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide">
             {renderSalesText(
               group.key ||
                 labels?.[group.type] ||
                 VARIATION_TYPE_LABELS[group.type] ||
                 labels?.[variationType] ||
                 VARIATION_TYPE_LABELS[variationType] ||
                 labels?.custom ||
                 "অপশন বাছুন"
             )}:
           </p>
           <div className="flex flex-wrap gap-2">
             {group.options.map((variation) => {
               const isSelected = selectedIds.has(variation.id);
               return (
                 <button
                   key={variation.id}
                   type="button"
                   onClick={() => handleSelect(group.key, variation)}
                   data-selected={isSelected}
                   className={cn(
                     "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex flex-col items-center min-w-[60px]",
                     isSelected
                       ? "text-white scale-105"
                       : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                   )}
                   style={
                     isSelected
                       ? {
                           background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                           borderColor: "transparent",
                           boxShadow: `0 4px 15px -3px ${primaryColor}50`,
                         }
                       : {}
                   }
                 >
                   <span className="font-semibold">{renderSalesText(variation.variation_name)}</span>
                   <span className="text-xs opacity-80">
                     {renderSalesText(priceUnit)}{renderSalesText(variation.price)}
                   </span>
                 </button>
               );
             })}
           </div>
         </div>
       ))}
     </div>
   );
 };
 
 export default VariationSelector;
