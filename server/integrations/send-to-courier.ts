import { Env } from '../core';
import { serviceDatabase } from '../service';

const corsHeaders = { 'Cache-Control': 'no-store' };

interface OrderData {
  orderId: string;
  courier: "steadfast" | "pathao";
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  codAmount: number;
  note?: string;
}

interface CourierCredentials {
  steadfast_api_key?: string;
  steadfast_secret_key?: string;
  pathao_client_id?: string;
  pathao_client_secret?: string;
  pathao_username?: string;
  pathao_password?: string;
  pathao_store_id?: string;
}

export async function handle(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const database = serviceDatabase(env);

    const orderData: OrderData = await req.json();
    const { orderId, courier, recipientName, recipientPhone, recipientAddress, recipientCity, codAmount, note } = orderData;

    // Fetch courier credentials from site_settings
    const { data: settingsData, error: settingsError } = await database
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "steadfast_api_key",
        "steadfast_secret_key",
        "pathao_client_id",
        "pathao_client_secret",
        "pathao_username",
        "pathao_password",
        "pathao_store_id",
      ]);

    if (settingsError) {
      throw new Error(`Failed to fetch courier settings: ${settingsError.message}`);
    }

    const credentials: CourierCredentials = {};
    settingsData?.forEach((s: {setting_key:string;setting_value:string|null}) => {
      credentials[s.setting_key as keyof CourierCredentials] = s.setting_value || undefined;
    });

    let result: { consignmentId: string; trackingCode: string };

    if (courier === "steadfast") {
      result = await sendToSteadfast(credentials, {
        orderId,
        recipientName,
        recipientPhone,
        recipientAddress,
        codAmount,
        note,
      });
    } else if (courier === "pathao") {
      result = await sendToPathao(credentials, {
        orderId,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientCity,
        codAmount,
        note,
      });
    } else {
      throw new Error("Invalid courier type");
    }

    // Update order with courier info
    const { error: updateError } = await database
      .from("orders")
      .update({
        courier_id: courier,
        courier_consignment_id: result.consignmentId,
        courier_tracking_code: result.trackingCode,
        courier_sent_at: new Date().toISOString(),
        status: "shipped",
      })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Log the action
    await database.from("order_logs").insert({
      order_id: orderId,
      action: "courier_sent",
      new_status: "shipped",
      notes: `Sent to ${courier.toUpperCase()} - Tracking: ${result.trackingCode}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `অর্ডার ${courier.toUpperCase()}-এ পাঠানো হয়েছে`,
        trackingCode: result.trackingCode,
        consignmentId: result.consignmentId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function sendToSteadfast(
  credentials: CourierCredentials,
  data: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
    note?: string;
  }
) {
  const { steadfast_api_key, steadfast_secret_key } = credentials;

  if (!steadfast_api_key || !steadfast_secret_key) {
    throw new Error("Steadfast API credentials not configured");
  }

  const response = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": steadfast_api_key,
      "Secret-Key": steadfast_secret_key,
    },
    body: JSON.stringify({
      invoice: data.orderId.slice(0, 8).toUpperCase(),
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      recipient_address: data.recipientAddress,
      cod_amount: data.codAmount,
      note: data.note || "",
    }),
  });

  const result = await response.json<{status?:number;consignment?:{consignment_id:string|number;tracking_code:string};message?:string}>();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message || "Steadfast API error");
  }

  return {
    consignmentId: String(result.consignment?.consignment_id || ""),
    trackingCode: result.consignment?.tracking_code || "",
  };
}

async function sendToPathao(
  credentials: CourierCredentials,
  data: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientCity: string;
    codAmount: number;
    note?: string;
  }
) {
  const { pathao_client_id, pathao_client_secret, pathao_username, pathao_password, pathao_store_id } = credentials;

  if (!pathao_client_id || !pathao_client_secret || !pathao_username || !pathao_password) {
    throw new Error("Pathao API credentials not configured");
  }

  // First, get access token
  const tokenResponse = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/issue-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: pathao_client_id,
      client_secret: pathao_client_secret,
      username: pathao_username,
      password: pathao_password,
      grant_type: "password",
    }),
  });

  const tokenResult = await tokenResponse.json<{access_token?:string;message?:string}>();

  if (!tokenResponse.ok || !tokenResult.access_token) {
    throw new Error("Failed to get Pathao access token: " + (tokenResult.message || "Unknown error"));
  }

  const accessToken = tokenResult.access_token;

  // Determine city ID based on city name
  const cityId = data.recipientCity?.toLowerCase().includes("dhaka") ? 1 : 2;

  // Create order
  const orderResponse = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      store_id: pathao_store_id || "1",
      merchant_order_id: data.orderId.slice(0, 8).toUpperCase(),
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      recipient_address: data.recipientAddress,
      recipient_city: cityId,
      recipient_zone: 1,
      delivery_type: 48,
      item_type: 2,
      special_instruction: data.note || "",
      item_quantity: 1,
      item_weight: 0.5,
      amount_to_collect: data.codAmount,
      item_description: "Product delivery",
    }),
  });

  const orderResult = await orderResponse.json<{data?:{consignment_id:string};message?:string;errors?:unknown}>();

  if (!orderResponse.ok) {
    throw new Error("Pathao order creation failed: " + (orderResult.message || JSON.stringify(orderResult.errors) || "Unknown error"));
  }

  return {
    consignmentId: String(orderResult.data?.consignment_id || ""),
    trackingCode: orderResult.data?.consignment_id || "",
  };
}
