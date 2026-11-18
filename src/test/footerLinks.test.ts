import { describe, expect, it } from 'vitest';
import { footerHref, footerPageSlug, parseFooterLinks, defaultQuickLinks } from '@/lib/footerLinks';

describe('footer menu destinations', () => {
  it('uses the same content page for legacy and current links', () => {
    expect(footerPageSlug('/page/return-policy')).toBe('return-policy');
    expect(footerPageSlug('/return-policy')).toBe('return-policy');
  });
  it('does not turn app destinations or external links into content pages', () => {
    expect(footerPageSlug('/')).toBeNull();
    expect(footerPageSlug('/products')).toBeNull();
    expect(footerPageSlug('https://example.com')).toBeNull();
  });
  it('preserves deliberately empty menu lists', () => {
    expect(parseFooterLinks('[]', defaultQuickLinks)).toEqual([]);
    expect(parseFooterLinks('invalid', defaultQuickLinks)).toEqual(defaultQuickLinks);
  });
  it('rejects unsafe links while preserving internal and HTTPS links', () => {
    expect(footerHref('javascript:alert(1)')).toBe('#');
    expect(footerHref('//example.com')).toBe('#');
    expect(footerHref('/contact')).toBe('/contact');
    expect(footerHref('https://example.com')).toBe('https://example.com');
  });
});