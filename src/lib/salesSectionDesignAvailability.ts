import type { SalesPage } from '@/types/salesPage';
import { isTemplate02Design } from './template02Designs';

// Only remove the opt-in design; retain copy, colors and per-design appearance.
export function toggleSectionDesign(settings: Record<string, string> | undefined, design: string): Record<string, string> {
  const next = { ...settings };
  if (next.design === design) delete next.design;
  else next.design = design;
  return next;
}

export function builtInSectionsForTemplate(templateId: string): string[] | undefined {
  return templateId === 'template-15-universal' ? ['checkout'] : undefined;
}

// Filter a copy so switching templates never erases saved sections.
export function customTemplateSectionOrder(order: string[] | null | undefined, customIds: string[]): string[] {
  const allowed = new Set(['checkout', ...customIds]);
  const result = [...new Set([...(order ?? []), ...customIds])].filter(id => allowed.has(id));
  return result.includes('checkout') ? result : [...result, 'checkout'];
}

// Shared by editing and rendering so switching templates cannot leak designs.
export function supportsSectionDesigns(templateId: string | null | undefined): boolean {
  return templateId === 'template-01-organic' || templateId === 'template-02-clothing';
}

export function supportsSectionDesign(templateId: string | null | undefined, section: string): boolean {
  return section === 'checkout' || supportsSectionDesigns(templateId);
}

// Template 01 keeps only the 01–10 designs, Template 02 only the t2-01..t2-05 designs;
// other templates (incl. Custom) keep only checkout.
export function pageWithAvailableDesigns<T extends Pick<SalesPage, 'template_id' | 'template_styles'>>(page: T): T {
  const styles = { ...page.template_styles };
  let changed = false;
  const allowT2 = page.template_id === 'template-02-clothing';
  const allowStandard = page.template_id === 'template-01-organic';
  for (const section of ['hero', 'features', 'gallery', 'contact', 'reviews']) {
    if (!styles[section]) continue;
    const design = styles[section].design;
    if (!design) continue;
    if (isTemplate02Design(design) ? allowT2 : allowStandard) continue;
    const settings = { ...styles[section] };
    delete settings.design;
    changed = true;
    styles[section] = settings;
  }
  return changed ? { ...page, template_styles: styles } : page;
}