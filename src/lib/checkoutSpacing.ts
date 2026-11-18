import type { CSSProperties } from 'react';

/** Checkout width/margin overrides live under template_styles.checkout (width %, side margins px). */
export function hasCheckoutSpacing(settings?: Record<string, string>): boolean {
  return ['width', 'marginLeft', 'marginRight'].some(key => settings?.[key] !== undefined && settings[key] !== '');
}

export function checkoutSpacingStyle(settings?: Record<string, string>): CSSProperties {
  if (!hasCheckoutSpacing(settings)) return {};
  const style: CSSProperties = {};
  const width = Number(settings?.width);
  if (settings?.width !== undefined && settings.width !== '' && Number.isFinite(width) && width > 0) {
    style.width = `${Math.max(5, Math.min(100, width))}%`;
    style.maxWidth = 'none';
  }
  (['marginLeft', 'marginRight'] as const).forEach(key => {
    const value = Number(settings?.[key]);
    if (settings?.[key] !== undefined && settings[key] !== '' && Number.isFinite(value) && value > 0) {
      style[key] = `${Math.min(400, value)}px`;
    }
  });
  return style;
}
