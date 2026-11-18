import { describe, expect, it } from "vitest";
import { parseHomeBannerConfig } from "@/lib/homeBanner";

describe("home banner config", () => {
  it("keeps multiple slider images in order", () => {
    const c = parseHomeBannerConfig(JSON.stringify({ images: ["https://a/1.jpg", "https://a/2.jpg"] }));
    expect(c.images).toEqual(["https://a/1.jpg", "https://a/2.jpg"]);
  });
  it("falls back to the old single banner image", () => {
    expect(parseHomeBannerConfig(undefined, "https://a/old.jpg").images).toEqual(["https://a/old.jpg"]);
  });
  it("keeps separate margins on all four sides and the radius", () => {
    const c = parseHomeBannerConfig(JSON.stringify({ marginTop: 10, marginRight: 20, marginBottom: 30, marginLeft: 40, radius: 16 }));
    expect([c.marginTop, c.marginRight, c.marginBottom, c.marginLeft, c.radius]).toEqual([10, 20, 30, 40, 16]);
  });
  it("keeps a saved zero margin as zero", () => {
    const c = parseHomeBannerConfig(JSON.stringify({ marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 }));
    expect([c.marginTop, c.marginRight, c.marginBottom, c.marginLeft]).toEqual([0, 0, 0, 0]);
  });
  it("uses a small top gap only when no margin was saved", () => {
    expect(parseHomeBannerConfig(JSON.stringify({ images: ["https://a/1.jpg"] })).marginTop).toBe(12);
    expect(parseHomeBannerConfig(undefined, "https://a/old.jpg").marginTop).toBe(12);
  });
});


describe("banner sizing and legacy configuration", () => {
  it("defaults old saved sliders to full width and automatic height", () => {
    const config = parseHomeBannerConfig(JSON.stringify({ images: ["https://a/image.jpg"], marginLeft: 20 }));
    expect([config.width, config.height, config.marginLeft]).toEqual([100, 0, 20]);
  });
  it("keeps saved width, fixed height and asymmetric margins", () => {
    const config = parseHomeBannerConfig(JSON.stringify({ width: 75, height: 360, marginTop: 0, marginRight: 30, marginBottom: 25, marginLeft: 10 }));
    expect([config.width, config.height, config.marginTop, config.marginRight, config.marginBottom, config.marginLeft]).toEqual([75, 360, 0, 30, 25, 10]);
  });
  it("bounds invalid dimensions and tolerates malformed saved JSON", () => {
    expect(parseHomeBannerConfig('{"width":500,"height":-5}')).toMatchObject({ width: 100, height: 0 });
    expect(parseHomeBannerConfig('null')).toMatchObject({ width: 100, height: 0 });
    expect(parseHomeBannerConfig('[]')).toMatchObject({ width: 100, height: 0 });
  });
});

describe('device-specific banner height', () => {
  it('preserves the old shared height until each device is configured', () => {
    expect(parseHomeBannerConfig('{"height":420}')).toMatchObject({heightMobile:420,heightDesktop:420});
  });
  it('allows automatic height on one device and a fixed height on the other', () => {
    expect(parseHomeBannerConfig('{"height":420,"heightMobile":0,"heightDesktop":500}')).toMatchObject({heightMobile:0,heightDesktop:500});
  });
  it('clamps device heights independently and falls back for invalid values', () => {
    expect(parseHomeBannerConfig('{"height":300,"heightMobile":-10,"heightDesktop":9000}')).toMatchObject({heightMobile:0,heightDesktop:1600});
    expect(parseHomeBannerConfig('{"height":300,"heightMobile":"bad"}')).toMatchObject({heightMobile:300,heightDesktop:300});
  });
});
