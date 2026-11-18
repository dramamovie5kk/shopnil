import { describe, expect, it } from 'vitest';
import { checkoutSpacingStyle, hasCheckoutSpacing } from '@/lib/checkoutSpacing';
describe('sales checkout width and margins', () => {
  it('leaves the default full-width layout untouched when unset', () => {
    expect(hasCheckoutSpacing({})).toBe(false);
    expect(checkoutSpacingStyle({})).toEqual({});
  });
  it('allows explicit zero margins so no gap remains', () => {
    expect(hasCheckoutSpacing({ marginLeft: '0', marginRight: '0' })).toBe(true);
    expect(checkoutSpacingStyle({ marginLeft: '0', marginRight: '0' })).toEqual({});
  });
  it('applies width percent and side margins', () => {
    expect(checkoutSpacingStyle({ width: '80', marginLeft: '12', marginRight: '24' })).toEqual({ width: '80%', maxWidth: 'none', marginLeft: '12px', marginRight: '24px' });
  });
  it('clamps extreme values', () => {
    expect(checkoutSpacingStyle({ width: '250', marginLeft: '900' })).toEqual({ width: '100%', maxWidth: 'none', marginLeft: '400px' });
  });
});
