import { salesPlainText } from '@/lib/salesRichText';

export const checkoutExtraFields = [
  { key: 'thana', label: 'থানা', placeholder: 'আপনার থানা' },
  { key: 'district', label: 'জেলা', placeholder: 'আপনার জেলা' },
  { key: 'additionalInfo', label: 'অতিরিক্ত কোনো তথ্য', placeholder: 'অতিরিক্ত কোনো তথ্য থাকলে লিখুন' },
] as const;
export type CheckoutExtraFieldKey = typeof checkoutExtraFields[number]['key'];
type Settings = Record<string, string> | undefined;
type Values = Record<CheckoutExtraFieldKey, string>;
export const isCheckoutExtraFieldEnabled = (settings: Settings, key: CheckoutExtraFieldKey) => settings?.[`show_${key}`] !== '0';
export const enabledCheckoutExtraValues = (settings: Settings, values: Values): Values => ({
  thana: isCheckoutExtraFieldEnabled(settings, 'thana') ? values.thana.trim() : '',
  district: isCheckoutExtraFieldEnabled(settings, 'district') ? values.district.trim() : '',
  additionalInfo: isCheckoutExtraFieldEnabled(settings, 'additionalInfo') ? values.additionalInfo.trim() : '',
});
export const checkoutExtraOrderData = (settings: Settings, values: Values, address: string) => {
  const enabled = enabledCheckoutExtraValues(settings, values);
  const label = salesPlainText(settings?.text_additionalInfoLabel?.trim() || 'অতিরিক্ত কোনো তথ্য');
  return {
    address: [address.trim(), enabled.thana && `থানা: ${enabled.thana}`, enabled.district && `জেলা: ${enabled.district}`].filter(Boolean).join(', '),
    note: enabled.additionalInfo ? `${label}: ${enabled.additionalInfo}` : '',
  };
};