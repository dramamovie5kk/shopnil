 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { api } from "@/integrations/cloudflare/client";
 
 interface SiteSetting {
   id: string;
   setting_key: string;
   setting_value: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export const changedSiteSettings = (current: Record<string, string>, saved: Record<string, string>) =>
   Object.fromEntries(Object.entries(current).filter(([key, value]) => saved[key] !== value));

 export const saveSiteSettings = async (values: Record<string, string>) => {
   const updatedAt = new Date().toISOString();
   const rows = Object.entries(values).map(([setting_key, setting_value]) => ({
     setting_key, setting_value, updated_at: updatedAt,
   }));
   if (!rows.length) return;
   const { error } = await api.from("site_settings").upsert(rows, { onConflict: "setting_key" });
   if (error) throw error;
 };

 export const useSiteSettings = () => {
   const queryClient = useQueryClient();
 
   const { data: settings = [], isLoading } = useQuery({
     queryKey: ["site-settings"],
     queryFn: async () => {
       const { data, error } = await api
         .from("site_settings")
         .select("*");
       
       if (error) throw error;
       return data as SiteSetting[];
     },
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
 
   const getSetting = (key: string, defaultValue: string = ""): string => {
     const setting = settings.find((s) => s.setting_key === key);
     return setting?.setting_value || defaultValue;
   };
 
   const updateSettingMutation = useMutation({
     mutationFn: saveSiteSettings,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["site-settings"] });
     },
   });
 
   const updateSetting = (key: string, value: string) => {
     return updateSettingMutation.mutateAsync({ [key]: value });
   };
 
   const bulkUpdateSettings = (settingsToUpdate: Record<string, string>) =>
     updateSettingMutation.mutateAsync(settingsToUpdate);
 
   return {
     settings,
     isLoading,
     getSetting,
     updateSetting,
     bulkUpdateSettings,
     isUpdating: updateSettingMutation.isPending,
   };
 };