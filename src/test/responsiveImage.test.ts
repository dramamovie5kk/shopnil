import { describe, expect, it } from 'vitest';
import { imageVariant, imageSrcSet, isProductImageUrl } from '@/lib/responsiveImage';
describe('responsive image URLs',()=>{
  it('recognizes uploaded product images and keeps legacy emoji placeholders', () => {
    for (const src of ['/api/media/products/photo.webp', '/placeholder.svg', 'https://cdn.example/photo.jpg']) {
      expect(isProductImageUrl(src)).toBe(true);
    }
    for (const src of [null, '', '📦', '//cdn.example/photo.jpg', '/\\cdn.example/photo.jpg']) {
      expect(isProductImageUrl(src)).toBe(false);
    }
  });
  it('requests bounded variants for stored media and preserves existing query strings',()=>{
    expect(imageVariant('/api/media/products/image.png',320)).toBe('/api/media/products/image.png?width=384');
    expect(imageVariant('https://shop.example/api/media/products/image.jpg?v=1',800)).toBe('https://shop.example/api/media/products/image.jpg?v=1&width=960');
    expect(imageSrcSet('/api/media/products/image.png')).toContain('width=1600 1600w');
  });
  it('keeps external images, animations and videos intact',()=>{
    for(const src of ['https://cdn.example/photo.jpg','/api/media/products/video.mp4','/api/media/products/spin.gif']){expect(imageVariant(src,384)).toBe(src);expect(imageSrcSet(src)).toBeUndefined();}
  });
});
