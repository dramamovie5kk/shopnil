// TikTok tracking helpers — capture ttclid + reuse external_id for Events API
import { getOrCreateExternalId, getCookie } from "@/lib/fbTracking";

const setCookie = (name: string, value: string, days = 90) => {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
};

// Capture ttclid from URL on landing → store in cookie for later attribution
export const captureTtclid = () => {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const ttclid = url.searchParams.get("ttclid");
    if (ttclid && !getCookie("ttclid")) {
      setCookie("ttclid", ttclid);
    }
  } catch {}
};

export const getTtclid = () => getCookie("ttclid");
// _ttp cookie is set automatically by ttq base script
export const getTtp = () => getCookie("_ttp");

export { getOrCreateExternalId };