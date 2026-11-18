import { describe, expect, it } from 'vitest';
import { template02HeroColumnImages, template02HeroImages } from '@/lib/template02HeroImages';

describe('Template 02 hero image columns', () => {
  it('uses one ordered image list instead of separate columns', () => {
    expect(template02HeroImages(undefined, { t2h1_images: '["a.jpg","b.jpg","c.jpg"]', t2h1_images_1: '["old.jpg"]' })).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });
  it('preserves both old columns in the unified slider', () => {
    expect(template02HeroImages(undefined, { t2h1_images_1: '["a.jpg","b.jpg"]', t2h1_images_2: '["c.jpg"]' })).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });
  it('keeps a deliberately cleared unified image list empty', () => {
    expect(template02HeroImages(undefined, { t2h1_images: '[]', t2h1_image_1: 'old.jpg' })).toEqual([]);
  });
  it('keeps independent multiple-image lists per column', () => {
    const settings = { t2h1_images_1: '["https://example.com/a.jpg","https://example.com/b.jpg"]', t2h1_images_2: '["https://example.com/c.jpg","https://example.com/d.jpg"]' };
    expect(template02HeroColumnImages(undefined, settings, 1)).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    expect(template02HeroColumnImages(undefined, settings, 2)).toEqual(['https://example.com/c.jpg', 'https://example.com/d.jpg']);
  });
  it('preserves previously saved single images', () => {
    expect(template02HeroColumnImages(undefined, { t2h1_image_1: 'https://example.com/old.jpg' }, 1)).toEqual(['https://example.com/old.jpg']);
  });
  it('does not restore a legacy image when all carousel images are removed', () => {
    expect(template02HeroColumnImages(undefined, { t2h1_images_1: '[]', t2h1_image_1: 'https://example.com/old.jpg' }, 1)).toEqual([]);
  });
});