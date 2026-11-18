import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../../functions/api/health";

type Context = Parameters<typeof onRequest>[0];

function context(method = "GET", fail = false) {
  const first = fail ? vi.fn().mockRejectedValue(new Error("private binding detail")) : vi.fn().mockResolvedValue({ ok: 1 });
  const list = vi.fn().mockResolvedValue({ objects: [] });
  const input = {
    request: new Request("https://example.pages.dev/api/health", { method }),
    env: { JWT_SECRET: "a".repeat(64), DB: { prepare: vi.fn(() => ({ first })) }, BUCKET: { list } },
  };
  return { input: input as unknown as Context, first, list };
}

describe("Pages binding readiness", () => {
  it("checks both bindings and returns readiness without object data", async () => {
    const c = context();
    const response = await onRequest(c.input);
    expect(c.first).toHaveBeenCalledOnce();
    expect(c.list).toHaveBeenCalledWith({ limit: 1 });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ready: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("fails closed without reflecting binding exceptions", async () => {
    const response = await onRequest(context("GET", true).input);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ready: false });
  });

  it("does not access bindings for disallowed methods", async () => {
    const c = context("POST");
    const response = await onRequest(c.input);
    expect(response.status).toBe(405);
    expect(c.first).not.toHaveBeenCalled();
    expect(c.list).not.toHaveBeenCalled();
  });

  it("does not claim readiness without a signing secret", async () => {
    const c = context();
    c.input.env.JWT_SECRET = "";
    const response = await onRequest(c.input);
    expect(response.status).toBe(503);
  });

  it("supports HEAD without a response body", async () => {
    const response = await onRequest(context("HEAD").input);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});
