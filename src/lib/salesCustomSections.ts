import type { SalesPage } from '@/types/salesPage';
import type { CustomSection } from '@/components/admin/CustomSectionEditor';

export function salesCustomSections(page: Pick<SalesPage, 'template_styles'>): CustomSection[] {
  const saved = page.template_styles?.customSections as unknown;
  return Array.isArray(saved) ? saved.filter((section): section is CustomSection =>
    Boolean(section && typeof section === 'object' && typeof section.id === 'string' && section.id.startsWith('cs-'))
  ) : [];
}

export function withCustomSectionOrder<T extends Pick<SalesPage, 'template_styles' | 'section_order'>>(page: T): T {
  const ids = salesCustomSections(page).map(section => section.id);
  if (!ids.length) return page;
  const defaults = ['hero', 'video', 'gallery', 'features', 'spec', 'reviews', 'contact', 'extra1', 'extra2', 'extra3', 'checkout'];
  const order = page.section_order?.length ? page.section_order : defaults;
  return { ...page, section_order: [...new Set([...order.filter(id => !id.startsWith('cs-') || ids.includes(id)), ...ids])] };
}