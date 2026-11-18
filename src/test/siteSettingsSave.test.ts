import { beforeEach, describe, expect, it, vi } from "vitest";
const { upsert, from } = vi.hoisted(() => {
  const upsert = vi.fn();
  return { upsert, from: vi.fn(() => ({ upsert })) };
});
vi.mock("@/integrations/cloudflare/client", () => ({ api: { from } }));
import { saveSiteSettings, changedSiteSettings } from "@/hooks/useSiteSettings";

describe("settings batch save", () => {
  beforeEach(() => { vi.clearAllMocks(); upsert.mockResolvedValue({ error: null }); });
  it("saves all settings in one request with unchanged values", async () => {
    await saveSiteSettings({ site_name: "Shop", topbar_enabled: "0", home_banner_image: "" });
    expect(from).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith([
      { setting_key: "site_name", setting_value: "Shop", updated_at: expect.any(String) },
      { setting_key: "topbar_enabled", setting_value: "0", updated_at: expect.any(String) },
      { setting_key: "home_banner_image", setting_value: "", updated_at: expect.any(String) },
    ], { onConflict: "setting_key" });
  });
  it("reports failed saves instead of indicating success", async () => {
    const error = new Error("Save failed");
    upsert.mockResolvedValue({ error });
    await expect(saveSiteSettings({ site_name: "Shop" })).rejects.toThrow(error);
  });
  it("does not send empty batches", async () => {
    await saveSiteSettings({});
    expect(from).not.toHaveBeenCalled();
  });
});
describe("changed setting selection", () => {
  it("does not resend unchanged or stale settings", () => {
    expect(changedSiteSettings({site_name:"Shop",home_banner_image:"new.png",topbar_enabled:"0"},{site_name:"Shop",home_banner_image:"old.png",topbar_enabled:"0"})).toEqual({home_banner_image:"new.png"});
  });
  it("includes new defaults and deliberate value clearing", () => {
    expect(changedSiteSettings({site_name:"",new_option:"0"},{site_name:"Old"})).toEqual({site_name:"",new_option:"0"});
  });
});
