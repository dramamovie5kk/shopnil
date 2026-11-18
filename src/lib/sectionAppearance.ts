export const appearanceGroups = [
  ['section', 'পুরো সেকশন'], ['heading', 'শিরোনাম'], ['text', 'লেখা'], ['button', 'বোতাম'],
  ['image', 'ছবি'], ['video', 'ভিডিও'], ['icon', 'আইকন'], ['box', 'বক্স'], ['label', 'ফর্মের লেবেল'], ['input', 'ফর্মের ঘর'],
] as const;
export type AppearanceGroup = typeof appearanceGroups[number][0];
export type AppearanceSettings = Record<string, string>;
export const appearanceSteps = ['অংশ', 'রং', 'লেখার সাইজ', 'সাইজ ও ফাঁক', 'বর্ডার'] as const;
export function appearanceNamespace(template: string, design?: string) {
  return `${template}:${design || 'legacy'}`;
}
export function readAppearance(settings: AppearanceSettings, namespace: string): AppearanceSettings {
  try {
    const parsed = JSON.parse(settings.appearance || '{}');
    const value = parsed[namespace];
    return value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')) : {};
  } catch { return {}; }
}
export function writeAppearance(settings: AppearanceSettings, namespace: string, values: AppearanceSettings): AppearanceSettings {
  let saved: Record<string, unknown> = {};
  try { const parsed = JSON.parse(settings.appearance || '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed; } catch { /* Preserve valid settings outside the appearance field. */ }
  return { ...settings, appearance: JSON.stringify({ ...saved, [namespace]: values }) };
}
const numericProperties: Record<string, [string, number, number, string]> = {
  fontSize: ['font-size', 8, 96, 'px'], lineHeight: ['line-height', 1, 3, ''],
  width: ['width', 1, 100, '%'], maxWidth: ['max-width', 100, 1800, 'px'],
  paddingTop: ['padding-top', 0, 160, 'px'], paddingBottom: ['padding-bottom', 0, 160, 'px'],
  paddingLeft: ['padding-left', 0, 160, 'px'], paddingRight: ['padding-right', 0, 160, 'px'],
  marginTop: ['margin-top', 0, 160, 'px'], marginBottom: ['margin-bottom', 0, 160, 'px'],
  radius: ['border-radius', 0, 160, 'px'], borderWidth: ['border-width', 0, 16, 'px'], opacity: ['opacity', 0.1, 1, ''],
};
export function appearanceDeclarations(values: AppearanceSettings, target: string): string {
  const declarations: string[] = [];
  for (const [key, property] of [['color', 'color'], ['background', 'background'], ['borderColor', 'border-color']] as const) {
    const value = values[`${target}.${key}`];
    if (/^#[\da-f]{6}$/i.test(value || '')) declarations.push(`${property}:${value}!important`);
    if (key === 'background' && value === 'transparent') declarations.push('background:transparent!important');
  }
  for (const [key, [property, min, max, unit]] of Object.entries(numericProperties)) {
    const value = values[`${target}.${key}`];
    if (value?.trim() && Number.isFinite(Number(value))) declarations.push(`${property}:${Math.min(max, Math.max(min, Number(value)))}${unit}!important`);
  }
  const align = values[`${target}.alignment`];
  if (['left', 'center', 'right'].includes(align)) declarations.push(`text-align:${align}!important`);
  const weight = values[`${target}.weight`];
  if (['400', '500', '600', '700', '800', '900'].includes(weight)) declarations.push(`font-weight:${weight}!important`);
  const fit = values[`${target}.fit`];
  if (['contain', 'cover'].includes(fit)) declarations.push(`object-fit:${fit}!important`);
  if (values[`${target}.borderWidth`]?.trim()) declarations.push('border-style:solid!important');
  if (values[`${target}.width`]?.trim()) declarations.push('max-width:100%!important');
  return declarations.join(';');
}
export function appearanceCss(scope: string, values: AppearanceSettings): string {
  // Repeated scoped attributes outrank legacy design !important rules without leaking outside this section.
  const scoped = scope.repeat(5);
  const targets = [...new Set(Object.keys(values).map(key => key.split('.')[0]))];
  return targets.filter(target => /^(section|heading|text|button|image|video|icon|box|label|input)(-\d+)?$/.test(target)).map(target => {
    const selector = target === 'section' ? `${scoped}>[data-sales-section-root]` : target.includes('-')
      ? `${scoped} [data-sales-part="${target}"]` : `${scoped} [data-sales-kind="${target}"]`;
    const declarations = appearanceDeclarations(values, target);
    const textOnly = Object.fromEntries(Object.entries(values).filter(([key]) => /\.(color|fontSize|lineHeight|weight)$/.test(key)));
    const nested = ['heading', 'text', 'button', 'label'].includes(target.split('-')[0]) ? appearanceDeclarations(textOnly, target) : '';
    return `${selector}{${declarations}}${nested ? `${selector} :where(span,strong,b,em,i,a){${nested}}` : ''}`;
  }).join('\n');
}