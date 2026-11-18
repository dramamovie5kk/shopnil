import { useCallback, useRef, useEffect } from "react";
import { api } from "@/integrations/cloudflare/client";
import {
  captureFbclid,
  getCookie as fbGetCookie,
  getOrCreateExternalId,
  getPersistedUser,
  persistUser,
  normalizePhoneE164,
  splitName,
  ensureFbp,
} from "@/lib/fbTracking";
import { captureTtclid, getTtclid, getTtp } from "@/lib/ttTracking";

interface ProductData {
  product_id?: string;
  product_name: string;
  price: number;
  original_price?: number | null;
  quantity: number;
  currency?: string;
  variation_name?: string;
  variation_id?: string;
  category?: string;
  brand?: string;
  image_url?: string;
  sku?: string;
  stock?: number | null;
  stock_status?: string;
}

interface CustomerData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface OrderData {
  order_id: string;
  total: number;
  shipping: number;
  subtotal?: number;
  tax?: number;
  discount_total?: number;
  coupon_code?: string;
  customer_phone?: string;
  customer_name?: string;
  customer_address?: string;
  customer_city?: string;
  payment_method?: string;
  payment_method_title?: string;
  items: ProductData[];
  customer?: CustomerData;
}

// Extend Window interface for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    ttq: any;
  }
}

// Currency to country mapping for Google Ads Remarketing
const currencyToCountry: Record<string, string> = {
  'USD': 'US', 'EUR': 'NL', 'BDT': 'BD', 'GBP': 'GB', 'CAD': 'CA', 'AUD': 'AU', 'JPY': 'JP',
  'INR': 'IN', 'CNY': 'CN', 'SEK': 'SE', 'NOK': 'NO', 'CHF': 'CH', 'SGD': 'SG', 'BRL': 'BR',
  'ZAR': 'ZA', 'RUB': 'RU', 'AED': 'AE', 'KRW': 'KR', 'MXN': 'MX', 'TRY': 'TR', 'MYR': 'MY',
  'NZD': 'NZ', 'HKD': 'HK', 'DKK': 'DK', 'PLN': 'PL', 'THB': 'TH', 'EGP': 'EG', 'ILS': 'IL',
  'IDR': 'ID', 'CZK': 'CZ', 'HUF': 'HU', 'ARS': 'AR', 'CLP': 'CL', 'PHP': 'PH', 'COP': 'CO',
  'RSD': 'RS', 'QAR': 'QA', 'BHD': 'BH', 'KWD': 'KW', 'OMR': 'OM', 'PKR': 'PK', 'SAR': 'SA'
};

const generateEventId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const getUnixTimestamp = () => Math.round(Date.now() / 1000);

// Common page/device metadata for all events
const getCommonParams = () => ({
  page_location: window.location.href,
  page_path: window.location.pathname,
  page_hostname: window.location.hostname,
  page_referrer: document.referrer || '',
  user_agent: navigator.userAgent,
  screen_resolution: `${window.screen.width}x${window.screen.height}`,
  viewport_size: `${window.innerWidth}x${window.innerHeight}`,
  language: navigator.language,
  timestamp: new Date().toISOString(),
  timestamp_unix: getUnixTimestamp(),
});

// Build customer params (WooCommerce-style)
const buildCustomerParams = (customer?: CustomerData) => {
  if (!customer) return {};
  return {
    customerFirstName: customer.firstName || '',
    customerLastName: customer.lastName || '',
    customerBillingFirstName: customer.firstName || '',
    customerBillingLastName: customer.lastName || '',
    customerBillingCompany: '',
    customerBillingAddress1: customer.address || '',
    customerBillingAddress2: '',
    customerBillingCity: customer.city || '',
    customerBillingState: customer.state || '',
    customerBillingPostcode: customer.postcode || '',
    customerBillingCountry: customer.country || 'BD',
    customerBillingEmail: customer.email || '',
    customerBillingEmailHash: '',
    customerBillingPhone: customer.phone || '',
    customerShippingFirstName: customer.firstName || '',
    customerShippingLastName: customer.lastName || '',
    customerShippingCompany: '',
    customerShippingAddress1: customer.address || '',
    customerShippingAddress2: '',
    customerShippingCity: customer.city || '',
    customerShippingState: customer.state || '',
    customerShippingPostcode: customer.postcode || '',
    customerShippingCountry: customer.country || 'BD',
  };
};

// Shared across every hook instance so the same event never fires twice on a page
const sharedFiredEvents = new Set<string>();

