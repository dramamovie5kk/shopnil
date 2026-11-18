import { describe, expect, it } from 'vitest';
import { checkoutExtraOrderData, isCheckoutExtraFieldEnabled } from '@/lib/checkoutExtraFields';
describe('checkout extra fields', () => {
  it.each(['thana', 'district', 'additionalInfo'] as const)('%s independently switches on/off', key => {
    expect(isCheckoutExtraFieldEnabled(undefined, key)).toBe(true);
    expect(isCheckoutExtraFieldEnabled({ [`show_${key}`]: '0' }, key)).toBe(false);
    expect(isCheckoutExtraFieldEnabled({ [`show_${key}`]: '1' }, key)).toBe(true);
  });
  const values = { thana: 'সাভার', district: 'ঢাকা', additionalInfo: 'বিকেলে পৌঁছাবেন' };
  it('saves thana and district with the delivery address', () => {
    expect(checkoutExtraOrderData({}, values, 'বাড়ি ১২').address).toBe('বাড়ি ১২, থানা: সাভার, জেলা: ঢাকা');
  });
  it('saves custom information with its configured label', () => {
    expect(checkoutExtraOrderData({ text_additionalInfoLabel: 'ডেলিভারি নির্দেশনা' }, values, 'বাড়ি ১২').note).toBe('ডেলিভারি নির্দেশনা: বিকেলে পৌঁছাবেন');
  });
  it('omits hidden field values from orders', () => {
    expect(checkoutExtraOrderData({ show_thana: '0', show_district: '0', show_additionalInfo: '0' }, values, 'বাড়ি ১২')).toEqual({ address: 'বাড়ি ১২', note: '' });
  });
  it('keeps empty optional fields out of saved data', () => {
    expect(checkoutExtraOrderData({}, { thana: '', district: ' ', additionalInfo: '' }, 'বাড়ি ১২')).toEqual({ address: 'বাড়ি ১২', note: '' });
  });
});