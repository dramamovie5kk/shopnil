import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw } from 'lucide-react';
import { template02DesignOptions, type Template02Section } from '@/lib/template02Designs';
import { toggleSectionDesign } from '@/lib/salesSectionDesignAvailability';
import type { SalesPage } from '@/types/salesPage';
import Template02Hero01Editor from './Template02Hero01Editor';
import { Switch } from '@/components/ui/switch';

export default function Template02DesignEditor({ section, settings, onSetting, previewPage }: { section: Template02Section; settings: Record<string, string>; onSetting: (key: string, value: string | undefined) => void; previewPage?: SalesPage }) {
  const textFields = section === 'hero' ? [['headline', 'শিরোনাম'], ['subtitle', 'বর্ণনা'], ['badge', 'ব্যাজ'], ['button', 'অর্ডার বোতাম'], ['call', 'কল বোতাম'], ['urgency', 'বোতামের নিচের লেখা']] : section === 'gallery' ? [['title', 'শিরোনাম'], ['subtitle', 'শিরোনামের নিচের লেখা'], ['button', 'অর্ডার বোতাম']] : section === 'features' ? [['headline', 'শিরোনাম'], ['subtitle', 'শিরোনামের নিচের লেখা']] : section === 'reviews' ? [['headline', 'শিরোনাম'], ['subtitle', 'শিরোনামের নিচের লেখা']] : [['headline', 'শিরোনাম'], ['subtitle', 'শিরোনামের নিচের লেখা'], ['phoneAction', 'কল বোতাম'], ['whatsappAction', 'হোয়াটসঅ্যাপ বোতাম']];
  return <div className="space-y-3 border-b border-border pb-4">
    <Label>টেমপ্লেট ২ · সেকশন ডিজাইন</Label>
    <div role="radiogroup" aria-label={`টেমপ্লেট ২ ${section} ডিজাইন`} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {template02DesignOptions(section).map((design, i) => <Button key={design.id} type="button" role="radio" aria-checked={settings.design === design.id} variant="outline" className={`h-auto min-h-28 flex-col gap-2 whitespace-normal p-2 ${settings.design === design.id ? 'border-primary ring-2 ring-primary/30' : ''}`} onClick={() => onSetting('design', toggleSectionDesign(settings, design.id).design)}>
        <span className={`t2-design-preview t2-design-preview--${section} t2-design-preview--${i + 1}`} aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="text-xs">০{i + 1} · {design.label}</span>
      </Button>)}
    </div>
    <Button type="button" variant="ghost" size="sm" onClick={() => onSetting('design', undefined)}><RotateCcw size={14} /> মূল ডিজাইন</Button>
    {settings.design?.startsWith('t2-') && <>
      {section === 'hero' && settings.design === 't2-02' && <div className="space-y-3 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="t2h2-timer-enabled">অফার কাউন্টডাউন</Label>
          <Switch id="t2h2-timer-enabled" checked={settings.t2h2_timer_enabled !== '0'} onCheckedChange={enabled => onSetting('t2h2_timer_enabled', enabled ? '1' : '0')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t2h2-top-heading" className="text-xs">কাউন্টডাউনের সবচেয়ে উপরের ছোট হেডিং</Label>
          <Textarea id="t2h2-top-heading" className="min-h-16" value={settings.text_t2h2_top_heading ?? ''} onChange={e => onSetting('text_t2h2_top_heading', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t2h2-timer-title" className="text-xs">কাউন্টডাউনের উপরের অফার হেডিং</Label>
          <Textarea id="t2h2-timer-title" className="min-h-16" placeholder="অফার শেষ হতে বাকি" value={settings.text_t2h2_timer_title ?? ''} onChange={e => onSetting('text_t2h2_timer_title', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t2h2-timer-end" className="text-xs">অফারের শেষ তারিখ ও সময়</Label>
          <Input id="t2h2-timer-end" type="datetime-local" value={(() => {
            const date = new Date(settings.t2h2_timer_end || '');
            return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          })()} onChange={e => onSetting('t2h2_timer_end', e.target.value ? new Date(e.target.value).toISOString() : '')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t2h2-timer-expired" className="text-xs">সময় শেষ হলে লেখা</Label>
          <Input id="t2h2-timer-expired" placeholder="অফারের সময় শেষ" value={settings.text_t2h2_timer_expired ?? ''} onChange={e => onSetting('text_t2h2_timer_expired', e.target.value)} />
        </div>
      </div>}
      {section === 'hero' && settings.design === 't2-01' ? <Template02Hero01Editor settings={settings} onSetting={onSetting} page={previewPage} /> : <div className="grid gap-2">{textFields.map(([key, label]) => <div key={key}><Label htmlFor={`t2-${section}-${key}`} className="text-xs">{label}</Label><Textarea id={`t2-${section}-${key}`} className="min-h-16" value={settings[`text_${key}`] ?? ''} onChange={e => onSetting(`text_${key}`, e.target.value)} /></div>)}</div>}
      <div className="grid grid-cols-2 gap-2">{[['background', 'পটভূমি'], ['surface', 'বক্সের রং'], ['heading', 'শিরোনামের রং'], ['text', 'লেখার রং'], ['accent', 'প্রধান রং'], ['buttonText', 'বোতামের লেখার রং'], ['border', 'বর্ডারের রং']].map(([key, label]) => <div key={key} className="space-y-1"><Label htmlFor={`t2-${section}-color-${key}`} className="text-xs">{label}</Label><div className="flex gap-1"><Input type="color" aria-label={`${label} বাছাই`} className="h-9 w-10 shrink-0 p-1" value={/^#[\da-f]{6}$/i.test(settings[`t2_${key}`] ?? '') ? settings[`t2_${key}`] : '#16806a'} onChange={e => onSetting(`t2_${key}`, e.target.value)} /><Input id={`t2-${section}-color-${key}`} placeholder="#rrggbb" maxLength={7} value={settings[`t2_${key}`] ?? ''} onChange={e => onSetting(`t2_${key}`, e.target.value)} /><Button type="button" variant="ghost" size="icon" title={`${label} মূল রং`} onClick={() => onSetting(`t2_${key}`, undefined)}><RotateCcw size={13} /></Button></div></div>)}</div>
    </>}
  </div>;
}
