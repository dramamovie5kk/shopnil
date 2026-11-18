 import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, ImagePlus, X, Layers } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { Switch } from "@/components/ui/switch";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { useProductVariations, useSaveVariations, VariationGroupInput } from "@/hooks/useProductVariations";
import { api } from "@/integrations/cloudflare/client";
 import { toast } from "sonner";
 
 interface OptionItem {
   variation_name: string;
   price: number;
   stock: number;
   is_default: boolean;
   image_url?: string | null;
 }
 
 interface GroupItem {
   group_name: string;
   variation_type: string;
   options: OptionItem[];
 }
 
 interface ProductVariationEditorProps {
   productId: string | null;
   basePrice: number;
   onSave?: () => void;
 }
 
 const VARIATION_TYPES = [
    { value: "size", label: "সাইজ", placeholder: "S, M, L, XL" },
   { value: "color", label: "রঙ", placeholder: "লাল, নীল, সবুজ" },
   { value: "pack", label: "প্যাক", placeholder: "১ পিস, ২ পিস, ৩ পিস" },
   { value: "custom", label: "কাস্টম", placeholder: "অপশন নাম" },
 ];
 
const typeLabel = (value: string) => VARIATION_TYPES.find((t) => t.value === value)?.label || "কাস্টম";
 
 const ProductVariationEditor = ({ productId, basePrice, onSave }: ProductVariationEditorProps) => {
   const { data: existingVariations = [], isLoading } = useProductVariations(productId);
   const saveVariations = useSaveVariations();
   
    const [hasVariations, setHasVariations] = useState(false);
   const [groups, setGroups] = useState<GroupItem[]>([]);
 
   useEffect(() => {
     if (existingVariations.length > 0) {
       setHasVariations(true);
       const byKey = new Map<string, GroupItem>();
       const ordered: GroupItem[] = [];
       for (const v of existingVariations) {
         const key = (v.group_name || "").trim();
         let group = byKey.get(key);
         if (!group) {
           group = { group_name: key, variation_type: v.variation_type || "custom", options: [] };
           byKey.set(key, group);
           ordered.push(group);
         }
         group.options.push({
           variation_name: v.variation_name,
           price: v.price,
           stock: v.stock || 0,
           is_default: v.is_default,
          image_url: v.image_url || null,
         });
       }
       setGroups(ordered);
     }
   }, [existingVariations]);
  
   const addGroup = () => {
     setGroups([
       ...groups,
       {
         group_name: groups.length === 0 ? "" : "",
         variation_type: "custom",
         options: [],
       },
     ]);
   };
 
   const removeGroup = (groupIndex: number) => {
     setGroups(groups.filter((_, i) => i !== groupIndex));
   };
 
   const updateGroup = (groupIndex: number, field: keyof GroupItem, value: any) => {
     const next = [...groups];
     next[groupIndex] = { ...next[groupIndex], [field]: value };
     setGroups(next);
   };
 
   const addOption = (groupIndex: number) => {
     const next = [...groups];
     const options = [...next[groupIndex].options];
     options.push({
       variation_name: "",
       price: basePrice,
       stock: 0,
       is_default: options.length === 0,
      image_url: null,
     });
     next[groupIndex] = { ...next[groupIndex], options };
     setGroups(next);
   };
 
   const removeOption = (groupIndex: number, optionIndex: number) => {
     const next = [...groups];
     let options = next[groupIndex].options.filter((_, i) => i !== optionIndex);
     if (options.length > 0 && !options.some((o) => o.is_default)) {
       options = options.map((o, i) => ({ ...o, is_default: i === 0 }));
     }
     next[groupIndex] = { ...next[groupIndex], options };
     setGroups(next);
   };
 
   const updateOption = (groupIndex: number, optionIndex: number, field: keyof OptionItem, value: any) => {
     const next = [...groups];
     let options = [...next[groupIndex].options];
     options[optionIndex] = { ...options[optionIndex], [field]: value };
     if (field === "is_default" && value) {
       options = options.map((o, i) => ({ ...o, is_default: i === optionIndex }));
     }
     next[groupIndex] = { ...next[groupIndex], options };
     setGroups(next);
   };
 
   const handleSave = async () => {
     if (!productId) {
       toast.error("প্রথমে প্রোডাক্ট সেভ করুন");
       return;
     }
 
     const activeGroups = hasVariations ? groups.filter((g) => g.options.length > 0) : [];
 
     if (hasVariations && activeGroups.length === 0) {
       toast.error("অন্তত একটি ভেরিয়েশন যোগ করুন");
       return;
     }
 
     if (activeGroups.some((g) => g.options.some((o) => !o.variation_name.trim()))) {
       toast.error("সব ভেরিয়েশনের নাম দিন");
       return;
     }
 
     if (activeGroups.length > 1 && activeGroups.some((g) => !g.group_name.trim())) {
       toast.error("প্রতিটি গ্রুপের নাম দিন (যেমন: কালার, সাইজ)");
       return;
     }
 
     try {
       const payload: VariationGroupInput[] = activeGroups.map((g) => ({
         group_name: g.group_name,
         variation_type: g.variation_type,
         options: g.options,
       }));
       await saveVariations.mutateAsync({ productId, groups: payload });
       toast.success("ভেরিয়েশন সেভ হয়েছে");
       onSave?.();
     } catch (error: any) {
        toast.error(error.message || "সমস্যা হয়েছে");
     }
   };
 
  const handleImageUpload = async (groupIndex: number, optionIndex: number, file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const filePath = `variations/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
       const { error } = await api.storage.from("products").upload(filePath, file);
      if (error) throw error;
      const { data } = api.storage.from("products").getPublicUrl(filePath);
      updateOption(groupIndex, optionIndex, "image_url", data.publicUrl);
      toast.success("ইমেজ আপলোড হয়েছে");
    } catch (e: any) {
      toast.error(e.message || "ইমেজ আপলোডে সমস্যা");
    }
  };
 
    if (isLoading) {
     return (
       <Card className="border-dashed">
         <CardContent className="py-6">
           <div className="flex items-center justify-center text-muted-foreground">
             লোড হচ্ছে...
           </div>
         </CardContent>
       </Card>
     );
   }
 
   const totalOptions = groups.reduce((acc, g) => acc + g.options.length, 0);
 
   return (
     <Card className="border-dashed">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-base flex items-center gap-2">
             ভেরিয়েশন সেটআপ
             {hasVariations && totalOptions > 0 && (
               <Badge variant="secondary" className="text-xs">
                  {totalOptions}টি
               </Badge>
             )}
           </CardTitle>
           <div className="flex items-center gap-2">
             <Label className="text-sm text-muted-foreground">সক্রিয়</Label>
             <Switch
               checked={hasVariations}
               onCheckedChange={(checked) => {
                 setHasVariations(checked);
                 if (checked && groups.length === 0) addGroup();
               }}
             />
            </div>
         </div>
       </CardHeader>
 
       {hasVariations && (
         <CardContent className="space-y-4">
           <p className="text-xs text-muted-foreground">
             একাধিক গ্রুপ যোগ করতে পারেন (যেমন: কালার + সাইজ)। প্রতিটি অপশনের নিজের দাম ও স্টক দিন—ক্রেতা প্রতিটি গ্রুপ থেকে একটি করে বাছবে এবং চূড়ান্ত দাম হবে বাছাই করা অপশনগুলোর দামের যোগফল।
           </p>
 
           {groups.map((group, groupIndex) => {
             const currentType = VARIATION_TYPES.find((t) => t.value === group.variation_type);
             return (
               <div key={groupIndex} className="rounded-lg border bg-secondary/20 p-3 space-y-3">
                 <div className="flex items-center justify-between gap-2">
                   <div className="flex items-center gap-2 flex-1">
                     <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                     <Input
                       placeholder={groups.length > 1 ? `গ্রুপের নাম (যেমন: ${typeLabel(group.variation_type)})` : "গ্রুপের নাম (ঐচ্ছিক)"}
                       value={group.group_name}
                       onChange={(e) => updateGroup(groupIndex, "group_name", e.target.value)}
                       className="h-8 max-w-[220px]"
                     />
                   </div>
                   <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                     onClick={() => removeGroup(groupIndex)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
 
                 {/* Variation Type Selection */}
                 <RadioGroup
                   value={group.variation_type}
                   onValueChange={(value) => updateGroup(groupIndex, "variation_type", value)}
                   className="flex flex-wrap gap-3"
                 >
                   {VARIATION_TYPES.map((type) => (
                     <div key={type.value} className="flex items-center space-x-2">
                       <RadioGroupItem value={type.value} id={`g${groupIndex}-${type.value}`} />
                       <Label htmlFor={`g${groupIndex}-${type.value}`} className="text-sm cursor-pointer">
                         {type.label}
                       </Label>
                     </div>
                   ))}
                 </RadioGroup>
 
                 {/* Options List */}
                 <div className="space-y-2">
                   {group.options.map((option, optionIndex) => (
                     <div
                       key={optionIndex}
                       className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border"
                     >
                       <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
 
                       {/* Image picker */}
                       <div className="relative shrink-0">
                         <label
                           htmlFor={`var-img-${groupIndex}-${optionIndex}`}
                           className="flex items-center justify-center h-12 w-12 rounded-md border border-dashed bg-background cursor-pointer overflow-hidden hover:border-primary"
                           title="ভেরিয়েশন ইমেজ"
                         >
                           {option.image_url ? (
                             <img src={option.image_url} alt="" className="h-full w-full object-cover" />
                           ) : (
                             <ImagePlus className="h-4 w-4 text-muted-foreground" />
                           )}
                         </label>
                         <input
                           id={`var-img-${groupIndex}-${optionIndex}`}
                           type="file"
                           accept="image/*"
                           className="hidden"
                           onChange={(e) => {
                             const f = e.target.files?.[0];
                             if (f) handleImageUpload(groupIndex, optionIndex, f);
                             e.target.value = "";
                           }}
                         />
                         {option.image_url && (
                           <button
                             type="button"
                             onClick={() => updateOption(groupIndex, optionIndex, "image_url", null)}
                             className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                           >
                             <X className="h-3 w-3" />
                           </button>
                         )}
                       </div>
 
                       <div className="flex-1 grid grid-cols-3 gap-2">
                         <div className="space-y-0.5">
                           <Label className="text-[10px] text-muted-foreground leading-none">ভেরিয়েশন</Label>
                           <Input
                             placeholder={currentType?.placeholder || "নাম"}
                             value={option.variation_name}
                             onChange={(e) => updateOption(groupIndex, optionIndex, "variation_name", e.target.value)}
                             className="h-9"
                           />
                         </div>
                         <div className="space-y-0.5">
                           <Label className="text-[10px] text-muted-foreground leading-none">প্রাইস</Label>
                           <Input
                             type="number"
                             placeholder="দাম"
                             value={option.price}
                             onChange={(e) => updateOption(groupIndex, optionIndex, "price", parseFloat(e.target.value) || 0)}
                             className="h-9"
                           />
                         </div>
                         <div className="space-y-0.5">
                           <Label className="text-[10px] text-muted-foreground leading-none">স্টক</Label>
                           <Input
                             type="number"
                             placeholder="স্টক"
                             value={option.stock}
                             onChange={(e) => updateOption(groupIndex, optionIndex, "stock", parseInt(e.target.value) || 0)}
                             className="h-9"
                           />
                         </div>
                       </div>
 
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1">
                           <Switch
                             checked={option.is_default}
                             onCheckedChange={(checked) => updateOption(groupIndex, optionIndex, "is_default", checked)}
                             className="scale-75"
                           />
                           <span className="text-xs text-muted-foreground whitespace-nowrap">ডিফল্ট</span>
                         </div>
 
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-destructive hover:text-destructive"
                           onClick={() => removeOption(groupIndex, optionIndex)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   ))}
 
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => addOption(groupIndex)}
                     className="w-full border-dashed"
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     অপশন যোগ করুন
                   </Button>
                 </div>
               </div>
             );
           })}
 
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={addGroup}
             className="w-full border-dashed"
           >
             <Plus className="h-4 w-4 mr-2" />
             নতুন ভেরিয়েশন গ্রুপ (যেমন: কালার / সাইজ)
           </Button>
 
           {/* Save Button */}
           {productId && (
             <Button
               type="button"
               onClick={handleSave}
               disabled={saveVariations.isPending}
               className="w-full"
             >
               {saveVariations.isPending ? "সেভ হচ্ছে..." : "ভেরিয়েশন সেভ করুন"}
             </Button>
           )}
 
           {!productId && (
             <p className="text-xs text-muted-foreground text-center">
               ⚠️ প্রথমে প্রোডাক্ট সেভ করুন, তারপর ভেরিয়েশন যোগ করতে পারবেন
             </p>
           )}
         </CardContent>
       )}
     </Card>
   );
 };
 
 export default ProductVariationEditor;
