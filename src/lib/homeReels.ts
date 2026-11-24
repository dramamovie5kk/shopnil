export const homeReelsSetting = 'home_reels';
export const reelSources = {
  youtube: { label: 'ইউটিউব', example: 'https://www.youtube.com/shorts/…' },
  facebook: { label: 'ফেসবুক', example: 'https://www.facebook.com/reel/…' },
  drive: { label: 'গুগল ড্রাইভ', example: 'https://drive.google.com/file/d/…/view' },
  mp4: { label: 'কাস্টম MP4', example: 'https://example.com/video.mp4' },
} as const;

export type ReelSource = keyof typeof reelSources;
export type HomeReel = { id: string; title: string; source: ReelSource; url: string; cover: string; productSlug?: string };

export function isReelSource(value: unknown): value is ReelSource {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(reelSources, value);
}

function httpsUrl(value: string): URL | null {
  if (value.length > 2000) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch {
    return null;
  }
}

function mediaPath(value: string) {
  return value.startsWith('/api/media/') && !/[\\\r\n]/.test(value);
}

export function reelCover(value: string) {
  const input = value.trim();
  return mediaPath(input) ? input : httpsUrl(input)?.href || '';
}

export function reelPlayback(source: ReelSource, value: string): { kind: 'video' | 'embed' | 'external'; url: string } | null {
  const input = value.trim();
  const url = httpsUrl(input);
  if (source === 'mp4') {
    if (mediaPath(input) && /\.mp4(?:[?#]|$)/i.test(input)) return { kind: 'video', url: input };
    return url && /\.mp4$/i.test(url.pathname) ? { kind: 'video', url: url.href } : null;
  }
  if (!url) return null;
  const { hostname, pathname, searchParams } = url;
  if (source === 'youtube') {
    const id = hostname === 'youtu.be'
      ? pathname.split('/')[1]
      : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(hostname)
        ? searchParams.get('v') || /^\/(?:shorts|embed|live)\/([\w-]+)/.exec(pathname)?.[1] : undefined;
    return id && /^[\w-]{11}$/.test(id) ? { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&controls=0&playsinline=1` } : null;
  }
  if (source === 'drive') {
    if (hostname !== 'drive.google.com') return null;
    const id = /^\/file\/d\/([\w-]+)/.exec(pathname)?.[1] || searchParams.get('id');
    if (!id || !/^[\w-]+$/.test(id)) return null;
    const preview = new URL(`https://drive.google.com/file/d/${id}/preview`);
    const resourceKey = searchParams.get('resourcekey');
    if (resourceKey) preview.searchParams.set('resourcekey', resourceKey);
    return { kind: 'embed', url: preview.href };
  }
  if (hostname === 'fb.watch' && /^\/[\w-]+\/?$/.test(pathname)) return { kind: 'external', url: url.href };
  if (!['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com'].includes(hostname)) return null;
  if (/^\/share\/(?:r|v)\/[\w-]+\/?$/.test(pathname)) return { kind: 'external', url: url.href };
  if (!(/\/reels?\/\d+\/?$|\/videos?\/(?:[^/]+\/)?\d+\/?$/.test(pathname) || (/^\/(?:watch\/?|video\.php)$/.test(pathname) && /^\d+$/.test(searchParams.get('v') || '')))) return null;
  return { kind: 'embed', url: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=true&href=' + encodeURIComponent(url.href) };
}

export function parseHomeReels(raw: string): HomeReel[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 30).flatMap(item => {
      if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title.trim()
        || !isReelSource(item.source) || typeof item.url !== 'string' || !reelPlayback(item.source, item.url)) return [];
      return [{ id: item.id, title: item.title.trim().slice(0, 120), source: item.source, url: item.url.trim(), cover: typeof item.cover === 'string' ? reelCover(item.cover) : '',
        ...(typeof item.productSlug === 'string' && item.productSlug.trim() ? { productSlug: item.productSlug.trim().slice(0, 200) } : {}), }];
    });
  } catch {
    return [];
  }
}
