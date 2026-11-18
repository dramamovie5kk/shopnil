import { describe, it, expect } from 'vitest';
import { extraSectionData, extraSectionDesigns, supportsExtraDesigns, extraComponentStyle, extraTheme } from '@/lib/extraSectionDesigns';
import type { SalesPage } from '@/types/salesPage';
describe('extra section customization', () => {
  for (const number of [1, 2, 3] as const) {
    it(`offers exactly six designs for extra section ${number}`, () => {
      expect(extraSectionDesigns.map(d => d.id)).toEqual(['01', '02', '03', '04', '05', '06']);
      const page = { [`extra_section_${number}_heading`]: 'Heading', [`extra_section_${number}_points`]: ['Point'], [`show_extra_section_${number}`]: true, template_styles: { [`extra${number}`]: { design: '06' } } } as unknown as SalesPage;
      expect(extraSectionData(page, number)).toEqual({ heading: 'Heading', points: ['Point'], enabled: true, settings: { design: '06' } });
    });
  }
  it('keeps ready-made extra designs out of Custom', () => {
    expect(supportsExtraDesigns('template-15-universal')).toBe(false);
    expect(supportsExtraDesigns('template-01-organic')).toBe(true);
    expect(supportsExtraDesigns('template-02-clothing')).toBe(true);
  });
  it('keeps component overrides independent with shared fallback', () => {
    const settings = { text_color: '#111111', point_0_text_color: '#222222', point_0_text_fontSize: '24', point_0_text_enabled: '0', point_1_text_radius: '8' };
    expect(extraComponentStyle(settings, 'point_0_text', 'text')).toMatchObject({ color: '#222222', fontSize: '24px', display: 'none' });
    expect(extraComponentStyle(settings, 'point_1_text', 'text')).toMatchObject({ color: '#111111', borderRadius: '8px', display: undefined });
  });
  it('retains an explicitly emptied points array rather than reviving old points', () => {
    expect(extraSectionData({ extra_section_1_points: [], extra_section_1_point_1: 'Deleted' } as SalesPage, 1).points).toEqual([]);
  });
  it('rejects invalid colors and constrains section geometry', () => {
    expect(extraTheme({ background: 'url(unsafe)', width: '9999', padding: '-2' })).toEqual({ '--extra-width': '1400px', '--extra-padding': '0px' });
  });
});
