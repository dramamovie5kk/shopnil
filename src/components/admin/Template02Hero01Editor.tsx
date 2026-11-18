import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw } from 'lucide-react';
import GalleryImageUploader from './GalleryImageUploader';
import { t2Hero01Parts, t2Hero01Props } from '@/components/salespage/Template02Hero01';
import type { SalesPage } from '@/types/salesPage';
import { template02HeroImages } from '@/lib/template02HeroImages';

export default function Template02Hero01Editor({ settings: s, onSetting, page }: { settings: Record<string, string>; onSetting: (key: string, value: string | undefined) => void; page?: SalesPage }) {
  const images = template02HeroImages(page, s);
  return <div className="space-y-3">
    <p className="text-[10px] text-muted-foreground">সব টেক্সট ফিল্ডে HTML/CSS সাপোর্টেড — যেমন &lt;span style="color:#f39c12;font-size:24px"&gt;গোল্ডেন টেক্সট&lt;/span&gt;। HTML না দিলে সাধারণ লেখাই থাকবে।</p>
    {([['announcement', 'সবার উপরের ছোট মেসেজ'], ['logo_letter', 'লোগোর অক্ষর (ছবি না দিলে)'], ['brand', 'হেডারের লেখা (লোগোর পাশে)'], ['brand_subtitle', 'ব্র্যান্ডের নিচের ছোট লেখা'], ['header_button', 'হেডারের অর্ডার বোতামের লেখা'], ['headline', 'নিচের বড় হেডিং টেক্সট'], ['button', 'নিচের অর্ডার বোতামের লেখা'], ['call', 'কল বোতামের লেখা'], ['urgency', 'সবশেষের হালকা লেখা']] as const).map(([key, label]) => <div key={key} className="space-y-1"><Label htmlFor={`t2h1-text-${key}`} className="text-xs">{label}</Label><Textarea id={`t2h1-text-${key}`} placeholder={key === 'brand' ? 'সুপার কোয়ালিটি অফার' : undefined} value={s[`text_${key}`] ?? ''} onChange={e => onSetting(`text_${key}`, e.target.value)} className="min-h-16" /></div>)}
    <GalleryImageUploader label="হেডারের লোগো" uploadText="লোগো আপলোড করুন" maxImages={1} images={s.t2h1_logo ? [s.t2h1_logo] : []} onChange={images => onSetting('t2h1_logo', images[0] ?? '')} />
    <div className="space-y-1"><Label htmlFor="t2h1-video-url">হেডিংয়ের নিচের ভিডিও লিংক</Label><Input id="t2h1-video-url" value={s.t2h1_video_url ?? page?.hero_video_url ?? ''} onChange={e => onSetting('t2h1_video_url', e.target.value)} placeholder="https://youtube.com/... অথবা .mp4" /></div>
    <div className="min-w-0 space-y-2"><GalleryImageUploader label="স্লাইডারের ছবি" uploadText="ছবি যোগ করুন" images={images} onChange={next => onSetting('t2h1_images', JSON.stringify(next))} /><Label htmlFor="t2h1_images">ছবির লিংক</Label><Textarea id="t2h1_images" aria-label="স্লাইডারের ছবির URL" value={images.join('\n')} onChange={e => onSetting('t2h1_images', JSON.stringify(e.target.value.split('\n')))} placeholder="https://..." /></div>
    <div className="border-t border-border pt-3 space-y-2"><Label>প্রতিটি অংশ আলাদা করে সাজান</Label>{t2Hero01Parts.map(([part, label]) => <details key={part} className="border border-border rounded-md p-2"><summary className="text-xs font-semibold cursor-pointer">{label}</summary><div className="mt-2 grid grid-cols-2 gap-2">{t2Hero01Props.map(([prop, plabel, type]) => { const key = `t2h1_${part}_${prop}`; return <div key={prop} className="space-y-1"><Label htmlFor={key} className="text-xs">{plabel}</Label><div className="flex gap-1">{type === 'color' && <Input type="color" aria-label={`${label} ${plabel}`} className="h-8 w-8 shrink-0 p-1" value={/^#[\da-f]{6}$/i.test(s[key] ?? '') ? s[key] : '#7d2020'} onChange={e => onSetting(key, e.target.value)} />}<Input id={key} type={type === 'number' ? 'number' : 'text'} min={0} className="h-8 min-w-0 text-xs" value={s[key] ?? ''} onChange={e => onSetting(key, e.target.value || undefined)} />{s[key] && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="রিসেট" onClick={() => onSetting(key, undefined)}><RotateCcw size={12} /></Button>}</div></div>; })}</div></details>)}</div>
  </div>;
}