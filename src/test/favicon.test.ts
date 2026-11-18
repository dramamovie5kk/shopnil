import { afterEach, describe, expect, it } from 'vitest';
import { updateFavicon } from '@/lib/favicon';
afterEach(()=>document.querySelector('#site-favicon')?.remove());
describe('site favicon',()=>{
  it('updates the same icon when a new upload is saved',()=>{
    updateFavicon('https://example.com/first.png');updateFavicon('https://example.com/second.png');
    expect(document.querySelectorAll('#site-favicon')).toHaveLength(1);
    expect(document.querySelector<HTMLLinkElement>('#site-favicon')?.href).toBe('https://example.com/second.png');
  });
  it('replaces stale icon links and versions uploaded media',()=>{
    const old=document.createElement('link');old.rel='shortcut icon';old.href='/old.ico';document.head.appendChild(old);
    updateFavicon(window.location.origin+'/api/media/products/site/icon.png','saved-2');
    expect(document.querySelectorAll('link[rel~=icon]')).toHaveLength(1);
    expect(document.querySelector<HTMLLinkElement>('#site-favicon')?.href).toContain('v=saved-2');
  });
  it('restores the original icon when removed or an unsafe URL is saved',()=>{
    updateFavicon('https://example.com/custom.png');updateFavicon('');
    expect(document.querySelector('#site-favicon')?.getAttribute('href')).toBe('/favicon.ico?v=2');
    updateFavicon('javascript:alert(1)');expect(document.querySelector('#site-favicon')?.getAttribute('href')).toBe('/favicon.ico?v=2');
  });
});
