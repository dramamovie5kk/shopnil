import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Universal15CustomSection } from '@/components/salespage/templates/Template15Universal';
import type { CustomSection } from '@/components/admin/CustomSectionEditor';

vi.mock('@/components/salespage/CheckoutSection', () => ({ default: () => null }));
afterEach(cleanup);

describe('code-only HTML sections', () => {
  it('ignores saved non-code content and actions rather than injecting them into authored HTML', () => {
    const section = {
      id: 'cs-html', type: 'html', content: '<main>Authored document</main>',
      title: 'Legacy title', description: 'Legacy description', images: [],
      videoUrl: 'https://www.youtube.com/watch?v=SLuBNVqG1ZQ',
      buttons: [{ id: 'legacy-button', text: 'Legacy action', action: 'order' }],
      styles: { padding: '24', backgroundColor: '#065f46', showCta: true, ctaText: 'Legacy CTA' },
    } as CustomSection;
    const order = vi.fn();
    const result = render(<Universal15CustomSection section={section} s={{}} onOrderClick={order} />);
    expect(result.getByText('Authored document')).toBeTruthy();
    for (const text of ['Legacy title', 'Legacy description', 'Legacy action', 'Legacy CTA']) {
      expect(result.queryByText(text)).toBeNull();
    }
    expect(order).not.toHaveBeenCalled();
  });
});