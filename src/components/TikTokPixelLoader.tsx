import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { captureTtclid } from "@/lib/ttTracking";
import { getOrCreateExternalId, getPersistedUser } from "@/lib/fbTracking";

declare global {
  interface Window {
    __ttPixelConfig?: { id: string; enabled: boolean };
  }
}

/**
 * Loads the TikTok Pixel base script when admin has configured a Pixel ID
 * and enabled direct Pixel tracking. Browser events flow through
 * usePixelTracking, which calls ttq.track() in addition to dataLayer.push().
 */
const TikTokPixelLoader = () => {
  const { getSetting } = useSiteSettings();
  const pixelId = getSetting("tiktok_pixel_id", "").trim();
  const enabled = getSetting("tiktok_pixel_enabled", "false") === "true";

  useEffect(() => {
    window.__ttPixelConfig = { id: pixelId, enabled };
    if (!pixelId || !enabled) return;

    captureTtclid();
    const externalId = getOrCreateExternalId();

    if ((window as any).ttq?.loaded) return;

    /* eslint-disable */
    (function (w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = [
        "page","track","identify","instances","debug","on","off","once","ready",
        "alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent",
      ];
      ttq.setAndDefer = function (t: any, e: any) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function (e: any, n: any) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
        var o = n && n.partner;
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var s = d.createElement("script");
        s.type = "text/javascript";
        s.async = !0;
        s.src = r + "?sdkid=" + e + "&lib=" + t;
        var a = d.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(s, a);
      };
      ttq.load(pixelId);
      ttq.page();
    })(window, document, "ttq");
    /* eslint-enable */

    // Identify with persisted user for advanced matching
    try {
      const u = getPersistedUser();
      const ident: Record<string, any> = { external_id: externalId };
      if (u.email) ident.email = u.email;
      if (u.phone) ident.phone_number = u.phone;
      (window as any).ttq?.identify(ident);
    } catch {}

    const onUserUpdated = (e: any) => {
      try {
        const u = e?.detail || {};
        const ident: Record<string, any> = { external_id: externalId };
        if (u.email) ident.email = u.email;
        if (u.phone) ident.phone_number = u.phone;
        (window as any).ttq?.identify(ident);
      } catch {}
    };
    window.addEventListener("fb-user-updated", onUserUpdated);
    return () => window.removeEventListener("fb-user-updated", onUserUpdated);
  }, [pixelId, enabled]);

  return null;
};

export default TikTokPixelLoader;