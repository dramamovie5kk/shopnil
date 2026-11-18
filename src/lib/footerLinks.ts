export interface FooterLink { id: string; label: string; url: string }

export const defaultQuickLinks: FooterLink[] = [
  { id: '1', label: 'Home', url: '/' },
  { id: '2', label: 'All Products', url: '/products' },
  { id: '3', label: 'About Us', url: '/about' },
  { id: '4', label: 'Contact', url: '/contact' },
];
export const defaultCustomerServiceLinks: FooterLink[] = [
  { id: '1', label: 'Delivery Rules', url: '/delivery-rules' },
  { id: '2', label: 'Return Policy', url: '/return-policy' },
  { id: '3', label: 'Refund Policy', url: '/refund-policy' },
  { id: '4', label: 'Terms & Conditions', url: '/terms' },
];
export function parseFooterLinks(value: string, fallback: FooterLink[]): FooterLink[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is FooterLink =>
      !!item && typeof item.id === 'string' && typeof item.label === 'string' && typeof item.url === 'string');
  } catch { /* Preserve legacy defaults. */ }
  return fallback;
}
export function footerHref(url: string): string {
  const trimmed = url.trim();
  return /^(\/(?!\/)|https:\/\/|mailto:|tel:|#)/i.test(trimmed) ? trimmed : '#';
}
export function footerPageSlug(url: string): string | null {
  const path = url.trim().replace(/^\/page\//, '/');
  if (!/^\/[\p{L}\p{N}_-]+$/u.test(path)) return null;
  const slug = path.slice(1);
  const reserved = ['products', 'login', 'admin', 'forgot-password', 'reset-password', 'lp-order-success', 'cart', 'checkout', 'dashboard', 'orders', 'wishlist', 'lp'];
  return reserved.includes(slug) ? null : slug;
}