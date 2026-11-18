import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomSection } from './CustomSectionEditor';
import { customElementLabels, resolveCustomButtons, type CustomElementStyle, type CustomElementKey, type CustomSectionButton } from '@/lib/customSectionElements';

function AppearanceFields({ id, value, onChange, media = false, button = false }: {
  id: string; value: CustomElementStyle; onChange: (value: CustomElementStyle) => void; media?: boolean; button?: boolean;
}) {
  const set = (key: keyof CustomElementStyle, next: string | boolean) => onChange({ ...value, [key]: next });
  return <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Checkbox id={`${id}-enabled`} checked={value.enabled !== false} onCheckedChange={v => set('enabled', v === true)} />
      <Label htmlFor={`${id}-enabled`} className="text-xs">দেখান</Label>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {([['backgroundColor', 'ব্যাকগ্রাউন্ড'], ['textColor', 'টেক্সট'], ['borderColor', 'বর্ডার']] as const).filter(([key]) => !media || key !== 'textColor').map(([key, label]) => <div key={key}>
        <Label htmlFor={`${id}-${key}`} className="text-[10px]">{label}</Label>
        <div className="flex gap-1">
          <input type="color" aria-label={`${label} বাছুন`} value={/^#[\da-f]{6}$/i.test(value[key] || '') ? value[key] : '#000000'} onChange={e => set(key, e.target.value)} className="w-7 h-7 shrink-0 border rounded cursor-pointer" />
          <Input id={`${id}-${key}`} value={value[key] || ''} onChange={e => set(key, e.target.value)} placeholder="মূল রঙ" className="h-7 text-[10px] min-w-0" />
        </div>
      </div>)}
    </div>
    <div className="grid grid-cols-2 gap-2">
      {([['fontSize', 'ফন্ট সাইজ'], ['borderWidth', 'বর্ডার উইথ'], ['borderRadius', 'বর্ডার রেডিয়াস'], ['padding', 'প্যাডিং']] as const).filter(([key]) => !media || key !== 'fontSize').map(([key, label]) => <div key={key}>
        <Label htmlFor={`${id}-${key}`} className="text-[10px]">{label} (px)</Label>
        <Input id={`${id}-${key}`} type="number" min="0" value={value[key] ?? ''} onChange={e => set(key, e.target.value)} placeholder="মূল মান" className="h-7 text-xs" />
      </div>)}
      {!media && <div><Label className="text-[10px]">অ্যালাইনমেন্ট</Label><Select value={value.alignment || 'inherit'} onValueChange={v => onChange({ ...value, alignment: v === 'inherit' ? undefined : v as CustomElementStyle['alignment'] })}>
        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="inherit">মূল অবস্থান</SelectItem><SelectItem value="left">বামে</SelectItem><SelectItem value="center">মাঝে</SelectItem><SelectItem value="right">ডানে</SelectItem>
        </SelectContent></Select></div>}
    </div>
    {(media || button) && <div className="space-y-2 border-t pt-2">
      <Label htmlFor={`${id}-desktopWidth`} className="text-[10px]">ডেস্কটপ উইথ (%)</Label>
      <Input id={`${id}-desktopWidth`} type="number" min="1" max="100" value={value.desktopWidth ?? ''} onChange={e => set('desktopWidth', e.target.value)} placeholder="স্বয়ংক্রিয়" className="h-7 text-xs" />
      {media && <div className="grid grid-cols-2 gap-2">
        {([['desktopPaddingLeft', 'ডেস্কটপ বাম প্যাডিং'], ['desktopPaddingRight', 'ডেস্কটপ ডান প্যাডিং']] as const).map(([key, label]) => <div key={key}>
          <Label htmlFor={`${id}-${key}`} className="text-[10px]">{label} (px)</Label>
          <Input id={`${id}-${key}`} type="number" min="0" value={value[key] ?? ''} onChange={e => set(key, e.target.value)} placeholder="0" className="h-7 text-xs" />
        </div>)}
      </div>}
    </div>}
    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onChange({})}>রিসেট</Button>
  </div>;
}

