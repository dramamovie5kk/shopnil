import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { hero10ColorFields, hero10TextFields } from '@/lib/hero10Design';

export default function Hero10Editor({ settings, defaults, originalPrice, offerPrice, onPrice, onSetting }: { settings: Record<string, string>; defaults: Record<string, string>; originalPrice: number; offerPrice: number; onPrice: (key: 'original_price' | 'offer_price', value: number) => void; onSetting: (key: string, value: string | undefined) => void }) {
  return <div className="space-y-3 border-t border-border pt-3">
    <Label className="text-sm font-semibold">১০ নম্বর ডিজাইনের লেখা ও বোতাম</Label>
    <div className="grid grid-cols-2 gap-2">{([{ key: 'original_price', label: 'আগের দাম (৳)', value: originalPrice }, { key: 'offer_price', label: 'অফার দাম (৳)', value: offerPrice }] as const).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero10-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero10-${field.key}`} type="number" min="0" value={field.value || ''} onChange={e => onPrice(field.key, Number(e.target.value) || 0)} /></div>)}</div>
    {hero10TextFields.map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero10-${field.key}`} className="text-xs">{field.label}</Label><Textarea id={`hero10-${field.key}`} rows={2} value={settings[field.key] ?? defaults[field.key] ?? field.fallback} onChange={e => onSetting(field.key, e.target.value)} /></div>)}
    <div className="space-y-1"><Label htmlFor="hero10-video-url">পরিচিতি ভিডিও লিংক</Label><Input id="hero10-video-url" type="url" value={settings.hero10_video_url ?? defaults.hero10_video_url ?? ''} onChange={e => onSetting('hero10_video_url', e.target.value)} /></div>
    <Label className="text-sm font-semibold">১০ নম্বর ডিজাইনের বিশেষ রং</Label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{hero10ColorFields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`hero10-color-${field.key}`} className="text-xs">{field.label}</Label><div className="flex items-center gap-1"><Input id={`hero10-color-${field.key}`} type="color" className="h-8 w-9 p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(settings[field.key] || '') ? settings[field.key] : field.fallback} onChange={e => onSetting(field.key, e.target.value)} /><Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} value={settings[field.key] ?? ''} onChange={e => onSetting(field.key, e.target.value)} />{settings[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`${field.label} রং ফিরিয়ে আনুন`} onClick={() => onSetting(field.key, undefined)}><X size={13} /></Button>}</div></div>)}</div>
  </div>;
}