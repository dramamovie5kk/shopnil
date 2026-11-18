import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Template02Sections from '@/components/salespage/Template02Sections';
import type { SalesPage } from '@/types/salesPage';

const base = { title: 'পণ্য', contact_phone: '01700000000', hero_badge_text: 'পুরনো ব্যাজ' };
const heroPage = (hero: Record<string, string>) => ({ ...base, template_styles: { hero } } as unknown as SalesPage);

describe('template 02 empty field rule', () => {
  it('hides the badge (icon included) when the badge field is cleared', () => {
    const { container } = render(<Template02Sections page={heroPage({ design: 't2-02', text_badge: '' })} section="hero" onOrderClick={() => {}} />);
    expect(container.querySelector('.t2-badge')).toBeNull();
    expect(container.textContent).not.toContain('পুরনো ব্যাজ');
  });
  it('still shows the badge for pages that never saved a badge override', () => {
    const { container } = render(<Template02Sections page={heroPage({ design: 't2-02' })} section="hero" onOrderClick={() => {}} />);
    expect(container.querySelector('.t2-badge')?.textContent).toContain('পুরনো ব্যাজ');
  });
  it('renders the small top heading above the hero 02 countdown and hides it when cleared', () => {
    const end = new Date(Date.now() + 86_400_000).toISOString();
    const { container, rerender } = render(<Template02Sections page={heroPage({ design: 't2-02', t2h2_timer_enabled: '1', t2h2_timer_end: end, text_t2h2_top_heading: 'আজকের বিশেষ অফার' })} section="hero" onOrderClick={() => {}} />);
    expect(container.querySelector('.t2h2-top-heading')?.textContent).toContain('আজকের বিশেষ অফার');
    rerender(<Template02Sections page={heroPage({ design: 't2-02', t2h2_timer_enabled: '1', t2h2_timer_end: end, text_t2h2_top_heading: '' })} section="hero" onOrderClick={() => {}} />);
    expect(container.querySelector('.t2h2-top-heading')).toBeNull();
  });
});
