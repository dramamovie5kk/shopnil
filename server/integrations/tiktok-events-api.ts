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

// Map Meta-style event names → TikTok standard events
const EVENT_MAP: Record<string, string> = {
  PageView: "Pageview",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  AddToWishlist: "AddToWishlist",
  InitiateCheckout: "InitiateCheckout",
  AddPaymentInfo: "AddPaymentInfo",
  Purchase: "CompletePayment",
  Lead: "SubmitForm",
  Contact: "Contact",
  CompleteRegistration: "CompleteRegistration",
  Search: "Search",
  CancelOrder: "CancelOrder",
};

interface TtPayload {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  event_source_referrer?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    external_id?: string;
    client_user_agent?: string;
    client_ip_address?: string;
    ttp?: string;
    ttclid?: string;
    locale?: string;
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
        "tiktok_pixel_id",
        "tiktok_pixel_access_token",
        "tiktok_pixel_test_event_code",
        "tiktok_pixel_enabled",
      ]);

    const cfg: Record<string, string> = {};
    rows?.forEach((r: {setting_key:string;setting_value:string|null}) => (cfg[r.setting_key] = r.setting_value || ""));

    if (cfg.tiktok_pixel_enabled !== "true" || !cfg.tiktok_pixel_id || !cfg.tiktok_pixel_access_token) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "TikTok pixel not configured or disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: TtPayload = await req.json();
    if (!payload?.event_name) {
      return new Response(JSON.stringify({ error: "event_name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const u = payload.user_data || {};
    const user: Record<string, any> = {};
    if (u.email) user.email = await sha256(u.email);
    if (u.phone) user.phone = await sha256(u.phone.replace(/\D/g, ""));
    if (u.first_name) user.first_name = await sha256(u.first_name);
    if (u.last_name) user.last_name = await sha256(u.last_name);
    if (u.city) user.city = await sha256(u.city);
    if (u.state) user.state = await sha256(u.state);
    if (u.country) user.country = await sha256(u.country);
    if (u.zip) user.zip_code = await sha256(u.zip);
    if (u.external_id) user.external_id = await sha256(String(u.external_id));
    if (u.client_user_agent) user.user_agent = u.client_user_agent;
    if (u.ttp) user.ttp = u.ttp;
    if (u.ttclid) user.ttclid = u.ttclid;
    if (u.locale) user.locale = u.locale;
    const ip = u.client_ip_address || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) user.ip = ip;

    // Build properties (TikTok schema)
    const cd = payload.custom_data || {};
    const properties: Record<string, any> = {};
    if (cd.currency) properties.currency = String(cd.currency).toUpperCase().slice(0, 3);
    if (cd.value !== undefined) {
      const n = Number(cd.value);
      properties.value = isNaN(n) ? 0 : Number(n.toFixed(2));
    }
    if (cd.content_type) properties.content_type = cd.content_type;
    if (cd.content_name) properties.content_name = cd.content_name;
    if (cd.content_category) properties.content_category = cd.content_category;
    if (cd.content_id) properties.content_id = String(cd.content_id);
    if (Array.isArray(cd.content_ids)) properties.content_ids = cd.content_ids.map((x: any) => String(x));
    if (cd.description) properties.description = String(cd.description);
    if (cd.brand) properties.brand = String(cd.brand);
    if (cd.order_id) properties.order_id = cd.order_id;
    if (cd.search_string) properties.query = cd.search_string;
    if (cd.query) properties.query = cd.query;
    if (cd.status) properties.status = cd.status;

    if (Array.isArray(cd.contents)) {
      properties.contents = cd.contents.map((c: any) => ({
        content_id: String(c.id ?? c.content_id ?? ""),
        content_name: c.item_name || c.content_name,
        content_category: c.item_category || c.content_category,
        brand: c.item_brand || c.brand,
        price:
          c.item_price !== undefined && !isNaN(Number(c.item_price))
            ? Number(Number(c.item_price).toFixed(2))
            : c.price !== undefined ? Number(Number(c.price).toFixed(2)) : undefined,
        quantity:
          c.quantity !== undefined && !isNaN(Number(c.quantity)) ? Number(c.quantity) : 1,
      }));
    }

    const ttEventName = EVENT_MAP[payload.event_name] || payload.event_name;

    const event: Record<string, any> = {
      event: ttEventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: payload.event_id,
      user,
      properties,
      page: {
        url: payload.event_source_url,
        referrer: payload.event_source_referrer || "",
      },
    };

    const body: Record<string, any> = {
      event_source: "web",
      event_source_id: cfg.tiktok_pixel_id,
      data: [event],
    };
    if (cfg.tiktok_pixel_test_event_code) body.test_event_code = cfg.tiktok_pixel_test_event_code;

    const ttRes = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": cfg.tiktok_pixel_access_token,
        },
        body: JSON.stringify(body),
      }
    );
    const ttJson = await ttRes.json<{code:number}>();

    if (!ttRes.ok || ttJson.code !== 0) {

      return new Response(JSON.stringify({ error: "TikTok Events API request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, tiktok: ttJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {

    return new Response(JSON.stringify({ error: "Integration request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}