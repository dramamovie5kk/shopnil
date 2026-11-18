export interface HomeBannerConfig {
  images: string[];
  width: number;
  height: number;
  heightMobile: number;
  heightDesktop: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  radius: number;
  autoplay: boolean;
  intervalSec: number;
  showDots: boolean;
  showArrows: boolean;
}

export const defaultHomeBannerConfig: HomeBannerConfig = {
  images: [],
  width: 100,
  height: 0,
  heightMobile: 0,
  heightDesktop: 0,
  marginTop: 12,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  radius: 8,
  autoplay: true,
  intervalSec: 4,
  showDots: true,
  showArrows: true,
};

const clamp = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Reads the JSON config; falls back to the legacy single image setting. */
export function parseHomeBannerConfig(raw: string | undefined, legacyImage?: string): HomeBannerConfig {
  let data: Partial<HomeBannerConfig> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    data = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch { data = {}; }
  const d = defaultHomeBannerConfig;
  const images = Array.isArray(data.images) ? data.images.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)) : [];
  if (!images.length && legacyImage) images.push(legacyImage);
  return {
    images,
    width: clamp(data.width, 10, 100, d.width),
    height: clamp(data.height, 0, 1600, d.height),
    heightMobile: clamp(data.heightMobile, 0, 1600, clamp(data.height, 0, 1600, d.height)),
    heightDesktop: clamp(data.heightDesktop, 0, 1600, clamp(data.height, 0, 1600, d.height)),
    marginTop: clamp(data.marginTop, 0, 120, d.marginTop),
    marginRight: clamp(data.marginRight, 0, 120, d.marginRight),
    marginBottom: clamp(data.marginBottom, 0, 120, d.marginBottom),
    marginLeft: clamp(data.marginLeft, 0, 120, d.marginLeft),
    radius: clamp(data.radius, 0, 60, d.radius),
    autoplay: data.autoplay ?? d.autoplay,
    intervalSec: clamp(data.intervalSec, 2, 15, d.intervalSec),
    showDots: data.showDots ?? d.showDots,
    showArrows: data.showArrows ?? d.showArrows,
  };
}
