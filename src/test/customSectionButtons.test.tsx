import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { customButtonTarget, resolveCustomButtons } from '@/lib/customSectionElements';
import { Universal15CustomSection } from '@/components/salespage/templates/Template15Universal';
import type { CustomSection } from '@/components/admin/CustomSectionEditor';
vi.mock('@/components/salespage/CheckoutSection', () => ({ default: () => null }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
afterEach(cleanup);
const section: CustomSection = {
  id: 'cs-test', type: 'text', title: '', content: '', images: [], videoUrl: '', points: [], faqItems: [], testimonials: [], featureItems: [], comparisonItems: [], countdownEndDate: '',
  pricingData: { originalPrice: '', offerPrice: '', badgeText: '', unit: '', features: [] },
  styles: { backgroundColor: '', textColor: '', headingColor: '', headingFontSize: '22', headingAlignment: 'center', headingBold: true, contentFontSize: '15', contentAlignment: 'left', padding: '24', borderRadius: '8', borderColor: '', borderWidth: '0', shadow: 'none', imageBorderRadius: '8', ctaBgColor: '', ctaTextColor: '', ctaBorderRadius: '8', showCta: true, ctaText: 'অর্ডার করুন', imagePosition: 'top', sectionWidth: '100', marginX: '0', backgroundOpacity: '100', backgroundImage: '', ctaLink: '' },
};
describe('optional custom section buttons', () => {
  it.each(['+880 1700-000000', '01700000000', '০১৭০০০০০০০০', '008801700000000'])('opens WhatsApp for the entered number %s', target => {
    expect(customButtonTarget({ id: 'wa', action: 'whatsapp', text: '', target })).toBe('https://wa.me/8801700000000');
  });
  it('renders a WhatsApp destination', () => {
    const { getByRole } = render(<Universal15CustomSection section={{ ...section, buttons: [{ id: 'wa', action: 'whatsapp', text: 'হোয়াটসঅ্যাপ করুন', target: '+14155552671' }] }} s={{}} onOrderClick={() => {}} />);
    expect(getByRole('link', { name: 'হোয়াটসঅ্যাপ করুন' }).getAttribute('href')).toBe('https://wa.me/14155552671');
  });
  it('keeps the saved CTA when buttons are absent', () => {
    expect(resolveCustomButtons(section)).toMatchObject([{ action: 'order', text: 'অর্ডার করুন' }]);
  });
  it('allows all buttons to be removed without restoring the legacy CTA', () => {
    expect(resolveCustomButtons({ ...section, buttons: [] })).toEqual([]);
  });
  it('renders order and call together while keeping their actions separate', () => {
    const order = vi.fn();
    const { getByRole } = render(<Universal15CustomSection section={{ ...section, buttons: [
      { id: 'order', action: 'order', text: 'অর্ডার করুন' },
      { id: 'call', action: 'call', text: 'কল করুন', target: '+880 1700-000000' },
    ] }} s={{}} onOrderClick={order} />);
    fireEvent.click(getByRole('button', { name: 'অর্ডার করুন' }));
    expect(order).toHaveBeenCalledTimes(1);
    expect(getByRole('link', { name: 'কল করুন' }).getAttribute('href')).toBe('tel:+8801700000000');
  });
  it('does not render disabled optional buttons', () => {
    const { queryByRole } = render(<Universal15CustomSection section={{ ...section, buttons: [{ id: 'call', action: 'call', text: 'কল করুন', target: '01700000000', styles: { enabled: false } }] }} s={{}} onOrderClick={() => {}} />);
    expect(queryByRole('link')).toBeNull();
  });
  it.each(['javascript:alert(1)', 'data:text/html,test', '//evil.example', '01700;alert(1)'])('rejects unsafe destination %s', target => {
    expect(customButtonTarget({ id: 'link', action: 'link', text: '', target })).toBeUndefined();
    expect(customButtonTarget({ id: 'call', action: 'call', text: '', target })).toBeUndefined();
    expect(customButtonTarget({ id: 'wa', action: 'whatsapp', text: '', target })).toBeUndefined();
  });
});