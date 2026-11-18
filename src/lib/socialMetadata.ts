// Shared by the server HTML response and the browser so crawlers see the same brand.
export function socialMetadata(settings: Record<string, string>, requestUrl: string) {
  const page = new URL(requestUrl);
  page.search = ''; page.hash = '';
  let header: { desktop?: { logo?: { imageUrl?: unknown } }; mobile?: { logo?: { imageUrl?: unknown } } } = {};
  try { header = JSON.parse(settings.header_customization || '{}') || {}; } catch { /* Use the main logo. */ }
  const candidates = [header.desktop?.logo?.imageUrl, settings.site_logo_url, header.mobile?.logo?.imageUrl];
  let image = '';
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim() || /[\x00-\x20\\]/.test(candidate)) continue;
    try {
      const url = new URL(candidate, page.origin);
      if (url.protocol === 'https:' || (candidate.startsWith('/api/media/') && url.origin === page.origin)) {
        image = url.href; break;
      }
    } catch { /* Ignore invalid saved image URLs. */ }
  }
  const name = settings.site_name?.trim() || 'Baridhara';
  return { name, title: settings.og_title?.trim() || name, description: settings.og_description?.trim() || `${name} - Online Shop`, image, url: page.href };
}