export const usePixelTracking = () => {
  const firedEvents = useRef<Set<string>>(sharedFiredEvents);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    // Ensure fbclid is captured and external_id exists for EMQ
    captureFbclid();
    captureTtclid();
    getOrCreateExternalId();
  }, []);

  const getCountryCode = useCallback((currency: string) => {
    return currencyToCountry[currency] || 'BD';
  }, []);

  const pushToDataLayer = useCallback((event: string, data: Record<string, any>) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event, ...data });
    console.log(`[Tracking] DataLayer Event: ${event}`, data);
  }, []);

  // Direct Meta Pixel + Conversion API firing.
  // Only runs if admin enabled the direct pixel option in Tracking settings.
  // (When using GTM, leave the option OFF — GTM will fire pixels via DataLayer.)
  const firePixelEvent = useCallback((eventName: string, data: Record<string, any>) => {
    const cfg = (window as any).__fbPixelConfig;
    if (!cfg?.enabled || !cfg?.id) return;

    // Pull any customer/user data the caller attached as `_user`
    const userInput: any = data?._user || {};
    // Internal control flags (stripped before sending to Meta)
    const capiOnly: boolean = !!data?._capi_only;
    const isCustom: boolean = !!data?._custom;
    const overrideFbp: string | undefined = data?._fbp;
    const overrideFbc: string | undefined = data?._fbc;
    const overrideUa: string | undefined = data?._client_user_agent;
    const overrideSourceUrl: string | undefined = data?._source_url;
    const overrideIp: string | undefined = data?._client_ip_address;
    const { event_id, _user, _capi_only, _custom, _fbp, _fbc, _client_user_agent, _source_url, _client_ip_address, ...rest } =
      data || {};

    // Merge with persisted user (prior checkouts/orders) for max EMQ
    const persisted = getPersistedUser();
    const externalId = getOrCreateExternalId();
    const nameParts = splitName(
      userInput.firstName || userInput.first_name || rest.customer_name || persisted.firstName,
      userInput.lastName || userInput.last_name || persisted.lastName,
    );
    const mergedUser = {
      email: userInput.email || persisted.email,
      phone: normalizePhoneE164(userInput.phone || rest.customer_phone || persisted.phone),
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      city: userInput.city || rest.customer_city || persisted.city,
      state: userInput.state || persisted.state,
      postcode: userInput.postcode || userInput.zip || persisted.postcode,
      country: userInput.country || persisted.country || "BD",
      dateOfBirth: userInput.dateOfBirth || userInput.db || persisted.dateOfBirth,
      gender: userInput.gender || userInput.ge || persisted.gender,
      external_id: userInput.external_id || userInput.user_id || externalId,
    };

    // Normalize currency (uppercase 3-letter ISO) and value (Number)
    const normCurrency = String(rest.currency || "BDT").toUpperCase().slice(0, 3);
    const normValue =
      rest.value !== undefined && rest.value !== null && !isNaN(Number(rest.value))
        ? Number(Number(rest.value).toFixed(2))
        : undefined;

    // Normalize contents — every item must have valid id, item_price (Number) and quantity (Number)
    const normContents = Array.isArray(rest.contents)
      ? rest.contents.map((c: any) => ({
          ...c,
          id: String(c.id ?? c.item_id ?? ""),
          item_price:
            c.item_price !== undefined && !isNaN(Number(c.item_price))
              ? Number(Number(c.item_price).toFixed(2))
              : undefined,
          quantity:
            c.quantity !== undefined && !isNaN(Number(c.quantity))
              ? Number(c.quantity)
              : 1,
        }))
      : undefined;

    // Build full FB-standard custom_data (forward EVERY ecommerce param Meta accepts)
    const customData: Record<string, any> = {
      currency: normCurrency,
      value: normValue,
      content_type: rest.content_type || "product",
      content_ids: Array.isArray(rest.content_ids)
        ? rest.content_ids.map((x: any) => String(x))
        : rest.content_ids,
      content_name: rest.content_name,
      content_category: rest.content_category,
      contents: normContents,
      num_items:
        rest.num_items !== undefined && !isNaN(Number(rest.num_items))
          ? Number(rest.num_items)
          : undefined,
      order_id: rest.order_id,
      search_string: rest.search_string,
      status: rest.status,
      predicted_ltv:
        rest.predicted_ltv !== undefined && !isNaN(Number(rest.predicted_ltv))
          ? Number(Number(rest.predicted_ltv).toFixed(2))
          : undefined,
      delivery_category: rest.delivery_category || "home_delivery",
    };
    Object.keys(customData).forEach((k) => customData[k] === undefined && delete customData[k]);

    // Browser-side Pixel — forward full custom_data with eventID for dedup
    // Skip browser fire when caller asks for CAPI-only (e.g. admin-side cancel —
    // the admin's session is not the customer's, so a browser fbq from admin
    // would taint EMQ).
    if (!capiOnly && typeof (window as any).fbq === "function") {
      try {
        (window as any).fbq(
          isCustom ? "trackCustom" : "track",
          eventName,
          isCustom ? { ...rest, ...customData } : customData,
          event_id ? { eventID: event_id } : undefined
        );
      } catch (e) {
        console.warn("[Pixel] fbq error", e);
      }
    }

    // Server-side Conversions API (deduped by event_id)
    api.functions
      .invoke("fb-conversions-api", {
        body: {
          event_name: eventName,
          event_id,
          event_source_url: overrideSourceUrl || window.location.href,
          user_data: {
            email: mergedUser.email,
            phone: mergedUser.phone,
            first_name: mergedUser.firstName,
            last_name: mergedUser.lastName,
            city: mergedUser.city,
            state: mergedUser.state,
            zip: mergedUser.postcode,
            country: mergedUser.country,
            date_of_birth: mergedUser.dateOfBirth,
            gender: mergedUser.gender,
            external_id: mergedUser.external_id,
            client_user_agent: overrideUa || navigator.userAgent,
            client_ip_address: overrideIp || undefined,
            fbp: overrideFbp || ensureFbp(),
            fbc: overrideFbc || fbGetCookie("_fbc"),
          },
          custom_data: isCustom ? { ...rest, ...customData } : customData,
        },
      })
      .catch((e) => console.warn("[CAPI] invoke failed", e));
  }, []);

  // Direct TikTok Pixel + Events API firing.
  // Only runs if admin enabled the direct TikTok pixel option in Tracking settings.
  // (When using GTM, leave the option OFF — GTM will fire pixels via DataLayer.)
  const fireTikTokEvent = useCallback((eventName: string, data: Record<string, any>) => {
    const cfg = (window as any).__ttPixelConfig;
    if (!cfg?.enabled || !cfg?.id) return;

    const userInput: any = data?._user || {};
    const capiOnly: boolean = !!data?._capi_only;
    const overrideTtp: string | undefined = data?._ttp;
    const overrideTtclid: string | undefined = data?._ttclid;
    const overrideUa: string | undefined = data?._client_user_agent;
    const overrideSourceUrl: string | undefined = data?._source_url;
    const overrideIp: string | undefined = data?._client_ip_address;
    const overrideReferrer: string | undefined = data?._referrer;
    const {
      event_id, _user, _capi_only, _ttp, _ttclid, _fbp, _fbc,
      _client_user_agent, _source_url, _client_ip_address, _referrer, ...rest
    } = data || {};

    const persisted = getPersistedUser();
    const externalId = getOrCreateExternalId();
    const mergedUser = {
      email: userInput.email || persisted.email,
      phone: userInput.phone || rest.customer_phone || persisted.phone,
      firstName: userInput.firstName || userInput.first_name || persisted.firstName,
      lastName: userInput.lastName || userInput.last_name || persisted.lastName,
      city: userInput.city || rest.customer_city || persisted.city,
      state: userInput.state || persisted.state,
      postcode: userInput.postcode || userInput.zip || persisted.postcode,
      country: userInput.country || persisted.country || "BD",
      external_id: userInput.external_id || userInput.user_id || externalId,
    };

    const normCurrency = String(rest.currency || "BDT").toUpperCase().slice(0, 3);
    const normValue =
      rest.value !== undefined && rest.value !== null && !isNaN(Number(rest.value))
        ? Number(Number(rest.value).toFixed(2))
        : undefined;

    // Normalize contents for TikTok schema
    const normContents = Array.isArray(rest.contents)
      ? rest.contents.map((c: any) => ({
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
        }))
      : undefined;

    const customData: Record<string, any> = {
      currency: normCurrency,
      value: normValue,
      content_type: rest.content_type || "product",
      content_id: rest.content_id,
      content_ids: Array.isArray(rest.content_ids)
        ? rest.content_ids.map((x: any) => String(x))
        : undefined,
      content_name: rest.content_name,
      content_category: rest.content_category,
      description: rest.description,
      brand: rest.brand,
      contents: normContents,
      order_id: rest.order_id,
      search_string: rest.search_string,
      query: rest.query,
      status: rest.status,
    };
    Object.keys(customData).forEach((k) => customData[k] === undefined && delete customData[k]);

    // Browser-side TikTok Pixel fire (with eventID for dedup)
    if (!capiOnly && (window as any).ttq?.track) {
      try {
        const ttProps: Record<string, any> = { ...customData };
        (window as any).ttq.track(
          eventName,
          ttProps,
          event_id ? { event_id } : undefined
        );
      } catch (e) {
        console.warn("[TikTok Pixel] ttq error", e);
      }
    }

    // Server-side Events API (deduped by event_id)
    api.functions
      .invoke("tiktok-events-api", {
        body: {
          event_name: eventName,
          event_id,
          event_source_url: overrideSourceUrl || window.location.href,
          event_source_referrer: overrideReferrer || (typeof document !== "undefined" ? document.referrer : ""),
          user_data: {
            email: mergedUser.email,
            phone: mergedUser.phone,
            first_name: mergedUser.firstName,
            last_name: mergedUser.lastName,
            city: mergedUser.city,
            state: mergedUser.state,
            zip: mergedUser.postcode,
            country: mergedUser.country,
            external_id: mergedUser.external_id,
            client_user_agent: overrideUa || navigator.userAgent,
            client_ip_address: overrideIp || undefined,
            ttp: overrideTtp || getTtp(),
            ttclid: overrideTtclid || getTtclid(),
            locale: typeof navigator !== "undefined" ? navigator.language : undefined,
          },
          custom_data: customData,
        },
      })
      .catch((e) => console.warn("[TikTok Events API] invoke failed", e));
  }, []);

  // Build comprehensive GA4 + WooCommerce-style item
  const buildGA4Item = useCallback((product: ProductData, index: number = 0) => ({
    id: product.product_id || '',
    item_id: product.product_id || '',
    item_name: product.product_name,
    item_brand: product.brand || '',
    item_category: product.category || 'Uncategorized',
    item_variant: product.variation_name || '',
    price: product.price,
    quantity: product.quantity,
    index: index,
    discount: product.original_price ? (product.original_price - product.price) : 0,
    currency: product.currency || 'BDT',
    sku: product.sku || product.product_id || '',
    stocklevel: product.stock ?? null,
    stockstatus: product.stock_status || (product.stock && product.stock > 0 ? 'instock' : 'outofstock'),
    google_business_vertical: 'retail',
  }), []);

  const buildFBContents = useCallback((items: ProductData[]) => {
    return items.map(item => ({
      id: item.product_id || item.product_name,
      item_name: item.product_name,
      item_category: item.category || 'Uncategorized',
      item_brand: item.brand || '',
      item_variant: item.variation_name || '',
      item_price: item.price,
      quantity: item.quantity,
      delivery_category: 'home_delivery',
    }));
  }, []);

  const buildTikTokContents = useCallback((items: ProductData[]) => {
    return items.map(item => ({
      content_id: item.product_id || item.product_name,
      content_name: item.product_name,
      content_category: item.category || 'Uncategorized',
      brand: item.brand || '',
      price: item.price,
      quantity: item.quantity,
    }));
  }, []);

  const buildGAdsItems = useCallback((items: ProductData[], currency: string = 'BDT') => {
    const countryCode = getCountryCode(currency);
    return items.map(item => ({
      id: `shopify_${countryCode}_${item.product_id || ''}_${item.variation_id || ''}`,
      google_business_vertical: 'retail',
    }));
  }, [getCountryCode]);

  // Build cartContent object (WooCommerce-compatible)
  const buildCartContent = useCallback((items: ProductData[], subtotal: number, total: number, coupon?: string, discountTotal?: number) => ({
    totals: {
      applied_coupons: coupon ? [coupon] : [],
      discount_total: discountTotal || 0,
      subtotal: subtotal,
      total: total,
    },
    items: items.map(item => ({
      item_id: item.product_id || '',
      item_name: item.product_name,
      sku: item.sku || item.product_id || '',
      price: item.price,
      stocklevel: item.stock ?? null,
      stockstatus: item.stock_status || (item.stock && item.stock > 0 ? 'instock' : 'outofstock'),
      google_business_vertical: 'retail',
      item_category: item.category || 'Uncategorized',
      id: item.product_id || '',
      quantity: item.quantity,
    })),
  }), []);

  // Track AddToCart event
  const trackAddToCart = useCallback((product: ProductData, salesPageTitle: string) => {
    const eventKey = `add_to_cart_${product.product_id || salesPageTitle}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();
    const currency = product.currency || 'BDT';
    const value = product.price * product.quantity;
    const contentIds = [product.product_id || salesPageTitle];

    pushToDataLayer("add_to_cart", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: 'product',
      page_title: salesPageTitle,
      ecommerce: {
        currency: currency,
        value: value,
        items: [buildGA4Item(product, 0)],
      },
      content_type: 'product',
      content_ids: contentIds,
      content_name: product.product_name,
      content_category: product.category || 'Uncategorized',
      num_items: product.quantity,
      google_ads_items: buildGAdsItems([product], currency),
      cartContent: buildCartContent([product], value, value),
    });

    firePixelEvent("AddToCart", {
      event_id: eventId,
      currency: currency,
      value: value,
      content_type: "product",
      content_ids: contentIds,
      content_name: product.product_name,
      content_category: product.category || 'Uncategorized',
      contents: buildFBContents([product]),
      num_items: product.quantity,
      delivery_category: 'home_delivery',
    });

    fireTikTokEvent("AddToCart", {
      value: value,
      currency: currency,
      content_name: product.product_name,
      content_id: product.product_id || salesPageTitle,
      content_ids: contentIds,
      content_category: product.category || 'Uncategorized',
      description: product.product_name,
      brand: product.brand,
      content_type: 'product',
      quantity: product.quantity,
      price: product.price,
      contents: buildTikTokContents([product]),
    });
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent, buildGA4Item, buildFBContents, buildTikTokContents, buildGAdsItems, buildCartContent]);

  // Track InitiateCheckout / BeginCheckout event
  const trackInitiateCheckout = useCallback((
    items: ProductData[],
    salesPageTitle: string,
    options?: {
      subtotal?: number;
      total?: number;
      shipping?: number;
      coupon?: string;
      discountTotal?: number;
      customer?: CustomerData;
    }
  ) => {
    const eventKey = `initiate_checkout_${salesPageTitle}_${items.map(i => i.product_id).join(',')}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();
    const currency = items[0]?.currency || 'BDT';
    const subtotal = options?.subtotal || items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = options?.total || subtotal + (options?.shipping || 0) - (options?.discountTotal || 0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const contentIds = items.map(item => item.product_id || salesPageTitle);

    // Persist customer for future events → boosts EMQ
    if (options?.customer) persistUser(options.customer);

    pushToDataLayer("begin_checkout", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: 'checkout',
      page_title: salesPageTitle,
      ecommerce: {
        currency: currency,
        value: total,
        items: items.map((item, index) => buildGA4Item(item, index)),
      },
      content_type: 'product',
      content_ids: contentIds,
      num_items: totalQuantity,
      google_ads_items: buildGAdsItems(items, currency),
      ...buildCustomerParams(options?.customer),
      cartContent: buildCartContent(items, subtotal, total, options?.coupon, options?.discountTotal),
    });

    firePixelEvent("InitiateCheckout", {
      event_id: eventId,
      currency: currency,
      value: total,
      content_type: "product",
      content_ids: contentIds,
      contents: buildFBContents(items),
      num_items: totalQuantity,
      content_name: items.map(i => i.product_name).join(', '),
      content_category: items[0]?.category || 'Uncategorized',
      delivery_category: 'home_delivery',
      _user: options?.customer,
    });

    fireTikTokEvent("InitiateCheckout", {
      value: total,
      currency: currency,
      content_type: 'product',
      content_ids: contentIds,
      content_name: items.map(i => i.product_name).join(', '),
      content_category: items[0]?.category || 'Uncategorized',
      description: items.map(i => i.product_name).join(', '),
      contents: buildTikTokContents(items),
      quantity: totalQuantity,
      _user: options?.customer,
    });
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent, buildGA4Item, buildFBContents, buildTikTokContents, buildGAdsItems, buildCartContent]);

  // Track Purchase event
  const trackPurchase = useCallback((order: OrderData, salesPageTitle: string) => {
    const eventKey = `purchase_${order.order_id}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();
    const currency = 'BDT';
    const contentIds = order.items.map(item => item.product_id || salesPageTitle);
    const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = order.subtotal || order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Persist customer profile (max EMQ for future visits)
    persistUser({
      email: order.customer?.email,
      phone: order.customer?.phone || order.customer_phone,
      firstName: order.customer?.firstName || order.customer_name,
      lastName: order.customer?.lastName,
      city: order.customer?.city || order.customer_city,
      state: order.customer?.state,
      postcode: order.customer?.postcode,
      country: order.customer?.country || "BD",
    });

    pushToDataLayer("purchase", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: 'order-received',
      page_title: salesPageTitle,
      ecommerce: {
        transaction_id: order.order_id,
        currency: currency,
        value: order.total,
        shipping: order.shipping,
        tax: order.tax || 0,
        items: order.items.map((item, index) => buildGA4Item(item, index)),
        affiliation: '',
        coupon: order.coupon_code || '',
      },
      new_customer: true,
      content_type: 'product',
      content_ids: contentIds,
      num_items: totalQuantity,
      customer_phone: order.customer_phone || '',
      customer_city: order.customer_city || '',
      payment_method: order.payment_method || 'cod',
      google_ads_items: buildGAdsItems(order.items, currency),
      ...buildCustomerParams(order.customer),
      cartContent: buildCartContent(order.items, subtotal, order.total, order.coupon_code, order.discount_total),
      orderData: {
        attributes: {
          date: new Date().toISOString(),
          order_number: order.order_id,
          order_key: order.order_id,
          payment_method: order.payment_method || 'cod',
          payment_method_title: order.payment_method_title || (order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.payment_method || ''),
          shipping_method: order.customer_city === 'ঢাকার ভিতরে' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে',
          status: 'processing',
          coupons: order.coupon_code || '',
        },
        totals: {
          currency: currency,
          discount_total: order.discount_total || 0,
          discount_tax: 0,
          shipping_total: order.shipping,
          shipping_tax: 0,
          cart_tax: 0,
          total: order.total,
          total_tax: 0,
          total_discount: order.discount_total || 0,
          subtotal: subtotal,
          tax_totals: [],
        },
        customer: {
          billing: {
            first_name: order.customer_name || order.customer?.firstName || '',
            last_name: order.customer?.lastName || '',
            company: '',
            address_1: order.customer_address || order.customer?.address || '',
            address_2: '',
            city: order.customer_city || order.customer?.city || '',
            state: order.customer?.state || '',
            postcode: order.customer?.postcode || '',
            country: order.customer?.country || 'BD',
            email: order.customer?.email || '',
            phone: order.customer_phone || order.customer?.phone || '',
          },
          shipping: {
            first_name: order.customer_name || order.customer?.firstName || '',
            last_name: order.customer?.lastName || '',
            company: '',
            address_1: order.customer_address || order.customer?.address || '',
            address_2: '',
            city: order.customer_city || order.customer?.city || '',
            state: order.customer?.state || '',
            postcode: order.customer?.postcode || '',
            country: order.customer?.country || 'BD',
          },
        },
        items: order.items.map(item => ({
          item_id: item.product_id || '',
          item_name: item.product_name,
          sku: item.sku || item.product_id || '',
          price: item.price,
          stocklevel: item.stock ?? null,
          stockstatus: item.stock_status || 'instock',
          google_business_vertical: 'retail',
          item_category: item.category || 'Uncategorized',
          id: item.product_id || '',
          quantity: item.quantity,
        })),
      },
    });

    firePixelEvent("Purchase", {
      event_id: eventId,
      currency: currency,
      value: Number(order.total) || 0,
      content_type: 'product',
      content_ids: contentIds,
      contents: buildFBContents(order.items),
      num_items: totalQuantity,
      order_id: order.order_id,
      content_name: order.items.map(i => i.product_name).join(', '),
      content_category: order.items[0]?.category || 'Uncategorized',
      customer_phone: order.customer_phone,
      customer_city: order.customer_city,
      delivery_category: 'home_delivery',
      status: 'completed',
      predicted_ltv: Number(order.total) || 0,
      _user: {
        ...(order.customer || {}),
        firstName: order.customer?.firstName || order.customer_name,
        phone: order.customer?.phone || order.customer_phone,
        city: order.customer?.city || order.customer_city,
        address: order.customer?.address || order.customer_address,
      },
    });

    fireTikTokEvent("CompletePayment", {
      value: order.total,
      currency: currency,
      content_type: 'product',
      content_ids: contentIds,
      content_name: order.items.map(i => i.product_name).join(', '),
      content_category: order.items[0]?.category || 'Uncategorized',
      description: order.items.map(i => i.product_name).join(', '),
      contents: buildTikTokContents(order.items),
      quantity: totalQuantity,
      order_id: order.order_id,
      _user: {
        ...(order.customer || {}),
        firstName: order.customer?.firstName || order.customer_name,
        phone: order.customer?.phone || order.customer_phone,
        city: order.customer?.city || order.customer_city,
      },
    });
    return eventId;
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent, buildGA4Item, buildFBContents, buildTikTokContents, buildGAdsItems, buildCartContent]);

  // Track Order Cancellation (pushes purchase with value:0 and same event_id)
  const trackOrderCancelled = useCallback((
    orderId: string,
    purchaseEventId: string,
    items: { product_id?: string; product_name: string; price: number; quantity: number }[],
    extra?: {
      customer?: { name?: string; phone?: string; email?: string; city?: string; country?: string };
      tracking?: { fbp?: string | null; fbc?: string | null; ttp?: string | null; ttclid?: string | null; user_agent?: string | null; external_id?: string | null; source_url?: string | null; customer_ip?: string | null };
    }
  ) => {
    console.log("[Tracking] Cancel - using purchase_event_id:", purchaseEventId, "for order:", orderId);
    pushToDataLayer("purchase", {
      event_id: purchaseEventId,
      order_cancelled: true,
      ecommerce: {
        transaction_id: orderId,
        currency: "BDT",
        value: 0,
        shipping: 0,
        tax: 0,
        items: items.map((item, index) => ({
          item_id: item.product_id || '',
          item_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          index,
          currency: 'BDT',
        })),
      },
    });

    // Also fire to Meta CAPI as a custom "CancelOrder" event so Meta sees
    // the cancellation directly (independent of GTM).
    const contentIds = items.map((i) => i.product_id || "");
    const contents = items.map((i) => ({
      id: String(i.product_id || ""),
      item_name: i.product_name,
      item_price: Number(Number(i.price).toFixed(2)),
      quantity: Number(i.quantity) || 1,
      delivery_category: "home_delivery",
    }));
    const totalQty = items.reduce((a, i) => a + (Number(i.quantity) || 0), 0);

    const nameParts = (extra?.customer?.name || "").trim().split(/\s+/);
    firePixelEvent("CancelOrder", {
      event_id: `cancel_${purchaseEventId}`,
      order_id: orderId,
      original_event_id: purchaseEventId,
      currency: "BDT",
      value: 0,
      content_type: "product",
      content_ids: contentIds,
      contents,
      num_items: totalQty,
      status: "cancelled",
      // Force CAPI-only — admin's browser session is not the customer's,
      // so a browser-side fbq fire from admin would hurt match quality.
      _capi_only: true,
      _fbp: extra?.tracking?.fbp || undefined,
      _fbc: extra?.tracking?.fbc || undefined,
      _client_user_agent: extra?.tracking?.user_agent || undefined,
      _source_url: extra?.tracking?.source_url || undefined,
      _client_ip_address: extra?.tracking?.customer_ip || undefined,
      _user: {
        phone: extra?.customer?.phone,
        email: extra?.customer?.email,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || undefined,
        city: extra?.customer?.city,
        country: extra?.customer?.country || "BD",
        external_id: extra?.tracking?.external_id || undefined,
      },
    });

    // NOTE: TikTok cancellation tracking intentionally disabled per requirement.
  }, [pushToDataLayer, firePixelEvent]);

  // Track view_item event
  const trackViewItem = useCallback((product: ProductData, pageName: string) => {
    const eventKey = `view_item_${product.product_id || pageName}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();
    const currency = product.currency || 'BDT';
    const value = product.price;
    const contentIds = [product.product_id || pageName];

    pushToDataLayer("view_item", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: 'product',
      page_title: pageName,
      ecommerce: {
        currency: currency,
        value: value,
        items: [buildGA4Item(product, 0)],
      },
      content_type: 'product',
      content_ids: contentIds,
      content_name: product.product_name,
      content_category: product.category || 'Uncategorized',
      google_ads_items: buildGAdsItems([product], currency),
    });

    firePixelEvent("ViewContent", {
      event_id: eventId,
      currency: currency,
      value: value,
      content_type: 'product',
      content_ids: contentIds,
      content_name: product.product_name,
      content_category: product.category || 'Uncategorized',
      contents: buildFBContents([product]),
    });

    fireTikTokEvent("ViewContent", {
      value: value,
      currency: currency,
      content_name: product.product_name,
      content_id: product.product_id || pageName,
      content_ids: [product.product_id || pageName],
      content_category: product.category || 'Uncategorized',
      description: product.product_name,
      brand: product.brand,
      content_type: 'product',
      contents: buildTikTokContents([product]),
    });
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent, buildGA4Item, buildFBContents, buildTikTokContents, buildGAdsItems]);

  // Track PageView
  const trackPageView = useCallback((pageName: string, productData?: ProductData) => {
    const eventKey = `page_view_${pageName}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();
    const currency = productData?.currency || 'BDT';
    const pageType = window.location.pathname === '/' ? 'frontpage' : 'page';

    pushToDataLayer("page_view", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: pageType,
      page_title: pageName,
      ...(productData && {
        ecommerce: {
          currency: currency,
          value: productData.price,
          items: [buildGA4Item(productData, 0)],
        },
        content_type: 'product',
        content_ids: [productData.product_id || pageName],
        content_name: productData.product_name,
        content_category: productData.category || 'Uncategorized',
        value: productData.price,
      }),
    });

    if (productData) {
      firePixelEvent("ViewContent", {
        event_id: eventId,
        currency: currency,
        value: productData.price,
        content_type: 'product',
        content_ids: [productData.product_id || pageName],
        content_name: productData.product_name,
        content_category: productData.category || 'Uncategorized',
        contents: buildFBContents([productData]),
        num_items: 1,
        delivery_category: 'home_delivery',
      });

      fireTikTokEvent("ViewContent", {
        value: productData.price,
        currency: currency,
        content_name: productData.product_name,
        content_id: productData.product_id || pageName,
        content_type: 'product',
        content_ids: [productData.product_id || pageName],
        content_category: productData.category || 'Uncategorized',
        description: productData.product_name,
        contents: buildTikTokContents([productData]),
      });
    }
    // Meta PageView (browser + server) is fired by FBPixelLoader on every route change

    // TikTok PageView — always fire on every page (browser ttq.page + Events API)
    fireTikTokEvent("PageView", { event_id: eventId });
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent, buildGA4Item, buildFBContents, buildTikTokContents]);

  // Track Contact/Lead event
  const trackContact = useCallback((phone: string, salesPageTitle: string) => {
    const eventKey = `contact_${phone}_${salesPageTitle}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    const eventId = generateEventId();

    pushToDataLayer("generate_lead", {
      event_id: eventId,
      ...getCommonParams(),
      pageType: 'contact',
      page_title: salesPageTitle,
      contact_method: 'phone',
      contact_phone: phone,
    });

    firePixelEvent("Contact", { event_id: eventId, contact_method: 'phone' });
    fireTikTokEvent("Contact", { contact_method: 'phone' });
  }, [pushToDataLayer, firePixelEvent, fireTikTokEvent]);

  // Track form submission started
  const trackFormStart = useCallback((salesPageTitle: string) => {
    const eventKey = `form_start_${salesPageTitle}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    pushToDataLayer("form_start", {
      event_id: generateEventId(),
      ...getCommonParams(),
      pageType: 'checkout',
      page_title: salesPageTitle,
      form_name: 'checkout_form',
    });
  }, [pushToDataLayer]);

  // Track scroll depth
  const trackScrollDepth = useCallback((percentage: number, salesPageTitle: string) => {
    const eventKey = `scroll_${percentage}_${salesPageTitle}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);

    pushToDataLayer("scroll", {
      event_id: generateEventId(),
      ...getCommonParams(),
      page_title: salesPageTitle,
      percent_scrolled: percentage,
    });
  }, [pushToDataLayer]);

  // Engagement events (Scroll 50/90, time on page) — browser Pixel + Conversions API with shared event_id
  const trackEngagement = useCallback((eventName: string, salesPageTitle: string, params: Record<string, any> = {}) => {
    const eventKey = `engagement_${eventName}_${window.location.pathname}`;
    if (firedEvents.current.has(eventKey)) return;
    firedEvents.current.add(eventKey);
    const eventId = generateEventId();
    pushToDataLayer(eventName, { event_id: eventId, ...getCommonParams(), page_title: salesPageTitle, ...params });
    firePixelEvent(eventName, { event_id: eventId, _custom: true, content_name: salesPageTitle, ...params });
  }, [pushToDataLayer, firePixelEvent]);

  const resetFiredEvents = useCallback(() => {
    firedEvents.current.clear();
  }, []);

  return {
    trackEngagement,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackOrderCancelled,
    trackViewItem,
    trackPageView,
    trackContact,
    trackFormStart,
    trackScrollDepth,
    resetFiredEvents,
    pushToDataLayer,
  };
};
