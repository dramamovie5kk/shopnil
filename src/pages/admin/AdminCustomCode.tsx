import { useState, useEffect } from "react";
import { Code, Save, Loader2, FileCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminCustomCode = () => {
  const queryClient = useQueryClient();
  const [headerCode, setHeaderCode] = useState("");
  const [bodyCode, setBodyCode] = useState("");
  const [footerCode, setFooterCode] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const { data, error } = await api.from("site_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setHeaderCode(settings.find((s) => s.setting_key === "header_code")?.setting_value || "");
      setBodyCode(settings.find((s) => s.setting_key === "body_code")?.setting_value || "");
      setFooterCode(settings.find((s) => s.setting_key === "footer_code")?.setting_value || "");
    }
  }, [settings]);

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await api
      .from("site_settings")
      .select("id")
      .eq("setting_key", key)
      .single();

    if (existing) {
      const { error } = await api
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
      if (error) throw error;
    } else {
      const { error } = await api
        .from("site_settings")
        .insert({ setting_key: key, setting_value: value });
      if (error) throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertSetting("header_code", headerCode);
      await upsertSetting("body_code", bodyCode);
      await upsertSetting("footer_code", footerCode);
      toast.success("কোড সেভ হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    } catch (error: any) {
      toast.error(error.message || "সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard adminOnly>
      <AdminLayout title="কাস্টম কোড">
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-800">
                <strong>💡 টিপস:</strong> শুধু Google Tag Manager (GTM) এর কোড হেডারে বসান। 
                DataLayer এ অটোমেটিক ডাটা পুশ হবে - PageView, AddToCart, InitiateCheckout, Purchase ইভেন্ট সহ।
                GTM থেকে ট্রিগার সেটআপ করে Facebook, Google Ads, TikTok সব প্ল্যাটফর্মে কনভার্সন পাঠাতে পারবেন।
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                হেডার কোড (&lt;head&gt;)
              </CardTitle>
              <CardDescription>
                এই কোড পেজের <code>&lt;head&gt;</code> সেকশনে যোগ হবে। 
                Google Tag Manager বা অন্যান্য ট্র্যাকিং স্ক্রিপ্ট এখানে দিন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="header-code"
                placeholder={`<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>`}
                value={headerCode}
                onChange={(e) => setHeaderCode(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                বডি কোড (&lt;body&gt; শুরুতে)
              </CardTitle>
              <CardDescription>
                এই কোড <code>&lt;body&gt;</code> ট্যাগের ঠিক পরে যোগ হবে। 
                GTM noscript iframe এখানে দিন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="body-code"
                placeholder={`<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}
                value={bodyCode}
                onChange={(e) => setBodyCode(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ফুটার কোড (&lt;/body&gt; আগে)
              </CardTitle>
              <CardDescription>
                এই কোড <code>&lt;/body&gt;</code> ট্যাগের ঠিক আগে যোগ হবে। 
                চ্যাট উইজেট বা অন্যান্য স্ক্রিপ্ট এখানে দিন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="footer-code"
                placeholder={`<!-- Chat Widget বা অন্যান্য স্ক্রিপ্ট -->
<script>
// Your custom scripts here
</script>`}
                value={footerCode}
                onChange={(e) => setFooterCode(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || isLoading} className="bg-gradient-brand">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              সেভ করুন
            </Button>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminCustomCode;