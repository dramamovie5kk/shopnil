import { describe, expect, it } from 'vitest';
import { getOfferCountdown, getOfferTimerStyle, getOfferTimerUnitLabels, getTemplate02Hero02TimerDeadline } from '@/lib/offerCountdown';

describe('Template 02 hero 02 countdown', () => {
  const settings = { design: 't2-02', t2h2_timer_end: '2026-10-27T12:00:00Z' };
  it('uses the explicitly saved deadline for hero 02', () => {
    expect(getTemplate02Hero02TimerDeadline(settings)).toBe('2026-10-27T12:00:00Z');
  });
  it('hides when switched off or when another design is selected', () => {
    expect(getTemplate02Hero02TimerDeadline({ ...settings, t2h2_timer_enabled: '0' })).toBeNull();
    expect(getTemplate02Hero02TimerDeadline({ ...settings, design: 't2-01' })).toBeNull();
  });
  it('never creates a deadline when missing or invalid', () => {
    expect(getTemplate02Hero02TimerDeadline({ design: 't2-02' })).toBeNull();
    expect(getTemplate02Hero02TimerDeadline({ ...settings, t2h2_timer_end: 'invalid' })).toBeNull();
  });
  it('reaches zero without restarting when the saved deadline has passed', () => {
    expect(getOfferCountdown(getTemplate02Hero02TimerDeadline(settings), Date.parse('2026-10-27T12:00:01Z'))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
  });
});

describe('getOfferCountdown', () => {
  it('returns null without a deadline and counts down with one', () => {
    expect(getOfferCountdown('', 1000)).toBeNull();
    expect(getOfferCountdown(undefined, 1000)).toBeNull();
    const now = Date.parse('2026-10-12T18:00:00Z');
    const r = getOfferCountdown('2026-10-12T18:01:10Z', now);
    expect(r).toMatchObject({ days: 0, hours: 0, minutes: 1, seconds: 10, expired: false });
  });
});

describe('getOfferTimerStyle', () => {
  it('maps valid hex colors to timer CSS variables', () => {
    const style = getOfferTimerStyle({ timerBg: '#7c3aed', timerNumber: '#ffffff' }) as Record<string, string>;
    expect(style['--offer-timer-bg']).toBe('#7c3aed');
    expect(style['--offer-timer-number']).toBe('#ffffff');
    expect(Object.keys(style)).toHaveLength(2);
  });
  it('ignores invalid or missing colors and empty settings', () => {
    expect(getOfferTimerStyle({ timerBg: 'red', timerNumber: '#fff' })).toEqual({});
    expect(getOfferTimerStyle()).toEqual({});
  });
});

describe('getOfferTimerUnitLabels', () => {
  it('prefers text_timer_* then countdown_label_* then Bengali defaults', () => {
    expect(getOfferTimerUnitLabels({ text_timer_days: 'দিন বাকি' })).toMatchObject({ days: 'দিন বাকি', hours: 'ঘণ্টা', minutes: 'মিনিট', seconds: 'সেকেন্ড' });
    expect(getOfferTimerUnitLabels(undefined, { countdown_label_hours: 'ঘণ্টা বাকি' })).toMatchObject({ days: 'দিন', hours: 'ঘণ্টা বাকি' });
    expect(getOfferTimerUnitLabels()).toMatchObject({ days: 'দিন', hours: 'ঘণ্টা', minutes: 'মিনিট', seconds: 'সেকেন্ড' });
  });
});
