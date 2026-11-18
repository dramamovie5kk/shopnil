import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { hero09ColorFields, hero09TextFields } from '@/lib/hero09Design';

export default function Hero09Editor({ settings, onSetting }: { settings: Record<string, string>; onSetting: (key: string, value: string | undefined) => void }) {
  return <div className="space-y-3 border-t border-border pt-3">
    <Label className="text-sm font-semibold">৯ নম্বর ডিজাইনের লেখা ও বোতাম</Label>
    {hero09TextFields.map(field => <div key={field.key} className="space-y-1"><Label htmlFor={`hero09-${field.key}`} className="text-xs">{field.label}</Label><Input id={`hero09-${field.key}`} value={settings[field.key] ?? field.fallback} onChange={e => onSetting(field.key, e.target.value)} /></div>)}
    <div className="space-y-2 border-t border-border pt-3"><Label className="text-sm font-semibold">৯ নম্বর ডিজাইনের বিশেষ রং</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{hero09ColorFields.map(field => <div key={field.key} className="flex items-center justify-between gap-2 border border-border bg-background p-2"><Label htmlFor={`hero09-color-${field.key}`} className="text-xs">{field.label}</Label><div className="flex items-center gap-1"><Input id={`hero09-color-${field.key}`} type="color" aria-label={`${field.label} রং`} className="h-8 w-9 cursor-pointer p-0.5" value={/^#[0-9a-fA-F]{6}$/.test(settings[field.key] || '') ? settings[field.key] : field.fallback} onChange={e => onSetting(field.key, e.target.value)} /><Input aria-label={`${field.label} হেক্স রং`} className="h-8 w-20 text-xs" maxLength={7} placeholder="#rrggbb" value={settings[field.key] ?? ''} onChange={e => onSetting(field.key, e.target.value)} />{settings[field.key] && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="রং ফিরিয়ে আনুন" aria-label={`${field.label} রং ফিরিয়ে আনুন`} onClick={() => onSetting(field.key, undefined)}><X size={13} /></Button>}</div></div>)}</div>
    </div>
  </div>;
}