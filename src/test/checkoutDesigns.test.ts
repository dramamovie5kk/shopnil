import { describe, expect, it } from 'vitest';
import { checkoutDesigns, getCheckoutDesign, getCheckoutColorVariables, getCheckoutText } from '@/lib/checkoutDesigns';

describe('checkout design availability', () => {
  it('offers exactly ten distinct persisted design IDs', () => {
    expect(checkoutDesigns.map(design => design.id)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);
  });
  it.each(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'])('resolves saved design %s without falling back', id => {
    expect(getCheckoutDesign(id)).toBe(id);
  });
  it('keeps the original design for missing or invalid IDs', () => {
    expect(getCheckoutDesign(undefined)).toBe('01');
    expect(getCheckoutDesign('11')).toBe('01');
  });
  it('preserves independent saved copy and colors for new designs', () => {
    const settings = { design: '10', text_title: 'আমার অর্ডার', headingBg: '#125634' };
    expect(getCheckoutText(settings, 'title', 'অর্ডার করুন')).toBe('আমার অর্ডার');
    expect(getCheckoutColorVariables(settings)).toEqual({ '--checkout-headingBg': '#125634' });
  });
});