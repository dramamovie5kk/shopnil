import type { SalesPage } from '@/types/salesPage';

export function template02HeroImages(page: SalesPage | undefined, settings: Record<string, string>): string[] {
  if (settings.t2h1_images !== undefined) {
    try {
      const parsed: unknown = JSON.parse(settings.t2h1_images);
      if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    } catch { /* Resolve older saved image lists if the unified list is invalid. */ }
  }
  return [1, 2].flatMap(column => template02HeroColumnImages(page, settings, column));
}

export function template02HeroColumnImages(page: SalesPage | undefined, settings: Record<string, string>, column: number): string[] {
  const stored = settings[`t2h1_images_${column}`];
  if (stored !== undefined) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    } catch { /* Preserve legacy images if an invalid list was saved. */ }
  }
  const legacy = settings[`t2h1_image_${column}`] ?? page?.hero_images?.[column - 1] ?? (column === 1 ? page?.products?.image_url : '');
  return legacy ? [legacy] : [];
}