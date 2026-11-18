import { Env } from '../core';
import { serviceDatabase } from '../service';

const corsHeaders = { 'Cache-Control': 'no-store' };

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("01")) d = "88" + d;
  else if (d.length === 10 && d.startsWith("1")) d = "880" + d;
  return d;
}

function clientIp(req: Request): string | undefined {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

interface CapiPayload {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    date_of_birth?: string;
    gender?: string;
    external_id?: string;
    client_user_agent?: string;
    client_ip_address?: string;
    fbp?: string;
    fbc?: string;
  };
  custom_data?: Record<string, any>;
}

export async function handle(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const database = serviceDatabase(env);

    const { data: rows } = await database
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "fb_pixel_id",
        "fb_pixel_access_token",
        "fb_pixel_test_event_code",
        "fb_pixel_enabled",
      ]);

    const cfg: Record<string, string> = {};
    rows?.forEach((r: {setting_key:string;setting_value:string|null}) => (cfg[r.setting_key] = r.setting_value || ""));

    if (cfg.fb_pixel_enabled !== "true" || !cfg.fb_pixel_id || !cfg.fb_pixel_access_token) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Pixel not configured or disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: CapiPayload = await req.json();
    if (!payload?.event_name) {
      return new Response(JSON.stringify({ error: "event_name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hash PII
    const ud: Record<string, any> = {};
    const u = { ...(payload.user_data || {}) };
    if (u.first_name && !u.last_name && /\s/.test(u.first_name.trim())) {
      const parts = u.first_name.trim().split(/\s+/);
      u.first_name = parts[0];
      u.last_name = parts.slice(1).join(" ");
    }
    if (u.email) ud.em = [await sha256(u.email)];
    if (u.phone && normPhone(u.phone).length >= 8) ud.ph = [await sha256(normPhone(u.phone))];
    if (u.first_name) ud.fn = [await sha256(u.first_name)];
    if (u.last_name) ud.ln = [await sha256(u.last_name)];
    if (u.city) ud.ct = [await sha256(u.city.replace(/\s+/g, ""))];
    if (u.state) ud.st = [await sha256(u.state.replace(/\s+/g, ""))];
    ud.country = [await sha256((u.country || "bd").slice(0, 2))];
    if (u.zip) ud.zp = [await sha256(u.zip)];
    if (u.date_of_birth) ud.db = [await sha256(u.date_of_birth.replace(/\D/g, ""))];
    if (u.gender) ud.ge = [await sha256(u.gender.trim().toLowerCase().slice(0, 1))];
    if (u.external_id) ud.external_id = [await sha256(String(u.external_id))];
    if (u.client_user_agent) ud.client_user_agent = u.client_user_agent;
    if (u.fbp) ud.fbp = u.fbp;
    if (u.fbc) ud.fbc = u.fbc;
    // Allow IP override (e.g. admin cancellation sends customer's original IP)
    const ip = u.client_ip_address || clientIp(req);
    if (ip) ud.client_ip_address = ip;

    // Strip undefined keys from custom_data
    const customData: Record<string, any> = {};
    Object.entries(payload.custom_data || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") customData[k] = v;
    });

    // Final validation for monetary events
    if (customData.value !== undefined) {
      const num = Number(customData.value);
      customData.value = isNaN(num) ? 0 : Number(num.toFixed(2));
    }
    if (customData.currency) {
      customData.currency = String(customData.currency).toUpperCase().slice(0, 3);
    } else if (customData.value !== undefined) {
      customData.currency = "BDT";
    }
    if (Array.isArray(customData.contents)) {
      customData.contents = customData.contents.map((c: any) => ({
        ...c,
        id: String(c.id ?? ""),
        item_price:
          c.item_price !== undefined && !isNaN(Number(c.item_price))
            ? Number(Number(c.item_price).toFixed(2))
            : undefined,
        quantity:
          c.quantity !== undefined && !isNaN(Number(c.quantity))
            ? Number(c.quantity)
            : 1,
      }));
    }

    const event = {
      event_name: payload.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: payload.event_id,
      event_source_url: payload.event_source_url,
      action_source: "website",
      user_data: ud,
      custom_data: customData,
    };

    const body: Record<string, any> = {
      data: [event],
      access_token: cfg.fb_pixel_access_token,
    };
    if (cfg.fb_pixel_test_event_code) body.test_event_code = cfg.fb_pixel_test_event_code;

    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${cfg.fb_pixel_id}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const fbJson = await fbRes.json();

    if (!fbRes.ok) {

      return new Response(JSON.stringify({ error: "Conversion API request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, fb: fbJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {

    return new Response(JSON.stringify({ error: "Integration request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}