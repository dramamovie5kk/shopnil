import { useEffect, useRef } from "react";

const SOURCE_STORAGE_KEY = "order_source";

const sourceLabels: Record<string, string> = {
  "facebook_ad": "ফেসবুক অ্যাড",
  "facebook": "ফেসবুক",
  "google_ad": "গুগল অ্যাড",
  "google": "গুগল",
  "tiktok": "টিকটক",
  "instagram": "ইনস্টাগ্রাম",
  "youtube": "ইউটিউব",
  "direct": "ডিরেক্ট",
  "sales_page": "সেলস পেজ",
  "manual": "ম্যানুয়াল",
  "abandoned_cart": "অসম্পূর্ণ অর্ডার",
  "other": "অন্যান্য",
};

export const getSourceLabel = (source: string | null | undefined): string => {
  if (!source) return sourceLabels.direct;
  return sourceLabels[source] || source;
};

export const getSourceColor = (source: string | null | undefined): string => {
  switch (source) {
    case "facebook_ad": return "bg-blue-600 text-white";
    case "facebook": return "bg-blue-500 text-white";
    case "google_ad": return "bg-red-500 text-white";
    case "google": return "bg-yellow-500 text-black";
    case "tiktok": return "bg-black text-white";
    case "instagram": return "bg-pink-500 text-white";
    case "youtube": return "bg-red-600 text-white";
    case "sales_page": return "bg-purple-500 text-white";
    case "manual": return "bg-orange-500 text-white";
    case "abandoned_cart": return "bg-amber-500 text-white";
    default: return "bg-muted text-muted-foreground";
  }
};

/**
 * Captures UTM parameters from URL and determines order source.
 * Stores in sessionStorage so it persists across page navigations.
 */
export const useOrderSource = () => {
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source")?.toLowerCase();
    const utmMedium = params.get("utm_medium")?.toLowerCase();
    const ref = params.get("ref")?.toLowerCase();
    const fbclid = params.get("fbclid");
    const gclid = params.get("gclid");
    const ttclid = params.get("ttclid");

    let source = "direct";

    if (fbclid || (utmSource === "facebook" && utmMedium === "cpc")) {
      source = "facebook_ad";
    } else if (utmSource === "facebook" || ref === "facebook") {
      source = "facebook";
    } else if (gclid || (utmSource === "google" && utmMedium === "cpc")) {
      source = "google_ad";
    } else if (utmSource === "google" || ref === "google") {
      source = "google";
    } else if (ttclid || utmSource === "tiktok") {
      source = "tiktok";
    } else if (utmSource === "instagram" || ref === "instagram") {
      source = "instagram";
    } else if (utmSource === "youtube" || ref === "youtube") {
      source = "youtube";
    } else if (utmSource) {
      source = utmSource;
    }

    // Only overwrite if we detected a non-direct source, or no source stored yet
    const existing = sessionStorage.getItem(SOURCE_STORAGE_KEY);
    if (source !== "direct" || !existing) {
      sessionStorage.setItem(SOURCE_STORAGE_KEY, source);
    }
  }, []);

  const getOrderSource = (override?: string): string => {
    if (override) return override;
    return sessionStorage.getItem(SOURCE_STORAGE_KEY) || "direct";
  };

  return { getOrderSource };
};
