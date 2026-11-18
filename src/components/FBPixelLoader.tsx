import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { api } from "@/integrations/cloudflare/client";
import {
  captureFbclid,
  getOrCreateExternalId,
  getPersistedUser,
  buildAdvancedMatching,
  getCookie,
} from "@/lib/fbTracking";

declare global {
  interface Window {
    __fbPixelConfig?: { id: string; enabled: boolean };
  }
}

const isAdminPath = (p: string) => p.startsWith("/admin");

/**
 * Loads the Meta Pixel base script when admin configured a Pixel ID and enabled it.
 * Fires PageView on every route change — browser (fbq) and server (Conversions API)
 * with the same event_id so Meta deduplicates them.
 */
const FBPixelLoader = () => {
  const { getSetting } = useSiteSettings();
  const pixelId = getSetting("fb_pixel_id", "").trim();
  const enabled = getSetting("fb_pixel_enabled", "false") === "true";
  const location = useLocation();
  const lastTracked = useRef<string>("");

  // Load base script + init (once)
  useEffect(() => {
    window.__fbPixelConfig = { id: pixelId, enabled };
    if (!pixelId || !enabled) return;

    captureFbclid();
    const externalId = getOrCreateExternalId();

    if (!(window as any).fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      (window as any).fbq("init", pixelId, buildAdvancedMatching(getPersistedUser(), externalId));
    }

    const onUserUpdated = (e: any) => {
      try {
        (window as any).fbq?.("init", pixelId, buildAdvancedMatching(e?.detail || {}, externalId));
      } catch {}
    };
    window.addEventListener("fb-user-updated", onUserUpdated);
    return () => window.removeEventListener("fb-user-updated", onUserUpdated);
  }, [pixelId, enabled]);

  // PageView on every route (browser + server, deduped by event_id)
  useEffect(() => {
    if (!pixelId || !enabled || isAdminPath(location.pathname)) return;
    const key = location.pathname + location.search;
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    const eventId = `pv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      (window as any).fbq?.("track", "PageView", {}, { eventID: eventId });
    } catch {}

    const sourceUrl = window.location.href;
    // Small delay so the Pixel can set the _fbp cookie before the server event
    const timer = window.setTimeout(() => {
      const u = getPersistedUser();
      api.functions
        .invoke("fb-conversions-api", {
          body: {
            event_name: "PageView",
            event_id: eventId,
            event_source_url: sourceUrl,
            user_data: {
              email: u.email,
              phone: u.phone,
              first_name: u.firstName,
              last_name: u.lastName,
              city: u.city,
              country: u.country || "BD",
              external_id: getOrCreateExternalId(),
              client_user_agent: navigator.userAgent,
              fbp: getCookie("_fbp"),
              fbc: getCookie("_fbc"),
            },
            custom_data: {},
          },
        })
        .catch((e) => console.warn("[CAPI] PageView failed", e));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [pixelId, enabled, location.pathname, location.search]);

  return null;
};

export default FBPixelLoader;
