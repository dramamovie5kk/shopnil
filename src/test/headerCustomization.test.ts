import { describe, expect, it } from 'vitest';
import { parseHeaderCustomization, headerCustomizationCss } from '@/lib/headerCustomization';
describe('independent header customization', () => {
  it('preserves default desktop and mobile designs when unset or malformed', () => {
    for (const value of [undefined,'null','broken','[]']) expect(parseHeaderCustomization(value)).toEqual({desktop:{},mobile:{}});
  });
  it('keeps each device independent and permits hiding a component', () => {
    const c=parseHeaderCustomization(JSON.stringify({desktop:{cart:{background:'#123456',text:'My basket'}},mobile:{menu:{visible:false}}}));
    expect(c.desktop.cart).toEqual({background:'#123456',text:'My basket'});
    expect(c.mobile.cart).toBeUndefined(); expect(c.mobile.menu?.visible).toBe(false);
    const css=headerCustomizationCss(c);
    expect(css).toContain('@media (min-width:1024px)'); expect(css).toContain('@media (max-width:1023px)'); expect(css).toContain('display:none!important');
  });
  it('rejects injected CSS and clamps oversized components', () => {
    const c=parseHeaderCustomization(JSON.stringify({desktop:{logo:{background:'red;}body{display:none',height:'9000',radius:'-10',iconSize:'NaN'},unknown:{color:'#123456'}}}));
    expect(c.desktop.logo).toEqual({height:'144',radius:'0'});
    expect(headerCustomizationCss(c)).not.toContain('body');
    expect(c.desktop).not.toHaveProperty('unknown');
  });
  it('allows independent uploaded logos while rejecting executable URLs', () => {
    const c=parseHeaderCustomization(JSON.stringify({desktop:{logo:{imageUrl:'https://example.com/logo.png'}},mobile:{logo:{imageUrl:'javascript:alert(1)'}}}));
    expect(c.desktop.logo?.imageUrl).toBe('https://example.com/logo.png');
    expect(c.mobile.logo?.imageUrl).toBeUndefined();
  });
  it('keeps user text out of CSS and accepts only known properties', () => {
    const c=parseHeaderCustomization(JSON.stringify({desktop:{searchInput:{text:'নিজের পণ্য খুঁজুন',color:'#ffffff',position:'fixed'}},mobile:{header:{height:'80'}}}));
    expect(c.desktop.searchInput?.text).toBe('নিজের পণ্য খুঁজুন');
    expect(headerCustomizationCss(c)).not.toContain('নিজের পণ্য');
    expect(headerCustomizationCss(c)).not.toContain('position');
    expect(headerCustomizationCss(c)).toContain('[data-header-row]{height:80px');
  });
});
