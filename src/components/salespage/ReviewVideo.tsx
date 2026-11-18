import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
/** Handles share URLs and direct media without placing non-embeddable page URLs in an iframe. */
export const getReviewVideoSource = (value: string): { type: "iframe" | "video"; url: string } | null => {
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      id = url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/') || url.pathname.startsWith('/live/')
        ? url.pathname.split('/')[2] : url.searchParams.get('v');
    }
    if (id && /^[\w-]{11}$/.test(id)) return { type: 'iframe', url: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
      const vimeoId = url.pathname.split('/').filter(Boolean).at(-1);
      if (vimeoId && /^\d+$/.test(vimeoId)) return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoId}` };
    }
    if (host === 'facebook.com' || host === 'www.facebook.com' || host === 'm.facebook.com' || host === 'fb.watch') {
      return { type: 'iframe', url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.href)}&show_text=false` };
    }
    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url.href)) return { type: 'video', url: url.href };
    return null;
  } catch { return null; }
};

const ReviewVideo = ({ url, title }: { url: string; title: string }) => {
  const source = getReviewVideoSource(url);
  if (!source) return null;
  return <div className="sales-review-video">
    {renderSalesText(source.type === 'iframe' ? <iframe src={source.url} title={salesPlainText(title)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      : <video src={source.url} controls playsInline preload="metadata" aria-label={salesPlainText(title)} />)}
  </div>;
};
export default ReviewVideo;
