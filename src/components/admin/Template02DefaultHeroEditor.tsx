import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { t2DefaultHeroColors, t2DefaultHeroParts, t2DefaultHeroProps } from '@/components/salespage/Template02DefaultHero';

const fields = [
  ['brand', 'ব্র্যান্ডের নাম (হেডার)', 'Stylor fashion'],
  ['call_text', 'কল বোতামের লেখা', 'কল করুন'],
  ['badge', 'ব্যাজ', '৪ বছর ধরে হাজারো পরিবারের ভরসা'],
  ['title', 'শিরোনাম (সাদা অংশ)', 'Stylor Fashion'],
  ['title_accent', 'শিরোনাম (সোনালি অংশ)', 'সিনথেটিক লেদার মোজা'],
  ['desc', 'বর্ণনা', 'নরম সিনথেটিক লেদার...'],
  ['button', 'অর্ডার বোতামের লেখা', 'এখনই অর্ডার করুন'],
  ['video_url', 'ভিডিও লিংক (দিলে ছবির জায়গায় ভিডিও)', 'https://youtube.com/...'],
] as const;

export default function Template02DefaultHeroEditor({ settings, onSetting, images }: { settings: Record<string, string>; onSetting: (key: string, value: string | undefined) => void; images: ReactNode }) {
  return <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
    <Label className="text-sm font-semibold">মূল হিরো ডিজাইন — লেখা, রং, ছবি ও ভিডিও</Label>
    <div className="flex items-center justify-between"><Label htmlFor="t2d-header" className="text-xs">হেডার দেখান</Label><Switch id="t2d-header" checked={settings.t2d_header !== '0'} onCheckedChange={c => onSetting('t2d_header', c ? undefined : '0')} /></div>
    {fields.map(([key, label, ph]) => <div key={key} className="space-y-1"><Label htmlFor={`t2d-${key}`} className="text-xs">{label}</Label>
      {key === 'desc' ? <Textarea id={`t2d-${key}`} placeholder={ph} value={settings[`t2d_${key}`] ?? ''} onChange={e => onSetting(`t2d_${key}`, e.target.value)} />
        : <Input id={`t2d-${key}`} placeholder={ph} value={settings[`t2d_${key}`] ?? ''} onChange={e => onSetting(`t2d_${key}`, e.target.value)} />}</div>)}
    <div className="space-y-1"><Label htmlFor="t2d-perks" className="text-xs">নিচের সুবিধাগুলো (প্রতি লাইনে একটি)</Label><Textarea id="t2d-perks" placeholder={'ক্যাশ অন ডেলিভারি\nসাইজ এক্সচেঞ্জ সুবিধা'} value={settings.t2d_perks ?? ''} onChange={e => onSetting('t2d_perks', e.target.value)} /></div>
    <p className="text-xs text-muted-foreground">খালি রাখলে পেজের সাধারণ লেখা দেখাবে। কল নম্বর যোগাযোগ সেকশন থেকে নেয়।</p>
    <div className="grid grid-cols-2 gap-2">{t2DefaultHeroColors.map(([key, label, def]) => <div key={key} className="space-y-1"><Label className="text-xs">{label}</Label><div className="flex gap-1">
      <Input type="color" aria-label={label} className="h-9 w-10 shrink-0 p-1" value={/^#[\da-f]{6}$/i.test(settings[`t2d_${key}`] ?? '') ? settings[`t2d_${key}`] : def} onChange={e => onSetting(`t2d_${key}`, e.target.value)} />
      <Input placeholder={def} maxLength={7} value={settings[`t2d_${key}`] ?? ''} onChange={e => onSetting(`t2d_${key}`, e.target.value)} />
      <Button type="button" variant="ghost" size="icon" title="মূল রং" onClick={() => onSetting(`t2d_${key}`, undefined)}><RotateCcw size={13} /></Button></div></div>)}</div>
    <div className="space-y-2 border-t border-border pt-3"><Label className="text-sm font-semibold">প্রতিটি অংশ আলাদা করে সাজান</Label>
      {t2DefaultHeroParts.map(([part, plabel]) => <details key={part} className="rounded border border-border bg-background p-2"><summary className="cursor-pointer text-xs font-semibold">{plabel}</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">{t2DefaultHeroProps.map(([prop, label, type]) => { const k = `t2dc_${part}_${prop}`; const v = settings[k] ?? ''; return <div key={prop} className="space-y-1"><Label className="text-[11px]">{label}</Label><div className="flex gap-1">
          {type === 'color' && <Input type="color" aria-label={`${plabel} ${label}`} className="h-8 w-9 shrink-0 p-0.5" value={/^#[\da-f]{6}$/i.test(v) ? v : '#d4a63a'} onChange={e => onSetting(k, e.target.value)} />}
          <Input className="h-8 text-xs" type={type === 'number' ? 'number' : 'text'} min={0} placeholder={type === 'color' ? '#rrggbb' : 'auto'} value={v} onChange={e => onSetting(k, e.target.value || undefined)} />
          {v && <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="রিসেট" onClick={() => onSetting(k, undefined)}><RotateCcw size={12} /></Button>}</div></div>; })}</div>
        <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => t2DefaultHeroProps.forEach(([prop]) => onSetting(`t2dc_${part}_${prop}`, undefined))}><RotateCcw size={12} /> এই অংশ রিসেট</Button>
      </details>)}
    </div>
    <div className="space-y-1"><Label className="text-xs">হিরোর ছবি (প্রথম ছবিটি দেখাবে)</Label>{images}</div>
  </div>;
}
