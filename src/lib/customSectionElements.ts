import type { CSSProperties } from 'react';

export interface CustomElementStyle {
  enabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  fontSize?: string;
  padding?: string;
  alignment?: 'left' | 'center' | 'right';
  desktopWidth?: string;
  desktopPaddingLeft?: string;
  desktopPaddingRight?: string;
}

export const customElementLabels = {
  heading: 'হেডিং', content: 'কন্টেন্ট', description: 'বর্ণনা',
  image: 'ইমেজ', video: 'ভিডিও', item: 'আইটেমের বক্স',
  itemHeading: 'আইটেমের শিরোনাম', itemText: 'আইটেমের লেখা',
  icon: 'আইকন / ব্যাজ', price: 'দাম', timer: 'টাইমারের সংখ্যা', timerLabel: 'টাইমারের লেবেল',
} as const;
export type CustomElementKey = keyof typeof customElementLabels;
export type CustomElementStyles = Partial<Record<CustomElementKey, CustomElementStyle>>;
export interface CustomSectionButton {
  id: string;
  action: 'order' | 'call' | 'link' | 'whatsapp';
  text: string;
  target?: string;
  styles?: CustomElementStyle;
}

export function customElementStyle(style?: CustomElementStyle): CSSProperties {
  if (!style) return {};
  const px = (value?: string) => value?.trim() !== '' && value !== undefined && Number.isFinite(Number(value)) ? `${Math.max(0, Number(value))}px` : undefined;
  return {
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
    borderColor: style.borderColor || undefined,
    borderWidth: px(style.borderWidth),
    borderStyle: style.borderWidth ? 'solid' : undefined,
    borderRadius: px(style.borderRadius), fontSize: px(style.fontSize),
    padding: px(style.padding), textAlign: style.alignment,
    display: style.enabled === false ? 'none' : undefined,
  };
}

export function customButtonTarget(button: CustomSectionButton): string | undefined {
  if (button.action === 'order') return undefined;
  const target = button.target?.trim() || '';
  if (button.action === 'whatsapp') {
    const number = target.replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]+$/.test(number)) return undefined;
    let digits = number.replace(/^\+/, '').replace(/^00/, '');
    if (/^01[3-9][0-9]{8}$/.test(digits)) digits = `88${digits}`;
    return /^[1-9][0-9]{6,14}$/.test(digits) ? `https://wa.me/${digits}` : undefined;
  }
  if (button.action === 'call') {
    const number = target.replace(/^tel:/i, '').replace(/[\s()-]/g, '');
    return /^\+?[0-9]{3,20}$/.test(number) ? `tel:${number}` : undefined;
  }
  return /^(https?:\/\/|mailto:|tel:|\/[^/]|#[\w-])/i.test(target) ? target : undefined;
}

export function resolveCustomButtons(section: {
  buttons?: CustomSectionButton[];
  styles: { showCta: boolean; ctaText: string; ctaLink: string; ctaBgColor: string; ctaTextColor: string; ctaBorderRadius: string };
}): CustomSectionButton[] {
  if (section.buttons !== undefined) return section.buttons;
  const cs = section.styles;
  return cs.showCta ? [{ id: 'legacy-cta', action: cs.ctaLink?.trim() ? 'link' : 'order',
    target: cs.ctaLink, text: cs.ctaText || 'এখনই অর্ডার করুন',
    styles: { backgroundColor: cs.ctaBgColor, textColor: cs.ctaTextColor, borderRadius: cs.ctaBorderRadius || '50' },
  }] : [];
}
/** Keep desktop geometry independent of mobile and preserve blank fallbacks. */
export function customDesktopLayoutStyle(style?: CustomElementStyle): CSSProperties {
  const number = (value?: string) => value !== undefined && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : undefined;
  const width = number(style?.desktopWidth);
  const left = number(style?.desktopPaddingLeft);
  const right = number(style?.desktopPaddingRight);
  return {
    '--custom-desktop-width': width === undefined ? undefined : `${Math.min(100, Math.max(1, width))}%`,
    '--custom-desktop-max-width': width === undefined ? undefined : 'none',
    '--custom-desktop-padding-left': left === undefined ? undefined : `${Math.max(0, left)}px`,
    '--custom-desktop-padding-right': right === undefined ? undefined : `${Math.max(0, right)}px`,
  } as CSSProperties;
}
