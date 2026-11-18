import { useState } from 'react';
import LogoUploader from './LogoUploader';
import { headerParts, headerTextParts, parseHeaderCustomization, type HeaderDevice, type HeaderPart, type HeaderPartSettings, type HeaderCustomization } from '@/lib/headerCustomization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HeaderComponentCustomizer({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [device,setDevice] = useState<HeaderDevice>('desktop');
  let config: HeaderCustomization = parseHeaderCustomization(value);
  try { const raw=JSON.parse(value); if (raw && typeof raw==='object') config={desktop:raw.desktop || {},mobile:raw.mobile || {}}; } catch { /* Keep safe defaults. */ }
  const patch = (part: HeaderPart, changes: Partial<HeaderPartSettings>) => onChange(JSON.stringify({ ...config, [device]: { ...config[device], [part]: { ...config[device][part], ...changes } } }));
  const parts = headerParts.filter(([part]) => device === 'desktop' || !['assurance','delivery','offer','brand','tagline','wishlist'].includes(part));
  return <section className="space-y-4 rounded-xl border p-4 mb-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">হেডারের প্রতিটি কম্পোনেন্ট কাস্টমাইজ করুন</h2><Button variant="outline" type="button" onClick={() => onChange(JSON.stringify({ ...config, [device]: {} }))}>এই ডিভাইসের ডিজাইন রিসেট</Button></div>
    <div className="flex gap-2">{(['desktop','mobile'] as const).map(d => <Button key={d} type="button" variant={device===d?'default':'outline'} aria-pressed={device===d} onClick={() => setDevice(d)}>{d==='desktop'?'ডেস্কটপ':'মোবাইল'}</Button>)}</div>
    <p className="text-sm text-muted-foreground">দুই ডিভাইসের ডিজাইন আলাদা। খালি রাখলে বর্তমান ডিজাইন থাকবে। পরিবর্তন শেষে নিচের “সেটিংস সেভ করুন” চাপুন। মেনুর লিংক নিচের সেটিংস থেকে বদলান। সেভ করার পর সাইট খুলে পরিবর্তন দেখুন।</p>
    <div className="grid gap-3 md:grid-cols-2">{parts.map(([part,label]) => {
      const s = config[device][part] || {}; const prefix=`header-${device}-${part}`;
      return <details key={`${device}-${part}`} className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">{label}</summary><div className="mt-4 space-y-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={s.visible !== false} onChange={e => patch(part,{visible:e.target.checked})} />দেখাবে</label>
        {part === 'logo' && <LogoUploader currentLogoUrl={s.imageUrl || ''} onLogoChange={imageUrl => patch(part,{imageUrl})} />}
        {headerTextParts.has(part) && <div><Label htmlFor={`${prefix}-text`}>{part==='searchInput'?'সার্চের placeholder':device==='mobile'?'বাটনের অ্যাক্সেসিবল নাম':part==='cart'?'কার্টের লেবেল':'লেখা'}</Label><Input id={`${prefix}-text`} value={s.text ?? ''} onChange={e => patch(part,{text:e.target.value})} placeholder="খালি রাখলে বর্তমান লেখা" /></div>}
        <div className="grid grid-cols-2 gap-3">{([['background','পটভূমি'],['color','লেখার রং'],['borderColor','বর্ডার'],['iconColor','আইকনের রং'],['hoverBackground','হোভার রং']] as const).map(([key,title]) => <div key={key}><Label htmlFor={`${prefix}-${key}`}>{title}</Label><div className="flex gap-1"><input aria-label={`${label} ${title} কালার পিকার`} type="color" value={s[key]?.startsWith('#')?s[key]:'#ffffff'} onChange={e => patch(part,{[key]:e.target.value})} className="h-9 w-9 shrink-0" /><Input id={`${prefix}-${key}`} value={s[key] ?? ''} onChange={e => patch(part,{[key]:e.target.value})} placeholder="#ffffff" /></div></div>)}</div>
        <div className="grid grid-cols-2 gap-3">{([['fontSize','লেখার সাইজ',10,32],['iconSize','আইকনের সাইজ',12,40],['radius','কোণার রেডিয়াস',0,48],['height','হাইট',24,144]] as const).map(([key,title,min,max]) => <div key={key}><Label htmlFor={`${prefix}-${key}`}>{title} (px)</Label><Input id={`${prefix}-${key}`} type="number" min={min} max={max} value={s[key] ?? ''} placeholder="ডিফল্ট" onChange={e => patch(part,{[key]:e.target.value})} /></div>)}</div>
        <Button type="button" variant="ghost" size="sm" onClick={() => {const next={...config[device]};delete next[part];onChange(JSON.stringify({...config,[device]:next}));}}>এই কম্পোনেন্ট রিসেট</Button>
      </div></details>;
    })}</div>
  </section>;
}
