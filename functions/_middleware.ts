import type { Env } from '../server/core';
import { socialMetadata } from '../src/lib/socialMetadata';

// Social crawlers do not run the SPA: render saved branding into the HTML response.
export const onRequest: PagesFunction<Env> = async context => {
  const response = await context.next();
  if (context.request.method !== 'GET' || !response.headers.get('content-type')?.includes('text/html')) return response;
  try {
    const { results } = await context.env.DB.prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('site_name','site_logo_url','header_customization','og_title','og_description')").all<{ setting_key: string; setting_value: string }>();
    const meta = socialMetadata(Object.fromEntries(results.map(row => [row.setting_key, row.setting_value || ''])), context.request.url);
    const values: Record<string, string> = {
      description: meta.description, author: meta.name,
      'og:site_name': meta.name, 'og:title': meta.title, 'og:description': meta.description,
      'og:url': meta.url, 'og:image': meta.image,
      'twitter:title': meta.title, 'twitter:description': meta.description, 'twitter:image': meta.image,
    };
    const rewritten = new HTMLRewriter()
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
