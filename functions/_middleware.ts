import type { Env } from '../server/core';
import { homeBannerImageSizes, parseHomeBannerConfig } from '../src/lib/homeBanner';
import { imageVariant, imageSrcSet } from '../src/lib/responsiveImage';
import { socialMetadata } from '../src/lib/socialMetadata';

const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function bannerPreload(settings: Record<string, string>, page: URL): string {
  if (page.pathname !== '/') return '';
  const { images } = parseHomeBannerConfig(settings.home_banner_config, settings.home_banner_image);
  if (!images[0]) return '';
  try {
    const url = new URL(images[0], page);
    if (url.origin !== page.origin || !url.pathname.startsWith('/api/media/')) return '';
    const variants = imageSrcSet(url.href);
    const responsive = variants ? ` imagesrcset="${escapeAttribute(variants)}" imagesizes="${homeBannerImageSizes}"` : '';
    return `<link rel="preload" as="image" href="${escapeAttribute(imageVariant(url.href, 1600))}" fetchpriority="high"${responsive}>`;
  } catch { return ''; }
}

// Social crawlers do not run the SPA: render saved branding into the HTML response.
export const onRequest: PagesFunction<Env> = async context => {
  const response = await context.next();
  if (context.request.method !== 'GET' || !response.headers.get('content-type')?.includes('text/html')) return response;
  try {
    const page = new URL(context.request.url);
    const { results } = await context.env.DB.prepare(
      "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('site_name','site_logo_url','header_customization','og_title','og_description') OR (? = 1 AND setting_key IN ('home_banner_config','home_banner_image'))"
    ).bind(page.pathname === '/' ? 1 : 0).all<{ setting_key: string; setting_value: string }>();
    const settings = Object.fromEntries(results.map(row => [row.setting_key, row.setting_value || '']));
    const meta = socialMetadata(settings, page.href);
    const preload = bannerPreload(settings, page);
    const values: Record<string, string> = {
      description: meta.description, author: meta.name,
      'og:site_name': meta.name, 'og:title': meta.title, 'og:description': meta.description,
      'og:url': meta.url, 'og:image': meta.image,
      'twitter:title': meta.title, 'twitter:description': meta.description, 'twitter:image': meta.image,
    };
    const rewritten = new HTMLRewriter()
      .on('meta[name="viewport"]', { element(element) { if (preload) element.after(preload, { html: true }); } })
      .on('title', { element(element) { element.setInnerContent(meta.name); } })
      .on('meta', { element(element) {
        const key = element.getAttribute('property') || element.getAttribute('name') || '';
        if (!(key in values)) return;
        if (!values[key]) element.remove(); else element.setAttribute('content', values[key]);
      } }).transform(response);
    const headers = new Headers(rewritten.headers); headers.set('Cache-Control', 'no-store');
    return new Response(rewritten.body, { status: rewritten.status, headers });
  } catch { return response; }
};
