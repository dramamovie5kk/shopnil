import { faviconPng } from '@/lib/faviconImage';
import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/integrations/cloudflare/client';
import { toast } from 'sonner';

export default function FaviconUploader({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy,setBusy] = useState(false);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0]; event.target.value=''; if (!file) return;
    const extensions: Record<string,string> = {'image/png':'png','image/webp':'webp','image/jpeg':'jpg'};
    if (!extensions[file.type] || file.size>2*1024*1024) { toast.error('PNG, WebP বা JPG ছবি দিন (সর্বোচ্চ ২MB)।'); return; }
    setBusy(true);
    try {
      const png=await faviconPng(file);
      const path=`site/favicon-${crypto.randomUUID()}.png`;
      const {error}=await api.storage.from('products').upload(path,png); if(error) throw error;
      onChange(api.storage.from('products').getPublicUrl(path).data.publicUrl);
      toast.success('Favicon আপলোড হয়েছে। সেটিংস সেভ করুন।');
    } catch { toast.error('Favicon আপলোড হয়নি। আবার চেষ্টা করুন।'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-3 rounded-lg border p-4">
    <Label htmlFor="site_favicon_url">ব্রাউজারের আইকন (Favicon)</Label>
    <p className="text-sm text-muted-foreground">ব্রাউজারের ট্যাবে সাইটের নামের পাশে দেখাবে। বর্গাকার PNG ছবি ব্যবহার করুন—৩২×৩২ বা ৬৪×৬৪ পিক্সেল ভালো। সর্বোচ্চ ২MB।</p>
    <div className="flex flex-wrap items-center gap-3">
      <img src={value || '/favicon.ico'} alt="Favicon প্রিভিউ" className="h-12 w-12 rounded border bg-muted p-2 object-contain" />
      <input id="favicon-file" ref={input} type="file" accept="image/png,image/webp,image/jpeg" className="hidden" disabled={busy} onChange={upload} />
      <Button type="button" variant="outline" disabled={busy} onClick={()=>input.current?.click()}>{busy?<Loader2 className="mr-2 h-4 w-4 animate-spin" />:<Upload className="mr-2 h-4 w-4" />}Favicon আপলোড করুন</Button>
      {value && <Button type="button" variant="ghost" disabled={busy} onClick={()=>onChange('')}>Favicon সরান</Button>}
    </div>
    <Input id="site_favicon_url" value={value} onChange={e=>onChange(e.target.value)} placeholder="অথবা https://... ছবির URL দিন" />
  </div>;
}
