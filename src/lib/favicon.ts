export function updateFavicon(value: string, version = '') {
  let href = '/favicon.ico?v=2';
  try {
    const url=new URL(value,window.location.origin);
    if (value.trim() && (url.protocol==='https:' || (url.protocol==='http:' && url.origin===window.location.origin))) {
      if(url.origin===window.location.origin && url.pathname.startsWith('/api/media/') && version)url.searchParams.set('v',version);
      href=url.href;
    }
  } catch { /* Restore the server-provided site icon for an invalid or cleared setting. */ }
  const previous=document.querySelector<HTMLLinkElement>('#site-favicon');
  if(previous?.href===new URL(href,window.location.origin).href)return;
  // Replacing the element makes Chromium refresh an already cached tab icon.
  document.querySelectorAll('link[rel~="icon"]').forEach(node=>node.remove());
  const icon=document.createElement('link');icon.id='site-favicon';icon.rel='icon';
  icon.href=href;document.head.appendChild(icon);
}
