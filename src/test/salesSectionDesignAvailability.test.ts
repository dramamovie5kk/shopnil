import { describe, expect, it } from 'vitest';
import { builtInSectionsForTemplate, customTemplateSectionOrder, pageWithAvailableDesigns, supportsSectionDesign, toggleSectionDesign } from '@/lib/salesSectionDesignAvailability';
import { template02Sections, template02DesignOptions, isTemplate02Design, template02DialNumber } from '@/lib/template02Designs';

const sections = ['hero', 'features', 'gallery', 'contact', 'reviews'];
describe('sales section design availability', () => {
  it('deselects a selected design to restore the original without losing saved customization', () => {
    for (const design of ['01', '06', '10', 't2-01', 't2-05']) {
      const saved = { design, text_heading: 'Saved', appearance: '{"heading.fontSize":"32"}' };
      const original = toggleSectionDesign(saved, design);
      expect(original).toEqual({ text_heading: 'Saved', appearance: '{"heading.fontSize":"32"}' });
      expect(saved.design).toBe(design);
      expect(toggleSectionDesign(original, design)).toEqual(saved);
    }
  });
  it('selects a different design rather than deselecting it', () => {
    expect(toggleSectionDesign({ design: '01' }, '02')).toEqual({ design: '02' });
    expect(toggleSectionDesign(undefined, '01')).toEqual({ design: '01' });
  });
  it('allows only checkout as a ready-made section in Custom', () => {
    expect(builtInSectionsForTemplate('template-15-universal')).toEqual(['checkout']);
  });
  it('does not restrict ready-made sections in Template 01 or Template 02', () => {
    expect(builtInSectionsForTemplate('template-01-organic')).toBeUndefined();
    expect(builtInSectionsForTemplate('template-02-clothing')).toBeUndefined();
  });
  it('renders only checkout and user-created sections from legacy Custom orders without erasing the order', () => {
    const savedOrder = ['hero', 'video', 'cs-hero', 'gallery', 'features', 'reviews', 'contact', 'checkout', 'extra1', 'cs-deleted'];
    expect(customTemplateSectionOrder(savedOrder, ['cs-hero', 'cs-gallery'])).toEqual(['cs-hero', 'checkout', 'cs-gallery']);
    expect(savedOrder).toEqual(['hero', 'video', 'cs-hero', 'gallery', 'features', 'reviews', 'contact', 'checkout', 'extra1', 'cs-deleted']);
  });
  it('includes checkout even when a Custom page has no saved section order', () => {
    expect(customTemplateSectionOrder(undefined, [])).toEqual(['checkout']);
  });
  it('offers non-checkout designs for Template 01 and Template 02 but not Custom', () => {
    for (const section of sections) {
      expect(supportsSectionDesign('template-01-organic', section)).toBe(true);
      expect(supportsSectionDesign('template-02-clothing', section)).toBe(true);
      expect(supportsSectionDesign('template-15-universal', section)).toBe(false);
    }
  });
  it('keeps checkout available on all three templates', () => {
    for (const template of ['template-01-organic', 'template-02-clothing', 'template-15-universal']) {
      expect(supportsSectionDesign(template, 'checkout')).toBe(true);
    }
  });
  it('ignores unsupported saved designs without mutating settings or checkout', () => {
    for (const template of ['template-15-universal', 'template-03-fashion']) {
      const page = { template_id: template, template_styles: Object.fromEntries(
        [...sections, 'checkout'].map(section => [section, { design: '06', text_heading: 'Saved copy' }])
      ) };
      const rendered = pageWithAvailableDesigns(page);
      for (const section of sections) {
        expect(rendered.template_styles?.[section]?.design).toBeUndefined();
        expect(page.template_styles?.[section]?.design).toBe('06');
      }
      expect(rendered.template_styles?.checkout?.design).toBe('06');
      expect(rendered.template_styles?.hero?.text_heading).toBe('Saved copy');
    }
  });
  it('keeps only the 01–10 designs on Template 01 and only the Template 02 designs on Template 02', () => {
    for (const design of ['01', '06', '10']) {
      const page = { template_id: 'template-01-organic', template_styles: { hero: { design }, contact: { design } } };
      expect(pageWithAvailableDesigns(page).template_styles.hero.design).toBe(design);
      expect(pageWithAvailableDesigns({ ...page, template_id: 'template-02-clothing' }).template_styles.hero.design).toBeUndefined();
    }
    for (const design of ['t2-01', 't2-05']) {
      const page = { template_id: 'template-02-clothing', template_styles: { hero: { design }, contact: { design } } };
      expect(pageWithAvailableDesigns(page).template_styles.hero.design).toBe(design);
      expect(pageWithAvailableDesigns({ ...page, template_id: 'template-01-organic' }).template_styles.hero.design).toBeUndefined();
    }
  });
  it('keeps Template 01 saved designs intact', () => {
    const page = { template_id: 'template-01-organic', template_styles: { hero: { design: '10' } } };
    expect(pageWithAvailableDesigns(page)).toBe(page);
    expect(pageWithAvailableDesigns(page).template_styles?.hero?.design).toBe('10');
  });
  for (const section of template02Sections) {
    it(`offers exactly five unique Template 02 ${section} designs`, () => {
      const options = template02DesignOptions(section);
      expect(options.map(d => d.id)).toEqual(['t2-01', 't2-02', 't2-03', 't2-04', 't2-05']);
      expect(new Set(options.map(d => d.label)).size).toBe(5);
      for (const design of options) {
        expect(isTemplate02Design(design.id)).toBe(true);
        const page = { template_id: 'template-02-clothing', template_styles: { [section]: { design: design.id } } };
        expect(pageWithAvailableDesigns(page).template_styles[section].design).toBe(design.id);
        expect(pageWithAvailableDesigns({ ...page, template_id: 'template-01-organic' }).template_styles[section].design).toBeUndefined();
        expect(pageWithAvailableDesigns({ ...page, template_id: 'template-15-universal' }).template_styles[section].design).toBeUndefined();
      }
    });
  }
  it('preserves separate call and WhatsApp numbers and country codes', () => {
    expect(template02DialNumber('01711111111', '880')).toBe('+8801711111111');
    expect(template02DialNumber('01822222222', '880')).toBe('+8801822222222');
    expect(template02DialNumber('+8801711111111', '880')).toBe('+8801711111111');
    expect(template02DialNumber('', '880')).toBe('');
  });
});