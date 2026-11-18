import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SalesPageContent } from '@/pages/SalesPage';
import { salesCustomSections, withCustomSectionOrder } from '@/lib/salesCustomSections';
import type { SalesPage } from '@/types/salesPage';

vi.mock('@/components/salespage/CheckoutSection', () => ({ default: () => <div id="checkout">Checkout</div> }));
vi.mock('@/components/salespage/SalesPageEngagementTracker', () => ({ default: () => null }));
vi.mock('@/hooks/usePixelTracking', () => ({ usePixelTracking: () => ({ trackPageView: vi.fn(), trackAddToCart: vi.fn() }) }));
afterEach(cleanup);
beforeAll(() => vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));
afterAll(() => vi.unstubAllGlobals());
const custom = { id: 'cs-offer', type: 'html', content: '<h2>Custom offer</h2>', title: 'Ignored preset', images: [], styles: {} };
const fixture = (template_id: string): SalesPage => ({
  id: 'test', template_id, title: 'Test', hero_headline: 'Built-in heading', hero_images: [], gallery_images: [], review_images: [], feature_points: [],
  show_hero_section: false, show_features_section: false, show_gallery_section: false, show_contact_section: false, show_reviews_section: false,
  show_checkout_section: true, section_order: ['cs-offer', 'checkout'], template_styles: { customSections: [custom] },
} as unknown as SalesPage);

describe('custom sections on every sales template', () => {
  for (const template of ['template-01-organic', 'template-02-clothing', 'template-03-fashion', 'template-04-gadget', 'template-05-countdown', 'template-06-panjabi', 'template-07-gadget', 'template-08-minimal', 'template-09-superfood', 'template-10-superfood2', 'template-11-superfood3', 'template-12-gadget3', 'template-13-natural-card', 'template-14-video-organic', 'template-15-universal', 'legacy']) {
    it(`renders saved custom HTML before checkout in ${template}`, async () => {
      const result = render(<SalesPageContent page={fixture(template)} />);
      // The first lazy template import needs extra time on a cold cloud runner.
      const offer = await screen.findByText('Custom offer', {}, { timeout: 4000 });
      const checkout = screen.getByText('Checkout');
      expect(offer.compareDocumentPosition(checkout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(result.queryByText('Ignored preset')).toBeNull();
      expect(screen.getAllByText('Custom offer')).toHaveLength(1);
    });
  }
  it('retains built-in order and custom data without mutating the saved page', () => {
    const page = { ...fixture('template-01-organic'), section_order: ['hero', 'cs-offer', 'checkout', 'cs-removed', 'cs-offer'] };
    const next = withCustomSectionOrder(page);
    expect(next.section_order).toEqual(['hero', 'cs-offer', 'checkout']);
    expect(next.template_styles).toBe(page.template_styles);
    expect(page.section_order).toEqual(['hero', 'cs-offer', 'checkout', 'cs-removed', 'cs-offer']);
    expect(salesCustomSections(next)[0].content).toBe('<h2>Custom offer</h2>');
  });
  it('leaves pages without custom sections unchanged', () => {
    const page = { ...fixture('template-02-clothing'), template_styles: {} };
    expect(withCustomSectionOrder(page)).toBe(page);
  });
  it('appends saved customs missing from the order', () => {
    expect(withCustomSectionOrder({ ...fixture('template-02-clothing'), section_order: ['hero', 'checkout'] }).section_order).toEqual(['hero', 'checkout', 'cs-offer']);
  });
});