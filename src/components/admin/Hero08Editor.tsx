import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { hero08ColorFields, hero08TextFields } from '@/lib/hero08Design';

interface Props {
  settings: Record<string, string>;
  whatsappNumber: string;
  whatsappMessage: string;
  originalPrice: number;
  offerPrice: number;
  onSetting: (key: string, value: string | undefined) => void;
  onPrice: (key: 'original_price' | 'offer_price', value: number) => void;
}

export default function Hero08Editor({ settings, whatsappNumber, whatsappMessage, originalPrice, offerPrice, onSetting, onPrice }: Props) {
  return <div className="space-y-3 border-t border-border pt-3">
    <Label className="text-sm font-semibold">৮ নম্বর ডিজাইনের লেখা, দাম ও হোয়াটসঅ্যাপ</Label>
    {hero08TextFields.map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero08-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero08-${field.key}`} value={settings[field.key] ?? field.fallback} onChange={e => onSetting(field.key, e.target.value)} /></div>)}
    <div className="grid grid-cols-2 gap-2">{([{ key: 'original_price', label: 'নিয়মিত দাম (৳)', value: originalPrice }, { key: 'offer_price', label: 'অফার দাম (৳)', value: offerPrice }] as const).map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero08-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero08-${field.key}`} type="number" min="0" value={field.value || ''} onChange={e => onPrice(field.key, Number(e.target.value) || 0)} /></div>)}</div>
    <div className="space-y-1"><Label htmlFor="hero08-whatsapp-number" className="text-xs">হোয়াটসঅ্যাপ নম্বর</Label><Input id="hero08-whatsapp-number" type="tel" placeholder="+8801XXXXXXXXX" value={settings.hero08_whatsapp_number ?? whatsappNumber} onChange={e => onSetting('hero08_whatsapp_number', e.target.value)} /></div>
    <div className="space-y-1"><Label htmlFor="hero08-whatsapp-message" className="text-xs">হোয়াটসঅ্যাপে পাঠানোর বার্তা</Label><Input id="hero08-whatsapp-message" value={settings.text_hero08_whatsapp_message ?? whatsappMessage} onChange={e => onSetting('text_hero08_whatsapp_message', e.target.value)} /></div>
    <div className="space-y-2 border-t border-border pt-3"><Label className="text-sm font-semibold">৮ নম্বর ডিজাইনের বিশেষ রং</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{hero08ColorFields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`hero08-color-${field.key}`} className="text-xs">{field.label}</Label><div className="flex items-center gap-1"><Input id={`hero08-color-${field.key}`} type="color" aria-label={`${field.label} রং`} className="h-8 w-9 cursor-pointer p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(settings[field.key] || '') ? settings[field.key] : '#ffffff'} onChange={e => onSetting(field.key, e.target.value)} /><Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} placeholder="#rrggbb" value={settings[field.key] ?? ''} onChange={e => onSetting(field.key, e.target.value)} />{settings[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="রং ফিরিয়ে আনুন" onClick={() => onSetting(field.key, undefined)}><X size={13} /></Button>}</div></div>)}</div>
    </div>
  </div>;
}