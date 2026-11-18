import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { appearanceGroups, appearanceNamespace, appearanceSteps, readAppearance, writeAppearance, type AppearanceSettings } from '@/lib/sectionAppearance';

interface Props { section: string; template: string; settings: AppearanceSettings; onSettings: (settings: AppearanceSettings) => void; children: ReactNode }
export default function SectionStepEditor({ section, template, settings, onSettings, children }: Props) {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState('section');
  const [parts, setParts] = useState<{ id: string; label: string }[]>([]);
  const namespace = appearanceNamespace(template, settings.design);
  const values = readAppearance(settings, namespace);
  useEffect(() => {
    const refresh = () => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe[title$="লাইভ প্রিভিউ"]');
      const host = frame?.contentDocument?.querySelector(`[data-sales-appearance="${section}"]`);
      const found = host ? [...host.querySelectorAll('[data-sales-part]')].map(el => {
        const id = el.getAttribute('data-sales-part') || '';
        const [kind, index] = id.split('-');
        const label = appearanceGroups.find(group => group[0] === kind)?.[1] || kind;
        const text = (el.getAttribute('alt') || el.textContent || '').trim().slice(0, 32);
        return { id, label: `${label} ${Number(index) + 1}${text ? ` · ${text}` : ''}` };
      }) : [];
      setParts(prev => JSON.stringify(prev) === JSON.stringify(found) ? prev : found);
    };
    refresh(); const timer = window.setInterval(refresh, 650); return () => window.clearInterval(timer);
  }, [section, namespace]);
  const set = (key: string, value: string) => {
    const next = { ...values }; if (value === '') delete next[`${target}.${key}`]; else next[`${target}.${key}`] = value;
    onSettings(writeAppearance(settings, namespace, next));
  };
  const numeric = (key: string, label: string, min: number, max: number, unit = 'px', increment = 1) => <div key={key} className="space-y-1">
    <Label htmlFor={`appearance-${section}-${key}`} className="text-xs">{label} ({unit})</Label>
    <Input id={`appearance-${section}-${key}`} type="number" min={min} max={max} step={increment} value={values[`${target}.${key}`] ?? ''} onChange={e => set(key, e.target.value)} />
  </div>;
  if (section.startsWith('cs-')) return <>{children}</>;
  const originalExtra = /^extra[123]$/.test(section) && !settings.design;
  if (originalExtra) {
    const update = (key: string, value: string) => {
      const next = { ...values };
      if (value === '') delete next[key]; else next[key] = value;
      onSettings(writeAppearance(settings, namespace, next));
    };
    const swatch = (key: string, label: string, fallback = '#16745b') => <div key={key} className="flex min-w-0 items-center justify-between gap-2">
      <Label htmlFor={`${section}-direct-${key}`} className="text-xs">{label}</Label>
      <div className="flex shrink-0 items-center gap-1"><Input id={`${section}-direct-${key}`} type="color" className="h-8 w-9 p-1" value={/^#[\da-f]{6}$/i.test(values[key] || '') ? values[key] : fallback} onChange={e => update(key, e.target.value)} /><Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label={`${label} রিসেট`} onClick={() => update(key, '')}><RotateCcw size={14} /></Button></div>
    </div>;
    const size = (key: string, label: string) => <div key={key} className="min-w-0 space-y-1"><Label htmlFor={`${section}-direct-${key}`} className="text-xs">{label} (px)</Label><Input id={`${section}-direct-${key}`} type="number" min={8} max={96} value={values[key] ?? ''} placeholder="মূল সাইজ" onChange={e => update(key, e.target.value)} /></div>;
    return <>{children}<div className="space-y-4 border-t border-border p-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {swatch('section.background', 'পটভূমি', '#ffffff')}{swatch('heading.color', 'হেডিং')}
        {swatch('text.color', 'লেখা')}{swatch('box.background', 'পয়েন্টের বক্স', '#ffffff')}
        {swatch('box.borderColor', 'বর্ডার')}{swatch('icon.color', 'আইকন ও অ্যাকসেন্ট')}
        {swatch('button.background', 'বোতাম')}{swatch('button.color', 'বোতামের লেখা', '#ffffff')}
      </div>
      <div className="grid grid-cols-2 gap-3">{size('heading.fontSize', 'হেডিং সাইজ')}{size('text.fontSize', 'লেখার সাইজ')}{size('button.fontSize', 'বোতামের সাইজ')}</div>
      <details className="border-t border-border pt-3"><summary className="cursor-pointer text-sm font-medium">প্রতিটি অংশ আলাদাভাবে</summary><div className="mt-3 space-y-3">{parts.map(part => <div key={part.id} className="space-y-2 border-b border-border pb-3"><Label className="block break-words text-xs font-semibold">{part.label}</Label><div className="grid grid-cols-2 gap-2">{swatch(`${part.id}.color`, 'লেখা / আইকনের রং')}{swatch(`${part.id}.background`, 'পটভূমির রং', '#ffffff')}{swatch(`${part.id}.borderColor`, 'বর্ডারের রং')}{size(`${part.id}.fontSize`, 'ফন্ট সাইজ')}</div></div>)}</div></details>
    </div></>;
  }
  return <Tabs defaultValue="content" className="min-w-0">
    <TabsList className="w-full"><TabsTrigger value="content" className="flex-1">লেখা ও ডিজাইন</TabsTrigger><TabsTrigger value="appearance" className="flex-1">ধাপে ধাপে সাজান</TabsTrigger></TabsList>
    <TabsContent value="content">{children}</TabsContent>
    <TabsContent value="appearance" className="px-3 pb-3 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border py-2"><strong className="text-sm">{step + 1}/5 · {appearanceSteps[step]}</strong><Button type="button" variant="ghost" size="icon" title="এই অংশ রিসেট" aria-label="এই অংশ রিসেট" onClick={() => onSettings(writeAppearance(settings, namespace, Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith(`${target}.`)))))}><RotateCcw size={16} /></Button></div>
      <div className="space-y-2"><Label>কাস্টমাইজ করার অংশ</Label><Select value={target} onValueChange={setTarget}><SelectTrigger aria-label="সাজানোর অংশ"><SelectValue /></SelectTrigger><SelectContent>
        {appearanceGroups.filter(([key]) => section === 'checkout' || !['input','label'].includes(key)).map(([key,label]) => <SelectItem value={key} key={key}>{label}{key !== 'section' ? ' · সবগুলো' : ''}</SelectItem>)}
        {parts.map(part => <SelectItem value={part.id} key={part.id}>{part.label}</SelectItem>)}
      </SelectContent></Select></div>
      {step === 0 && <div className="grid grid-cols-2 gap-2">{appearanceSteps.slice(1).map((label,i) => <Button key={label} type="button" variant="outline" onClick={() => setStep(i+1)}>{label}<ArrowRight size={14} /></Button>)}</div>}
      {step === 1 && <div className="space-y-3">{[['color','লেখা / আইকনের রং'],['background','পটভূমি'],['borderColor','বর্ডারের রং']].map(([key,label]) => <div className="space-y-1" key={key}><Label htmlFor={`appearance-${section}-${key}`}>{label}</Label><div className="flex gap-2"><Input aria-label={`${label} বাছাই`} type="color" className="w-12 p-1" value={/^#[\da-f]{6}$/i.test(values[`${target}.${key}`] || '') ? values[`${target}.${key}`] : '#267663'} onChange={e => set(key,e.target.value)} /><Input id={`appearance-${section}-${key}`} value={values[`${target}.${key}`] ?? ''} placeholder="#rrggbb" onChange={e => set(key,e.target.value)} /><Button type="button" size="icon" variant="ghost" aria-label={`${label} রিসেট`} onClick={() => set(key,'')}><RotateCcw size={14} /></Button></div></div>)}<Button type="button" variant="outline" onClick={() => set('background','transparent')}>স্বচ্ছ পটভূমি</Button>{numeric('opacity','স্বচ্ছতা',0.1,1,'0.1–1',0.05)}</div>}
      {step === 2 && <div className="space-y-3"><div className="grid grid-cols-2 gap-2">{numeric('fontSize','টেক্সট সাইজ',8,96)}{numeric('lineHeight','লাইনের উচ্চতা',1,3,'গুণ',0.1)}</div><Label>লেখার গাঢ়ত্ব</Label><Select value={values[`${target}.weight`] || 'default'} onValueChange={v => set('weight',v === 'default' ? '' : v)}><SelectTrigger aria-label="লেখার গাঢ়ত্ব"><SelectValue /></SelectTrigger><SelectContent>{[['default','মূল ডিজাইন'],['400','স্বাভাবিক'],['500','মাঝারি'],['600','সেমি বোল্ড'],['700','বোল্ড'],['800','এক্সট্রা বোল্ড'],['900','সবচেয়ে গাঢ়']].map(([value,label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select><Label>অ্যালাইনমেন্ট</Label><Select value={values[`${target}.alignment`] || 'default'} onValueChange={v => set('alignment',v === 'default' ? '' : v)}><SelectTrigger aria-label="অ্যালাইনমেন্ট"><SelectValue /></SelectTrigger><SelectContent>{[['default','মূল ডিজাইন'],['left','বামে'],['center','মাঝে'],['right','ডানে']].map(([value,label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></div>}
      {step === 3 && <div className="grid grid-cols-2 gap-3">{numeric('width','উইথ',1,100,'%')}{numeric('maxWidth','সর্বোচ্চ উইথ',100,1800)}{numeric('paddingTop','ভেতরে উপরের ফাঁক',0,160)}{numeric('paddingBottom','ভেতরে নিচের ফাঁক',0,160)}{numeric('paddingLeft','ভেতরে বাঁয়ের ফাঁক',0,160)}{numeric('paddingRight','ভেতরে ডানের ফাঁক',0,160)}{numeric('marginTop','বাইরে উপরের ফাঁক',0,160)}{numeric('marginBottom','বাইরে নিচের ফাঁক',0,160)}{target.startsWith('image') && <Select value={values[`${target}.fit`] || 'default'} onValueChange={v => set('fit',v === 'default' ? '' : v)}><SelectTrigger aria-label="ছবি দেখানোর ধরন"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">মূল ডিজাইন</SelectItem><SelectItem value="contain">পুরো ছবি</SelectItem><SelectItem value="cover">ফ্রেম পূরণ</SelectItem></SelectContent></Select>}</div>}
      {step === 4 && <div className="grid grid-cols-2 gap-2">{numeric('radius','বর্ডার রেডিয়াস',0,160)}{numeric('borderWidth','বর্ডারের প্রস্থ',0,16)}</div>}
      <div className="flex justify-between border-t border-border pt-3"><Button type="button" variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(v => v-1)}><ArrowLeft size={14} />আগের ধাপ</Button><Button type="button" size="sm" disabled={step === 4} onClick={() => setStep(v => v+1)}>পরের ধাপ<ArrowRight size={14} /></Button></div>
    </TabsContent>
  </Tabs>;
}