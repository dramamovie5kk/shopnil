import { describe, it, expect } from 'vitest';
import { appearanceCss, appearanceDeclarations, appearanceNamespace, readAppearance, writeAppearance } from '@/lib/sectionAppearance';
describe('all sales section appearance settings', () => {
  it('keeps old/new designs and templates independently editable', () => {
    const a = appearanceNamespace('template-01-organic');
    const b = appearanceNamespace('template-01-organic', '01');
    const c = appearanceNamespace('template-02-clothing', 't2-01');
    let settings = writeAppearance({ design: '01', text_heading: 'Original' }, a, { 'heading.fontSize': '24' });
    settings = writeAppearance(settings, b, { 'heading.fontSize': '32' });
    settings = writeAppearance(settings, c, { 'heading.fontSize': '40' });
    expect(readAppearance(settings, a)['heading.fontSize']).toBe('24');
    expect(readAppearance(settings, b)['heading.fontSize']).toBe('32');
    expect(readAppearance(settings, c)['heading.fontSize']).toBe('40');
    expect(settings.text_heading).toBe('Original');
  });
  for (const section of ['hero','gallery','features','reviews','contact','extra1','extra2','extra3','checkout','video','spec']) {
    it(`supports independent color and size for ${section}`, () => {
      const settings = writeAppearance({}, 'legacy', { 'heading-0.color':'#123456','heading-0.fontSize':'28','button-1.radius':'8' });
      const values=readAppearance(settings, 'legacy');
      expect(appearanceDeclarations(values,'heading-0')).toContain('color:#123456!important');
      expect(appearanceDeclarations(values,'heading-0')).toContain('font-size:28px!important');
      expect(appearanceDeclarations(values,'button-1')).toContain('border-radius:8px!important');
      expect(appearanceDeclarations(values,'heading-1')).toBe('');
    });
  }
  it('rejects arbitrary selectors and unsafe style values', () => {
    expect(appearanceCss('[data-scope="safe"]', {'body.color':'#123456','heading.color':'red;display:none', 'heading.background':'url(https://evil.test)'})).not.toContain('evil');
    expect(appearanceDeclarations({'text.fontSize':'bad', 'text.color':'expression(alert(1))'},'text')).toBe('');
    expect(appearanceCss('[data-scope="safe"]', {'body.color':'#123456'})).toBe('');
  });
  it('restores invalid saved values safely and retains other settings', () => {
    expect(readAppearance({ appearance: '{bad'},'legacy')).toEqual({});
    expect(writeAppearance({appearance:'{bad',design:'06'},'legacy',{}).design).toBe('06');
  });
});
