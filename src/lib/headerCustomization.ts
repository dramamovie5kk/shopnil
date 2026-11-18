export const headerParts = [
  ['header', 'মূল হেডার'], ['topbar', 'টপবার'], ['assurance', 'মানের বার্তা'], ['delivery', 'ডেলিভারি বার্তা'], ['offer', 'অফার ব্যাজ'], ['message', 'টপবারের মেসেজ'],
  ['menu', 'মেনু বাটন'], ['logo', 'লোগো'], ['brand', 'সাইটের নাম'], ['tagline', 'ট্যাগলাইন'], ['search', 'সার্চ বক্স'], ['searchInput', 'সার্চের ইনপুট'], ['searchButton', 'সার্চ বাটন'],
  ['wishlist', 'উইশলিস্ট'], ['account', 'অ্যাকাউন্ট'], ['cart', 'কার্ট'], ['badge', 'সংখ্যার ব্যাজ'], ['dropdown', 'মেনু / অ্যাকাউন্ট প্যানেল'],
] as const;
export type HeaderPart = typeof headerParts[number][0];
export type HeaderDevice = 'desktop' | 'mobile';
export type HeaderPartSettings = { visible?: boolean; imageUrl?: string; background?: string; color?: string; borderColor?: string; iconColor?: string; hoverBackground?: string; fontSize?: string; iconSize?: string; radius?: string; height?: string; text?: string };
export type HeaderCustomization = Record<HeaderDevice, Partial<Record<HeaderPart, HeaderPartSettings>>>;
export const headerTextParts = new Set<HeaderPart>(['assurance','delivery','offer','message','brand','tagline','searchInput','searchButton','cart']);
const colors = ['background','color','borderColor','iconColor','hoverBackground'] as const;
const numbers = { fontSize: [10,32], iconSize: [12,40], radius: [0,48], height: [24,144] } as const;
export function parseHeaderCustomization(raw: string | undefined): HeaderCustomization {
  const out: HeaderCustomization = { desktop: {}, mobile: {} };
  let data: any; try { data = JSON.parse(raw || '{}'); } catch { return out; }
  if (!data || typeof data !== 'object') return out;
  for (const device of ['desktop','mobile'] as const) for (const [part] of headerParts) {
    const saved = data[device]?.[part]; if (!saved || typeof saved !== 'object') continue;
    const next: HeaderPartSettings = {};
    if (typeof saved.visible === 'boolean') next.visible = saved.visible;
    for (const key of colors) if (typeof saved[key] === 'string' && /^(#[\da-f]{6}|transparent)$/i.test(saved[key])) next[key] = saved[key];
    for (const key of Object.keys(numbers) as (keyof typeof numbers)[]) {
      const value = saved[key]; const [min,max] = numbers[key];
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) next[key] = String(Math.max(min,Math.min(max,Number(value))));
    }
    if (part === 'logo' && typeof saved.imageUrl === 'string' && /^(https:\/\/|\/api\/media\/)/.test(saved.imageUrl)) next.imageUrl = saved.imageUrl.slice(0,2000);
    if (headerTextParts.has(part) && typeof saved.text === 'string') next.text = saved.text.slice(0,300);
    out[device][part] = next;
  }
  return out;
}
export function headerCustomizationCss(config: HeaderCustomization): string {
  config = parseHeaderCustomization(JSON.stringify(config));
  return (['desktop','mobile'] as const).map(device => {
    const css = headerParts.map(([part]) => {
      const s = config[device][part]; if (!s) return '';
      const selector = `[data-header-device="${device}"][data-header-part="${part}"]`;
      const rules = [s.visible === false ? 'display:none!important' : '', s.background ? `background:${s.background}!important` : '', s.color ? `color:${s.color}!important` : '', s.borderColor ? `border:1px solid ${s.borderColor}!important` : '', s.fontSize ? `font-size:${s.fontSize}px!important` : '', s.radius ? `border-radius:${s.radius}px!important` : '', s.height ? `height:${s.height}px!important;min-height:${s.height}px!important` : ''].filter(Boolean).join(';');
      return `${selector}{${rules}}` + (part === 'searchInput' && s.color ? `${selector}::placeholder{color:${s.color}!important;opacity:.65}` : '') + (s.height && part === 'header' ? `${selector} [data-header-row]{height:${s.height}px!important;min-height:${s.height}px!important}` : '') + (s.height && part === 'topbar' ? `${selector}>div{height:${s.height}px!important;min-height:${s.height}px!important}` : '') + (s.height && part === 'logo' ? `${selector}>img{height:${s.height}px!important}${selector}>div,${selector}>span:first-child{height:${s.height}px!important;width:${s.height}px!important}` : '') + (s.background && part === 'dropdown' ? `${selector}>div{background:${s.background}!important}` : '') + (s.color ? `${selector}>span,${selector}>div,${selector} strong,${selector} p{color:${s.color}!important}` : '') + (s.fontSize ? `${selector}>span,${selector} strong,${selector} p{font-size:${s.fontSize}px!important}` : '') + (s.iconColor || s.iconSize ? `${selector} svg{${s.iconColor ? `color:${s.iconColor}!important;` : ''}${s.iconSize ? `width:${s.iconSize}px!important;height:${s.iconSize}px!important;` : ''}}` : '') + (s.hoverBackground ? `${selector}:hover{background:${s.hoverBackground}!important}` : '');
    }).join('');
    return `@media ${device === 'desktop' ? '(min-width:1024px)' : '(max-width:1023px)'}{${css}}`;
  }).join('');
}
