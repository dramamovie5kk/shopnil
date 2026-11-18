import type { CSSProperties } from 'react';
import type { SalesPage } from '@/types/salesPage';
export const extraSectionDesigns = [
  { id: '01', label: 'চেকলিস্ট' }, { id: '02', label: 'আইকন কার্ড' },
  { id: '03', label: 'ধাপে ধাপে' }, { id: '04', label: 'এডিটোরিয়াল' },
  { id: '05', label: 'অ্যাকর্ডিয়ন' }, { id: '06', label: 'হাইলাইট তালিকা' },
] as const;
export type ExtraSectionNumber = 1 | 2 | 3;
export type ExtraSettings = Record<string, string>;
export const extraComponents = [
  ['heading', 'হেডিং'], ['subtitle', 'বর্ণনা'], ['badge', 'ব্যাজ'],
  ['item', 'পয়েন্টের বক্স'], ['icon', 'পয়েন্টের আইকন'], ['text', 'পয়েন্টের লেখা'],
  ['description', 'পয়েন্টের বর্ণনা'], ['button', 'অর্ডার বোতাম'],
] as const;
export const extraColors = [
  ['background', 'পটভূমি'], ['heading', 'হেডিং'], ['text', 'লেখা'], ['surface', 'পয়েন্টের বক্স'],
  ['border', 'বর্ডার'], ['accent', 'আইকন ও অ্যাকসেন্ট'], ['button', 'বোতাম'], ['buttonText', 'বোতামের লেখা'],
] as const;
export const isExtraDesign = (value?: string) => extraSectionDesigns.some(d => d.id === value);
export function extraSectionData(page: SalesPage, number: ExtraSectionNumber) {
  const prefix = `extra_section_${number}`;
  const fields = page as unknown as Record<string, unknown>;
  const saved = fields[`${prefix}_points`];
  // An explicitly emptied list must not revive legacy deleted points.
  const points = Array.isArray(saved) ? saved.filter((p): p is string => typeof p === 'string') :
    Array.from({ length: 6 }, (_, i) => fields[`${prefix}_point_${i + 1}`]).filter((p): p is string => typeof p === 'string' && !!p.trim());
  return { heading: String(fields[`${prefix}_heading`] ?? ''), points, enabled: fields[`show_${prefix}`] === true,
    settings: page.template_styles?.[`extra${number}`] ?? {} };
}
export function supportsExtraDesigns(templateId: string) { return templateId !== 'template-15-universal'; }
export function extraTheme(settings: ExtraSettings): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key] of extraColors) if (/^#[\da-f]{6}$/i.test(settings[key] ?? '')) style[`--extra-${key}`] = settings[key];
  for (const [key, max] of [['width', 1400], ['padding', 120], ['gap', 80]] as const) {
    const value = settings[key];
    if (value?.trim() && Number.isFinite(Number(value))) style[`--extra-${key}`] = `${Math.max(key === 'width' ? 280 : 0, Math.min(max, Number(value)))}px`;
  }
  return style as CSSProperties;
}
export function extraComponentStyle(settings: ExtraSettings, component: string, base?: string): CSSProperties {
  const get = (key: string) => settings[`${component}_${key}`] ?? (base ? settings[`${base}_${key}`] : undefined);
  const color = (key: string) => /^#[\da-f]{6}$/i.test(get(key) ?? '') ? get(key) : undefined;
  const px = (key: string, max: number) => { const v = get(key); return v?.trim() && Number.isFinite(Number(v)) ? `${Math.max(0, Math.min(max, Number(v)))}px` : undefined; };
  const align = get('alignment');
  return { color: color('color'), backgroundColor: color('background'), borderColor: color('border'),
    borderWidth: px('borderWidth', 12), borderStyle: get('borderWidth') ? 'solid' : undefined,
    borderRadius: px('radius', 80), fontSize: px('fontSize', 64), padding: px('padding', 80),
    textAlign: align === 'left' || align === 'center' || align === 'right' ? align : undefined,
    display: get('enabled') === '0' ? 'none' : undefined };
}
