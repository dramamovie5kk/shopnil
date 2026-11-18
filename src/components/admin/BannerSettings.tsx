import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { api } from "@/integrations/cloudflare/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { HomeBannerConfig, parseHomeBannerConfig } from "@/lib/homeBanner";
import { BannerSlider } from "@/components/home/HomeBanner";
import { toast } from "sonner";

type NumKey = "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "radius" | "intervalSec" | "width" | "heightMobile" | "heightDesktop";

export default function BannerSettings({ imageUrl, onChange }: { imageUrl: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getSetting, bulkUpdateSettings, isLoading } = useSiteSettings();
  const [config, setConfig] = useState<HomeBannerConfig>(() => parseHomeBannerConfig(undefined, imageUrl));
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {
    if (isLoading || loaded) return;
    setConfig(parseHomeBannerConfig(getSetting("home_banner_config"), getSetting("home_banner_image") || imageUrl));
    setLoaded(true);
  }, [isLoading, loaded, getSetting, imageUrl]);

  const patch = (p: Partial<HomeBannerConfig>) => setConfig(prev => {
    const next = { ...prev, ...p };
    if (p.images) onChange(next.images[0] || "");
    return next;
  });

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const valid = files.filter(f => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type));
    if (valid.length !== files.length) toast.error("শুধু JPG, PNG, WebP অথবা GIF ছবি নেওয়া হবে।");
    if (!valid.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of valid) {
        const path = `site/banner-${crypto.randomUUID()}.${file.type.split("/")[1]}`;
        const { error } = await api.storage.from("products").upload(path, file);
        if (error) throw error;
        urls.push(api.storage.from("products").getPublicUrl(path).data.publicUrl);
      }
      patch({ images: [...config.images, ...urls] });
      toast.success("ছবি যোগ হয়েছে। সেভ করুন।");
    } catch {
      toast.error("ছবি আপলোড হয়নি, আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const images = [...config.images];
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    [images[i], images[j]] = [images[j], images[i]];
    patch({ images });
  };

  const save = async () => {
    setSaving(true);
    try {
      await bulkUpdateSettings({
        home_banner_config: JSON.stringify(config),
        home_banner_image: config.images[0] || "",
      });
      toast.success("ব্যানার সেভ হয়েছে!");
    } catch {
      toast.error("ব্যানার সেভ হয়নি, আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  const numField = ({ k, label, max, unit = "px", min = 0 }: { k: NumKey; label: string; max: number; unit?: string; min?: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><Label htmlFor={`banner-${k}`}>{label}</Label><span className="text-muted-foreground">{config[k]}{unit}</span></div>
      <Input id={`banner-${k}`} type="number" min={min} max={max} value={config[k]} onChange={e => patch({ [k]: Math.min(max, Math.max(min, Number(e.target.value) || 0)) } as Partial<HomeBannerConfig>)} />
      <Slider aria-label={label} min={min} max={max} step={1} value={[config[k]]} onValueChange={([v]) => patch({ [k]: v } as Partial<HomeBannerConfig>)} />
    </div>
  );

  const busy = uploading || saving;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">হোমপেজ ব্যানার স্লাইডার</h2>

      <p className="text-sm text-muted-foreground">প্রোডাক্ট ও ক্যাটেগরি সেকশন সাজাতে “হোম পেজ” ট্যাবে যান।</p>

      <div className="space-y-3">
        <Label>ব্যানারের ছবিগুলো ({config.images.length})</Label>
        <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={upload} disabled={busy} />
        {config.images.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {config.images.map((src, i) => (
              <div key={src + i} className="overflow-hidden rounded-lg border border-border bg-muted">
                <img src={src} alt={`ব্যানার ${i + 1}`} className="block aspect-[16/7] w-full object-cover" />
                <div className="flex items-center justify-between p-1">
                  <span className="px-1 text-xs text-muted-foreground">#{i + 1}</span>
                  <div className="flex">
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="আগে নিন" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="পরে নিন" onClick={() => move(i, 1)} disabled={i === config.images.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label="সরান" onClick={() => patch({ images: config.images.filter((_, x) => x !== i) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {uploading ? "আপলোড হচ্ছে…" : "ছবি যোগ করুন (একাধিক বাছাই করা যাবে)"}
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="font-medium">স্লাইডারের উইথ ও হাইট</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="banner-width">উইথ (%)</Label>
            <Input id="banner-width" type="number" min={10} max={100} value={config.width} onChange={e => patch({ width: Math.min(100, Math.max(10, Number(e.target.value) || 100)) })} />
            <p className="text-xs text-muted-foreground">১০০% দিলে ফুল উইথ হবে। কমালে স্লাইডার মাঝখানে থাকবে।</p>
          </div>
          {([['heightDesktop', 'ডেস্কটপ হাইট (px)'], ['heightMobile', 'মোবাইল হাইট (px)']] as const).map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={`banner-${key}`}>{label}</Label>
              <Input id={`banner-${key}`} type="number" min={0} max={1600} value={config[key]} onChange={e => patch({ [key]: Math.min(1600, Math.max(0, Number(e.target.value) || 0)) })} />
              <p className="text-xs text-muted-foreground">০ দিলে এই ডিভাইসে অটো হাইট হবে। ডেস্কটপ: ১০২৪px বা বেশি; মোবাইল/ট্যাবলেট: এর নিচে।</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="font-medium">চার দিকের মার্জিন</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {numField({ k: "marginTop", label: "উপরে", max: 120, })}
          {numField({ k: "marginBottom", label: "নিচে", max: 120, })}
          {numField({ k: "marginLeft", label: "বামে", max: 120, })}
          {numField({ k: "marginRight", label: "ডানে", max: 120, })}
        </div>
        <h3 className="pt-2 font-medium">ছবির বর্ডার রেডিয়াস</h3>
        {numField({ k: "radius", label: "কোণার গোলাকার", max: 60, })}
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="font-medium">স্লাইডার সেটিং</h3>
        <div className="flex items-center justify-between"><Label>অটো স্লাইড</Label><Switch checked={config.autoplay} onCheckedChange={v => patch({ autoplay: v })} /></div>
        {config.autoplay && numField({ k: "intervalSec", label: "প্রতি স্লাইডের সময়", min: 2, max: 15, unit: " সেকেন্ড" })}
        <div className="flex items-center justify-between"><Label>নিচের ডট দেখাবে</Label><Switch checked={config.showDots} onCheckedChange={v => patch({ showDots: v })} /></div>
        <div className="flex items-center justify-between"><Label>ডানে-বামে তীর দেখাবে</Label><Switch checked={config.showArrows} onCheckedChange={v => patch({ showArrows: v })} /></div>
      </div>

      {config.images.length > 0 && (
        <div className="space-y-2">
          <Label>লাইভ প্রিভিউ</Label>
          <div className="rounded-lg border border-dashed border-border bg-muted/30">
            <BannerSlider key={`${config.images.join()}-${config.autoplay}-${config.intervalSec}`} config={config} />
          </div>
        </div>
      )}

      <Button onClick={save} disabled={busy}>
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        {saving ? "সেভ হচ্ছে…" : "ব্যানার সেভ করুন"}
      </Button>
    </section>
  );
}
