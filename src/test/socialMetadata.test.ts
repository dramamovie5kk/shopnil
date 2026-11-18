import { describe, expect, it } from 'vitest';
import { socialMetadata } from '@/lib/socialMetadata';
describe('social share branding', () => {
  it('uses the visible desktop header logo instead of a legacy share image', () => {
    const meta = socialMetadata({site_name:'আমার দোকান',site_logo_url:'/api/media/site/main.png',og_image:'https://old.example/zc.png',header_customization:JSON.stringify({desktop:{logo:{imageUrl:'/api/media/site/header.png'}}})},'https://baridhara.pages.dev/products?tracking=1');
    expect(meta.image).toBe('https://baridhara.pages.dev/api/media/site/header.png');
    expect(meta.name).toBe('আমার দোকান');expect(meta.url).toBe('https://baridhara.pages.dev/products');
  });
  it('follows main logo changes and never falls back to the legacy share image', () => {
    expect(socialMetadata({site_logo_url:'https://cdn.example/new.png',header_customization:'broken'},'https://shop.example/').image).toBe('https://cdn.example/new.png');
    expect(socialMetadata({og_image:'https://old.example/zc.png'},'https://shop.example/').image).toBe('');
    expect(socialMetadata({site_logo_url:'javascript:alert(1)'},'https://shop.example/').image).toBe('');
  });
});
