import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Universal15CustomSection } from '@/components/salespage/templates/Template15Universal';
import type { CustomSection } from '@/components/admin/CustomSectionEditor';

vi.mock('@/components/salespage/CheckoutSection', () => ({ default: () => null }));
vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

const types: CustomSection['type'][] = ['text', 'image-text', 'bullet-points', 'image-grid', 'banner', 'gallery', 'slider', 'image', 'video', 'faq', 'divider', 'testimonial', 'pricing', 'countdown-timer', 'feature-icons', 'cta-banner', 'comparison', 'button'];

describe('optional custom section content', () => {
  it.each(types)('%s accepts heading, body, description, foreground image and video together', (type) => {
    const section: CustomSection = {
      id: 'custom-test', type, title: 'স্বাধীন হেডিং', content: 'স্বাধীন লেখা', description: 'স্বাধীন বর্ণনা',
      images: ['/placeholder.svg'], videoUrl: 'https://www.youtube.com/watch?v=SLuBNVqG1ZQ',
      points: [], faqItems: [], testimonials: [], featureItems: [], comparisonItems: [], countdownEndDate: '',
      pricingData: { originalPrice: '', offerPrice: '', badgeText: '', unit: '৳', features: [] },
      styles: { backgroundColor: '', textColor: '', headingColor: '', headingFontSize: '22', headingAlignment: 'center', headingBold: true, contentFontSize: '15', contentAlignment: 'left', padding: '24', borderRadius: '8', borderColor: '', borderWidth: '0', shadow: 'none', imageBorderRadius: '8', ctaBgColor: '', ctaTextColor: '', ctaBorderRadius: '8', showCta: false, ctaText: '', imagePosition: 'top', sectionWidth: '100', marginX: '0', backgroundOpacity: '100', backgroundImage: '', ctaLink: '' },
    };
    const { container } = render(<Universal15CustomSection section={section} s={{}} onOrderClick={() => {}} />);
    expect(container.textContent).toContain('স্বাধীন হেডিং');
    expect(container.textContent).toContain('স্বাধীন লেখা');
    expect(container.textContent).toContain('স্বাধীন বর্ণনা');
    expect(container.querySelectorAll('img[src="/placeholder.svg"]')).toHaveLength(1);
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    const heading = container.querySelector('h2');
    const video = container.querySelector('iframe');
    expect(heading && video && Boolean(heading.compareDocumentPosition(video) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    cleanup();
  });
});