export default function CustomSectionElementsEditor({ section, onUpdate }: { section: CustomSection; onUpdate: (updates: Partial<CustomSection>) => void }) {
  const buttons = resolveCustomButtons(section);
  const updateButton = (id: string, updates: Partial<CustomSectionButton>) => onUpdate({ buttons: buttons.map(b => b.id === id ? { ...b, ...updates } : b) });
  const keys: CustomElementKey[] = ['heading', 'content', 'description', 'image', 'video'];
  if (['faq', 'feature-icons', 'testimonial', 'comparison', 'bullet-points', 'pricing', 'image-text'].includes(section.type)) keys.push('item', 'itemHeading', 'itemText', 'icon');
  if (section.type === 'pricing') keys.push('price');
  if (section.type === 'countdown-timer') keys.push('timer', 'timerLabel');
  return <div className="space-y-3 border-t pt-3">
    <Label className="text-xs font-semibold">উপাদানের আলাদা ডিজাইন</Label>
    {keys.map(key => <details key={key} className="border rounded-md p-2">
      <summary className="cursor-pointer text-xs font-medium">{customElementLabels[key]}</summary>
      <div className="mt-2"><AppearanceFields id={`${section.id}-element-${key}`} value={section.elementStyles?.[key] || {}} media={key === 'image' || key === 'video'} onChange={style => onUpdate({ elementStyles: { ...section.elementStyles, [key]: style } })} /></div>
    </details>)}
    <div className="flex items-center justify-between"><Label className="text-xs font-semibold">বাটনসমূহ ({buttons.length})</Label>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdate({ buttons: [...buttons, { id: `btn-${crypto.randomUUID()}`, action: 'order', text: 'অর্ডার করুন' }] })}><Plus className="w-3 h-3 mr-1" />বাটন যোগ করুন</Button>
    </div>
    {buttons.map((button, index) => <div key={button.id} className="border rounded-md p-2 space-y-2">
      <div className="flex items-center justify-between"><Label className="text-xs">বাটন {index + 1}</Label><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`বাটন ${index + 1} মুছুন`} onClick={() => onUpdate({ buttons: buttons.filter(b => b.id !== button.id) })}><Trash2 className="w-3 h-3" /></Button></div>
      <Label htmlFor={`${section.id}-${button.id}-text`} className="text-[10px]">বাটনের লেখা</Label><Input id={`${section.id}-${button.id}-text`} value={button.text} onChange={e => updateButton(button.id, { text: e.target.value })} className="h-7 text-xs" />
      <Select value={button.action} onValueChange={v => updateButton(button.id, { action: v as CustomSectionButton['action'] })}><SelectTrigger aria-label={`বাটন ${index + 1} এর কাজ`} className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="order">অর্ডার করুন</SelectItem><SelectItem value="call">কল করুন</SelectItem><SelectItem value="whatsapp">হোয়াটসঅ্যাপ করুন</SelectItem><SelectItem value="link">লিংক খুলুন</SelectItem></SelectContent></Select>
      {button.action !== 'order' && <><Label htmlFor={`${section.id}-${button.id}-target`} className="text-[10px]">{button.action === 'whatsapp' ? 'হোয়াটসঅ্যাপ নম্বর' : button.action === 'call' ? 'ফোন নম্বর' : 'লিংক'}</Label><Input id={`${section.id}-${button.id}-target`} value={button.target || ''} onChange={e => updateButton(button.id, { target: e.target.value })} placeholder={button.action === 'whatsapp' || button.action === 'call' ? '+880...' : 'https://...'} className="h-7 text-xs" /></>}
      <AppearanceFields id={`${section.id}-${button.id}`} value={button.styles || {}} button onChange={styles => updateButton(button.id, { styles })} />
    </div>)}
  </div>;
}