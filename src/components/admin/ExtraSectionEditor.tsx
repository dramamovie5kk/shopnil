import { useState } from 'react';
import { toggleSectionDesign } from '@/lib/salesSectionDesignAvailability';
import { RotateCcw, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extraColors, extraComponents, extraSectionDesigns, type ExtraSettings, type ExtraSectionNumber } from '@/lib/extraSectionDesigns';

interface Props {
  number: ExtraSectionNumber; heading: string; points: string[]; settings: ExtraSettings;
  onHeading: (value: string) => void; onPoints: (value: string[], settings: ExtraSettings) => void;
  onSettings: (settings: ExtraSettings) => void;
}
export default function ExtraSectionEditor({ number, heading, points, settings: s, onHeading, onPoints, onSettings }: Props) {
  const [selected, setSelected] = useState('heading');
  const set = (key: string, value?: string) => { const next = { ...s }; if (value === undefined || value === '') delete next[key]; else next[key] = value; onSettings(next); };
  const id = (key: string) => `extra${number}-${key}`;
  const remove = (index: number) => {
    const next: ExtraSettings = {};
    for (const [key, value] of Object.entries(s)) {
      const match = key.match(/^point_(\d+)_(.*)$/);
      if (!match) next[key] = value;
      else { const i = Number(match[1]); if (i !== index) next[`point_${i > index ? i - 1 : i}_${match[2]}`] = value; }
    }
    setSelected('heading'); onPoints(points.filter((_, i) => i !== index), next);
  };
  const resetComponent = () => onSettings(Object.fromEntries(Object.entries(s).filter(([key]) => !key.startsWith(`${selected}_`) || key.endsWith('_description') || key.endsWith('_icon_text'))));
  return <div className="p-3 bg-muted/30 space-y-4">
    <Label className="text-sm font-semibold">এক্সট্রা সেকশন {number} ডিজাইন</Label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={`এক্সট্রা সেকশন ${number} ডিজাইন`}>
      {extraSectionDesigns.map(d => <Button key={d.id} type="button" role="radio" aria-checked={s.design === d.id} variant="outline" className={`h-auto min-h-24 flex-col gap-2 p-2 whitespace-normal ${s.design === d.id ? 'border-primary ring-2 ring-primary/30 bg-secondary' : ''}`} onClick={() => onSettings(toggleSectionDesign(s, d.id))}>
        <span aria-hidden="true" className={`extra-design-demo extra-design-demo--${d.id}`}><i /><i /><i /></span>
        <span className="text-xs">{d.id} · {d.label}</span>
      </Button>)}
    </div>
    <Button type="button" size="sm" variant="ghost" onClick={() => set('design')}><RotateCcw size={14} className="mr-1" />মূল ডিজাইন</Button>
    <div className="space-y-2"><Label htmlFor={id('heading')}>হেডিং</Label><Textarea id={id('heading')} value={heading} onChange={e => { onHeading(e.target.value); }} /></div>
    {s.design && <>
      {([['text_badge', 'ব্যাজ'], ['text_subtitle', 'হেডিংয়ের নিচের বর্ণনা'], ['text_button', 'অর্ডার বোতামের লেখা']] as const).map(([key, label]) => <div key={key} className="space-y-1"><Label htmlFor={id(key)}>{label}</Label><Textarea id={id(key)} value={s[key] ?? ''} onChange={e => set(key, e.target.value)} /></div>)}
      <div className="grid grid-cols-3 gap-2">{([['width', 'ডেস্কটপ সর্বোচ্চ উইথ', 1400], ['padding', 'চারদিকে প্যাডিং', 120], ['gap', 'পয়েন্টের গ্যাপ', 80]] as const).map(([key, label, max]) => <div key={key}><Label htmlFor={id(key)} className="text-xs">{label} (px)</Label><Input id={id(key)} type="number" min={key === 'width' ? 280 : 0} max={max} value={s[key] ?? ''} onChange={e => set(key, e.target.value)} /></div>)}</div>
      <div className="grid grid-cols-2 gap-2">{extraColors.map(([key, label]) => <div key={key} className="flex items-center justify-between gap-2"><Label htmlFor={id(key)} className="text-xs">{label}</Label><div className="flex items-center"><Input id={id(key)} type="color" className="w-9 h-8 p-0.5" value={/^#[\da-f]{6}$/i.test(s[key] ?? '') ? s[key] : key === 'background' || key === 'surface' || key === 'buttonText' ? '#ffffff' : '#16745b'} onChange={e => set(key, e.target.value)} /><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`${label} রিসেট`} onClick={() => set(key)}><RotateCcw size={12} /></Button></div></div>)}</div>
    </>}
    <div className="space-y-3">
      {points.map((point, i) => <div key={i} className="border-b border-border pb-3 space-y-2">
        <div className="flex justify-between items-center"><Label htmlFor={id(`point-${i}`)} className="text-xs">পয়েন্ট {i + 1}</Label><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label={`পয়েন্ট ${i + 1} মুছুন`} onClick={() => remove(i)}><Trash2 size={14} /></Button></div>
        <Textarea id={id(`point-${i}`)} value={point} onChange={e => onPoints(points.map((v, n) => n === i ? e.target.value : v), s)} />
        {s.design && <><Input aria-label={`পয়েন্ট ${i + 1} আইকন`} placeholder="আইকন / ইমোজি / সংখ্যা" value={s[`point_${i}_icon_text`] ?? ''} onChange={e => set(`point_${i}_icon_text`, e.target.value)} /><Textarea aria-label={`পয়েন্ট ${i + 1} বর্ণনা`} placeholder="পয়েন্টের বর্ণনা" value={s[`point_${i}_description`] ?? ''} onChange={e => set(`point_${i}_description`, e.target.value)} /></>}
      </div>)}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onPoints([...points, ''], s)}><Plus size={14} className="mr-1" />পয়েন্ট যোগ করুন</Button>
    </div>
    {s.design && <div className="space-y-3 border-t border-border pt-3">
      <Label className="font-semibold">প্রতিটি অংশ কাস্টমাইজ করুন</Label>
      <Select value={selected} onValueChange={setSelected}><SelectTrigger aria-label="কাস্টমাইজ করার অংশ"><SelectValue /></SelectTrigger><SelectContent>
        {extraComponents.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
        {points.flatMap((_, i) => (['item', 'icon', 'text', 'description'] as const).map(key => <SelectItem key={`${i}-${key}`} value={`point_${i}_${key}`}>পয়েন্ট {i + 1} · {extraComponents.find(c => c[0] === key)?.[1]}</SelectItem>))}
      </SelectContent></Select>
      <div className="flex justify-between"><Label htmlFor={id('enabled')}>এই অংশ দেখান</Label><Switch id={id('enabled')} checked={s[`${selected}_enabled`] !== '0'} onCheckedChange={v => set(`${selected}_enabled`, v ? '1' : '0')} /></div>
      <div className="grid grid-cols-2 gap-3">{([['color', 'লেখার রং'], ['background', 'পটভূমির রং'], ['border', 'বর্ডারের রং']] as const).map(([key, label]) => <div key={key} className="flex justify-between items-center gap-2"><Label htmlFor={id(`${selected}_${key}`)} className="text-xs">{label}</Label><div className="flex"><Input id={id(`${selected}_${key}`)} type="color" className="h-8 w-9 p-0.5" value={/^#[\da-f]{6}$/i.test(s[`${selected}_${key}`] ?? '') ? s[`${selected}_${key}`] : '#16745b'} onChange={e => set(`${selected}_${key}`, e.target.value)} /><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`${label} ফিরিয়ে আনুন`} onClick={() => set(`${selected}_${key}`)}><RotateCcw size={12} /></Button></div></div>)}</div>
      <div className="grid grid-cols-2 gap-2">{([['fontSize', 'ফন্ট সাইজ', 64], ['radius', 'বর্ডার রেডিয়াস', 80], ['borderWidth', 'বর্ডারের প্রস্থ', 12], ['padding', 'প্যাডিং', 80]] as const).map(([key, label, max]) => <div key={key}><Label htmlFor={id(`${selected}_${key}`)} className="text-xs">{label} (px)</Label><Input id={id(`${selected}_${key}`)} type="number" min="0" max={max} value={s[`${selected}_${key}`] ?? ''} onChange={e => set(`${selected}_${key}`, e.target.value)} /></div>)}</div>
      <Select value={s[`${selected}_alignment`] || 'default'} onValueChange={v => set(`${selected}_alignment`, v === 'default' ? undefined : v)}><SelectTrigger aria-label="লেখার অ্যালাইনমেন্ট"><SelectValue /></SelectTrigger><SelectContent>{[['default', 'মূল অ্যালাইনমেন্ট'], ['left', 'বামে'], ['center', 'মাঝে'], ['right', 'ডানে']].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
      <Button type="button" variant="outline" size="sm" onClick={resetComponent}><RotateCcw size={14} className="mr-1" />এই অংশ রিসেট</Button>
    </div>}
  </div>;
}
