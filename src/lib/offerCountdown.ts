import type { CSSProperties } from 'react';
import { offerTimerColorFields } from '@/lib/heroDesigns';
import type { SalesPage } from '@/types/salesPage';

export function getOfferCountdown(endDate: string | null | undefined, now = Date.now()) {
  const end = endDate ? Date.parse(endDate) : NaN;
  if (!Number.isFinite(end)) return null;
  const total = Math.max(0, Math.floor((end - now) / 1000));
  return { days: Math.floor(total / 86400), hours: Math.floor(total % 86400 / 3600), minutes: Math.floor(total % 3600 / 60), seconds: total % 60, expired: end <= now };
}

const hexRe = /^#[0-9a-fA-F]{6}$/;

/** Template 02 hero 02 never invents or reuses another hero's deadline. */
export function getTemplate02Hero02TimerDeadline(settings?: Record<string, string>): string | null {
  if (settings?.design !== 't2-02' || settings.t2h2_timer_enabled === '0') return null;
  const deadline = settings.t2h2_timer_end;
  return deadline && Number.isFinite(Date.parse(deadline)) ? deadline : null;
}

/** Hero-design-04 timer colors: only valid hex values become CSS-variable overrides. */
export function getOfferTimerStyle(settings?: Record<string, string>): CSSProperties {
  if (!settings) return {};
  return Object.fromEntries(offerTimerColorFields.flatMap(field => hexRe.test(settings[field.key] || '') ? [[field.cssVar, settings[field.key]]] : [])) as CSSProperties;
}

/** Timer unit labels prefer hero-settings text_timer_*, then legacy countdown_label_* fields. */
export function getOfferTimerUnitLabels(settings?: Record<string, string>, page?: Partial<Pick<SalesPage, 'countdown_label_days' | 'countdown_label_hours' | 'countdown_label_minutes' | 'countdown_label_seconds'>>) {
  return {
    days: settings?.text_timer_days || page?.countdown_label_days || 'দিন',
    hours: settings?.text_timer_hours || page?.countdown_label_hours || 'ঘণ্টা',
    minutes: settings?.text_timer_minutes || page?.countdown_label_minutes || 'মিনিট',
    seconds: settings?.text_timer_seconds || page?.countdown_label_seconds || 'সেকেন্ড',
  };
}
