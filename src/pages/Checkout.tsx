import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, ArrowLeft, AlertCircle, MapPin, Truck, Wallet, CreditCard, Minus, Plus, Check, Phone, X, ShoppingBag, Copy, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DuplicateOrderBlockAlert from "@/components/checkout/DuplicateOrderBlockAlert";
import CouponField from "@/components/checkout/CouponField";

import { useCart, cartItemPrice, cartItemVariationLabel, cartItemKey } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDuplicateOrderBlock } from "@/hooks/useDuplicateOrderBlock";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";

import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { usePixelTracking } from "@/hooks/usePixelTracking";
import { useOrderSource } from "@/hooks/useOrderSource";
import { cn } from "@/lib/utils";

const CHECKOUT_STORAGE_KEY = "checkout_form_data";

// Bangladeshi phone number validation
const validateBDPhoneNumber = (phone: string): { isValid: boolean; message: string } => {
  const filteredPhone = phone.replace(/\D/g, "");
  const length = filteredPhone.length;

  if (length === 0) {
    return { isValid: false, message: "" };
  }

  if (length < 10) {
    return { isValid: false, message: "ফোন নম্বর অসম্পূর্ণ" };
  }

  const valid11DigitPrefixes = ["017", "013", "019", "014", "018", "015", "016"];
  const valid13DigitPrefixes = ["88017", "88013", "88019", "88015", "88014", "88018", "88016"];
  
  if (length === 11) {
    if (filteredPhone.startsWith("09")) {
      return { isValid: true, message: "✓ সঠিক নম্বর" };
    }
    const hasValidPrefix = valid11DigitPrefixes.some(prefix => filteredPhone.startsWith(prefix));
    if (hasValidPrefix) {
      return { isValid: true, message: "✓ সঠিক নম্বর" };
    }
    return { isValid: false, message: "অবৈধ অপারেটর কোড" };
  }

  if (length === 13) {
    if (filteredPhone.startsWith("8809")) {
      return { isValid: true, message: "✓ সঠিক নম্বর" };
    }
    const hasValidPrefix = valid13DigitPrefixes.some(prefix => filteredPhone.startsWith(prefix));
    if (hasValidPrefix) {
      return { isValid: true, message: "✓ সঠিক নম্বর" };
    }
    return { isValid: false, message: "অবৈধ অপারেটর কোড" };
  }

  if (length === 10) {
    const withZero = "0" + filteredPhone;
    const hasValidPrefix = valid11DigitPrefixes.some(prefix => withZero.startsWith(prefix));
    if (hasValidPrefix || withZero.startsWith("09")) {
      return { isValid: false, message: "শুরুতে 0 যোগ করুন" };
    }
  }

  if (length === 12) {
    const with88 = "8" + filteredPhone;
    const hasValidPrefix = valid13DigitPrefixes.some(prefix => with88.startsWith(prefix));
    if (hasValidPrefix || with88.startsWith("8809")) {
      return { isValid: false, message: "দেশ কোডে 88 ব্যবহার করুন" };
    }
  }

  if (length > 13) {
    return { isValid: false, message: "নম্বর অনেক বড়" };
  }

  return { isValid: false, message: "অবৈধ ফোন নম্বর" };
};

const normalizePhoneNumber = (phone: string): string => {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("88")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length === 10) {
    digits = "0" + digits;
  }
  return digits;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { checkBlockStatus, markOrderPlaced, getUserIP } = useDuplicateOrderBlock();
  const { getSetting } = useSiteSettings();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [blockStatus, setBlockStatus] = useState<{
    isBlocked: boolean;
    remainingMinutes: number;
    message: string;
    whatsappNumber: string;
  } | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState<{
    totalAmount: number;
    paymentMethod: string;
    productSummary: string;
  } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponCode: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    offerText: string;
  } | null>(null);
  
  const sessionId = useRef<string>(
    localStorage.getItem("session_id") || crypto.randomUUID()
  );
  const blockAlertRef = useRef<HTMLDivElement>(null);
  const { trackInitiateCheckout, trackPurchase } = usePixelTracking();
  const { getOrderSource } = useOrderSource();
  const hasTrackedCheckout = useRef(false);

  // Get theme colors from settings
  const primaryColor = getSetting("primary_color", "#16a34a");
  const accentColor = getSetting("accent_color", "#22c55e");
  const contactPhone = getSetting("footer_phone", "০১৭XX-XXXXXX");
  const bkashNumber = getSetting("payment_bkash_number", "");
  const nagadNumber = getSetting("payment_nagad_number", "");
  const rocketNumber = getSetting("payment_rocket_number", "");
  const thanaDistrictEnabled = getSetting("checkout_thana_district_enabled", "true") === "true";
  const couponEnabled = getSetting("checkout_coupon_enabled", "true") === "true";
  const termsEnabled = getSetting("checkout_terms_enabled", "false") === "true";
  const termsText = getSetting("checkout_terms_text", "আমি সকল শর্তাবলী পড়েছি ও সম্মত আছি।");
  const termsPageUrl = getSetting("checkout_terms_page_url", "");
  const termsLinkLabel = getSetting("checkout_terms_link_label", "Terms of Service");
  const termsLink2Label = getSetting("checkout_terms_link2_label", "");
  const termsLink2Url = getSetting("checkout_terms_link2_url", "");
  const termsSeparator = getSetting("checkout_terms_separator", "and");
  const termsSuffix = getSetting("checkout_terms_suffix", ".");
  // Customizable colors
  const cPageBg = getSetting("checkout_page_bg", "#f3f8f3");
  const cCardBg = getSetting("checkout_card_bg", "#ffffff");
  const cHeaderFrom = getSetting("checkout_header_bg_from", "") || primaryColor;
  const cHeaderTo = getSetting("checkout_header_bg_to", "") || accentColor;
  const cHeading = getSetting("checkout_heading_color", "#ffffff");
  const cSubheading = getSetting("checkout_subheading_color", "#ffffff");
  const cLabel = getSetting("checkout_label_color", "#1e293b");
  const cFieldBg = getSetting("checkout_field_bg", "#ecfdf5");
  const cFieldBorder = getSetting("checkout_field_border", "#d1fae5");
  const cFieldText = getSetting("checkout_field_text", "#1e293b");
  const cFieldPlaceholder = getSetting("checkout_field_placeholder", "#94a3b8");
  const cOptBg = getSetting("checkout_option_bg", "#ecfdf5");
  const cOptBorder = getSetting("checkout_option_border", "#d1fae5");
  const cOptText = getSetting("checkout_option_text", "#334155");
  const cOptActFrom = getSetting("checkout_option_active_from", "") || primaryColor;
  const cOptActTo = getSetting("checkout_option_active_to", "") || accentColor;
  const cOptActText = getSetting("checkout_option_active_text", "#ffffff");
  const cSumBg = getSetting("checkout_summary_bg", "#fafafa");
  const cSumBorder = getSetting("checkout_summary_border", "#e5e7eb");
  const cSumText = getSetting("checkout_summary_text", "#475569");
  const cTotal = getSetting("checkout_total_color", "") || primaryColor;
  const cTermsBg = getSetting("checkout_terms_bg", "#f0f9ff");
  const cTermsBorder = getSetting("checkout_terms_border", "#e0f2fe");
  const cTermsText = getSetting("checkout_terms_text_color", "#1e293b");
  const cTermsLink = getSetting("checkout_terms_link_color", "#0284c7");
  const cSubmitFrom = getSetting("checkout_submit_from", "") || primaryColor;
  const cSubmitTo = getSetting("checkout_submit_to", "") || accentColor;
  const cSubmitText = getSetting("checkout_submit_text", "#ffffff");
  const fieldStyle: React.CSSProperties = {
    backgroundColor: cFieldBg,
    borderColor: cFieldBorder,
    color: cFieldText,
  };
  const placeholderStyleId = "checkout-placeholder-style";
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getSavedFormData = () => {
    try {
      const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || "",
          phone: parsed.phone || "",
          address: parsed.address || "",
          thana: parsed.thana || "",
          district: parsed.district || "",
          city: parsed.city || "ঢাকার বাইরে",
          paymentMethod: "cod",
          senderNumber: "",
          transactionId: "",
        };
      }
    } catch (e) {
      console.error("Error loading saved checkout data:", e);
    }
    return {
      name: "",
      phone: "",
      address: "",
      thana: "",
      district: "",
      city: "ঢাকার বাইরে",
      paymentMethod: "cod",
      senderNumber: "",
      transactionId: "",
    };
  };

  const [formData, setFormData] = useState(getSavedFormData);
  const [defaultShipping, setDefaultShipping] = useState({ inside: 60, outside: 120 });

  useEffect(() => {
    const fetchShippingSettings = async () => {
      const { data, error } = await api
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["default_shipping_inside_dhaka", "default_shipping_outside_dhaka"]);
      
      if (!error && data) {
        const settings: { inside: number; outside: number } = { inside: 60, outside: 120 };
        data.forEach((item) => {
          if (item.setting_key === "default_shipping_inside_dhaka") {
            settings.inside = parseInt(item.setting_value || "60");
          }
          if (item.setting_key === "default_shipping_outside_dhaka") {
            settings.outside = parseInt(item.setting_value || "120");
          }
        });
        setDefaultShipping(settings);
      }
    };
    fetchShippingSettings();
  }, []);

  const hasAllFreeShipping = cartItems.every(item => item.product.free_shipping === true);
  const isDhaka = formData.city === "ঢাকার ভিতরে";
  
  const calculateShippingCost = useCallback(() => {
    if (hasAllFreeShipping) return 0;
    
    const customShippings = cartItems
      .filter(item => !item.product.free_shipping)
      .map(item => {
        if (isDhaka) {
          return item.product.shipping_inside_dhaka ?? defaultShipping.inside;
        }
        return item.product.shipping_outside_dhaka ?? defaultShipping.outside;
      });
    
    return customShippings.length > 0 ? Math.max(...customShippings) : 0;
  }, [cartItems, isDhaka, defaultShipping, hasAllFreeShipping]);

  const shippingCost = appliedCoupon?.discountType === "free_shipping" ? 0 : calculateShippingCost();
  const couponDiscount = appliedCoupon?.discountType === "free_shipping" ? 0 : (appliedCoupon?.discountAmount || 0);
  const grandTotal = cartTotal + shippingCost - couponDiscount;

  useEffect(() => {
    localStorage.setItem("session_id", sessionId.current);
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      const items = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name_bn,
        price: cartItemPrice(item),
        original_price: item.product.original_price,
        quantity: item.quantity,
        category: item.product.category_id || undefined,
        stock: item.product.stock,
        stock_status: item.product.stock > 0 ? 'instock' : 'outofstock',
        variation_name: cartItemVariationLabel(item) || undefined,
        variation_id: item.variations?.[0]?.id || item.variation?.id,
      }));
      trackInitiateCheckout(items, "Website Checkout", {
        subtotal: cartTotal,
        total: grandTotal,
        shipping: shippingCost,
        coupon: appliedCoupon?.couponCode,
        discountTotal: couponDiscount,
        customer: {
          firstName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: 'BD',
        },
      });
    }
  }, [cartItems, trackInitiateCheckout, cartTotal, grandTotal, shippingCost, appliedCoupon, couponDiscount, formData]);

  useEffect(() => {
    const dataToSave = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      thana: formData.thana,
      district: formData.district,
      city: formData.city,
    };
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData.name, formData.phone, formData.address, formData.thana, formData.district, formData.city]);

  const saveAbandonedCart = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length !== 11 || cartItems.length === 0) return;

    const cartData = {
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name_bn,
        price: cartItemPrice(item),
        quantity: item.quantity,
        variation_id: item.variations?.[0]?.id || item.variation?.id,
        variation_name: cartItemVariationLabel(item) || undefined,
      })),
      total: grandTotal,
      form: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
      },
    };

    try {
      const { error } = await api.rpc("save_abandoned_cart", {
        _session_id: sessionId.current,
        _customer_phone: normalizedPhone,
        _cart_data: cartData as any,
        _checkout_step: "checkout",
      });

      if (error) {
        console.error("Error saving abandoned cart:", error);
      }
    } catch (error) {
      console.error("Error saving abandoned cart:", error);
    }
  }, [cartItems, grandTotal, formData, user?.id]);

  const phoneValidation = useMemo(() => {
    return validateBDPhoneNumber(formData.phone);
  }, [formData.phone]);

  useEffect(() => {
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneValidation.isValid && phoneDigits.length >= 10) {
      const timeoutId = setTimeout(() => {
        saveAbandonedCart(formData.phone);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.phone, saveAbandonedCart, phoneValidation.isValid]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const deleteAbandonedCart = async () => {
    try {
      const normalizedPhone = normalizePhoneNumber(formData.phone);
      await api.rpc("remove_abandoned_cart", {
        _session_id: sessionId.current,
        _customer_phone: normalizedPhone,
      });
    } catch (error) {
      console.error("Error deleting abandoned cart:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error(t('checkout.cart_empty'));
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error(t('checkout.fill_all'));
      return;
    }

    if (thanaDistrictEnabled && (!formData.thana || !formData.district)) {
      toast.error(t('checkout.fill_all'));
      return;
    }

    if (termsEnabled && !termsAccepted) {
      toast.error("অনুগ্রহ করে শর্তাবলী মেনে নিন");
      return;
    }

    if (!phoneValidation.isValid) {
      toast.error(t('checkout.valid_phone'));
      return;
    }

    // Validate online payment fields
    if (["bkash","nagad","rocket"].includes(formData.paymentMethod)) {
      if (!formData.senderNumber || !formData.transactionId) {
        toast.error("সেন্ডার নাম্বার ও ট্রাঞ্জেকশন আইডি দিন");
        return;
      }
    } else if (formData.paymentMethod === "online") {
      toast.error("পেমেন্ট মাধ্যম নির্বাচন করুন (বিকাশ/নগদ/রকেট)");
      return;
    }

    // Get IP early for both blocking check and order saving
    const userIP = await getUserIP();

    const duplicateStatus = await checkBlockStatus(formData.phone, userIP);
    if (duplicateStatus.isBlocked) {
      setBlockStatus(duplicateStatus);
      toast.error(t('checkout.already_ordered'));
      setTimeout(() => {
        blockAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }
    setBlockStatus(null);

    setLoading(true);

    try {
      const generatedOrderId = crypto.randomUUID();
      const fullAddress = thanaDistrictEnabled && (formData.thana || formData.district)
        ? `${formData.address}, থানা: ${formData.thana}, জেলা: ${formData.district}`
        : formData.address;
      const paymentNote = ["bkash","nagad","rocket"].includes(formData.paymentMethod)
        ? `পেমেন্ট: ${formData.paymentMethod.toUpperCase()} | সেন্ডার: ${formData.senderNumber} | TrxID: ${formData.transactionId}`
        : null;
      const orderInput = {
          id: generatedOrderId,
          user_id: user?.id || null,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: fullAddress,
          customer_city: formData.city,
          total_amount: grandTotal,
          shipping_cost: shippingCost,
          payment_method: formData.paymentMethod,
          notes: paymentNote,
          order_source: getOrderSource(),
          coupon_code: appliedCoupon?.couponCode || null,
          coupon_discount: couponDiscount || 0,
          customer_ip: userIP || null,
      };

      const orderItems = cartItems.map((item) => ({
        order_id: generatedOrderId,
        product_id: item.product.id,
        product_name: cartItemVariationLabel(item)
          ? `${item.product.name_bn} (${cartItemVariationLabel(item)})`
          : item.product.name_bn,
        product_price: cartItemPrice(item),
        quantity: item.quantity,
        variation_id: item.variations?.[0]?.id || item.variation?.id || null,
        variation_ids: (item.variations || (item.variation ? [item.variation] : [])).map(v => v.id),
        variation_name: cartItemVariationLabel(item),
      }));

      const { error: itemsError } = await api.checkout({ order: orderInput, items: orderItems });

      if (itemsError) throw itemsError;

      // Mark order as placed for duplicate blocking (localStorage)
      markOrderPlaced();

      await deleteAbandonedCart();

      // Mark coupon as used
      if (appliedCoupon?.couponCode) {
        await api.rpc("redeem_spin_coupon", {
          _code: appliedCoupon.couponCode,
          _order_id: generatedOrderId,
        });
      }

      const eventId = trackPurchase({
        order_id: generatedOrderId,
        total: grandTotal,
        subtotal: cartTotal,
        shipping: shippingCost,
        tax: 0,
        discount_total: couponDiscount,
        coupon_code: appliedCoupon?.couponCode,
        customer_phone: formData.phone,
        customer_name: formData.name,
        customer_address: formData.address,
        customer_city: formData.city,
        payment_method: formData.paymentMethod,
        payment_method_title: formData.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : formData.paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name_bn,
          price: cartItemPrice(item),
          original_price: item.product.original_price,
          quantity: item.quantity,
          variation_name: cartItemVariationLabel(item) || undefined,
          variation_id: item.variations?.[0]?.id || item.variation?.id,
          category: item.product.category_id || undefined,
          stock: item.product.stock,
          stock_status: item.product.stock > 0 ? 'instock' : 'outofstock',
        })),
        customer: {
          firstName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: 'BD',
        },
      }, "Website Checkout");

      // Save purchase_event_id for cancellation tracking
      if (eventId) {
        const fbp = (document.cookie.match(/(?:^|; )_fbp=([^;]+)/) || [])[1];
        const fbc = (document.cookie.match(/(?:^|; )_fbc=([^;]+)/) || [])[1];
        const ttp = (document.cookie.match(/(?:^|; )_ttp=([^;]+)/) || [])[1];
        const ttclid = (document.cookie.match(/(?:^|; )ttclid=([^;]+)/) || [])[1];
        const externalId = localStorage.getItem("__fb_external_id") || undefined;
        await api
          .from("orders")
          .update({
            purchase_event_id: eventId,
            tracking_data: {
              fbp: fbp ? decodeURIComponent(fbp) : null,
              fbc: fbc ? decodeURIComponent(fbc) : null,
              ttp: ttp ? decodeURIComponent(ttp) : null,
              ttclid: ttclid ? decodeURIComponent(ttclid) : null,
              user_agent: navigator.userAgent,
              external_id: externalId,
              source_url: window.location.href,
            },
          })
          .eq("id", generatedOrderId);
      }

      // Store order details before clearing cart
      const productSummary = cartItems.map(item => {
        const name = cartItemVariationLabel(item)
          ? `${item.product.name_bn} (${cartItemVariationLabel(item)})`
          : item.product.name_bn;
        return item.quantity > 1 ? `${item.quantity}x ${name}` : name;
      }).join(", ");

      setOrderDetails({
        totalAmount: grandTotal,
        paymentMethod: formData.paymentMethod,
        productSummary,
      });

      clearCart();
      setOrderId(generatedOrderId);
      setOrderPlaced(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(t('checkout.order_success'));
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(t('checkout.order_error'));
    } finally {
      setLoading(false);
    }
  };

  // Order Success View
  if (orderPlaced) {
    const formatOrderId = (id: string) => {
      const hash = id.replace(/-/g, "").slice(-6);
      const num = parseInt(hash, 16) % 1000;
      return `#${num.toString().padStart(3, "0")}`;
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case "cod": return "Cash on Delivery";
        case "bkash": return "bKash";
        default: return method;
      }
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a0f36, #2e1a5b, #1a0f36)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4 pb-20 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[600px]"
          >
            <div 
              className="rounded-2xl p-8 md:p-10 text-center"
              style={{
                background: '#2e1a5b',
                border: '2px solid #f1c40f',
                boxShadow: '0 10px 40px rgba(46, 26, 91, 0.5)',
              }}
            >
              {/* Icon */}
              <div className="text-6xl mb-5" style={{ color: '#f1c40f' }}>✔</div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-2 uppercase" style={{ color: '#f1c40f' }}>
                অভিনন্দন!
              </h1>
              <p className="text-lg font-semibold mb-5" style={{ color: '#e0e0e0' }}>
                আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#ccc' }}>
                আপনার অর্ডারটি আমরা সফলভাবে গ্রহণ করেছি এবং শীঘ্রই প্রসেস করা হবে। আমাদের টিম পণ্যটি আপনার কাছে পৌঁছে দেওয়ার জন্য কাজ করবে।
              </p>

              {/* Order Details */}
              {orderDetails && (
                <div 
                  className="rounded-xl p-6 text-left my-5"
                  style={{
                    background: '#432c7a',
                    border: '1px dashed #6b52a3',
                  }}
                >
                  <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                    <span style={{ color: '#ddd' }}>অর্ডার আইডি:</span>
                    <span className="font-bold text-white">{formatOrderId(orderId)}</span>
                  </div>
                  <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                    <span style={{ color: '#ddd' }}>প্রোডাক্ট:</span>
                    <span className="font-bold text-white text-right max-w-[250px] truncate">{orderDetails.productSummary}</span>
                  </div>
                  <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                    <span style={{ color: '#ddd' }}>পেমেন্ট মেথড:</span>
                    <span className="font-bold text-white">{getPaymentMethodLabel(orderDetails.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span style={{ color: '#ddd' }}>সর্বমোট:</span>
                    <span className="font-bold text-lg" style={{ color: '#f1c40f' }}>৳ {orderDetails.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div 
                className="rounded-xl p-4 text-center font-bold mt-6"
                style={{ background: '#3b256b' }}
              >
                <span style={{ color: '#ddd' }}>যেকোনো প্রয়োজনে কল করুন:</span>
                <a 
                  href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
                  className="block mt-1 text-xl no-underline"
                  style={{ color: '#f1c40f' }}
                >
                  ☎ {contactPhone}
                </a>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty Cart View
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f8f3]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 pb-20 lg:pb-12">
          <div className="text-center text-slate-800">
            <h1 className="text-2xl font-bold mb-4">{t('checkout.cart_empty')}</h1>
            <Button asChild style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
              <Link to="/products">{t('cart.start_shopping')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: cPageBg }}>
      <style>{`
        .checkout-form input::placeholder, .checkout-form textarea::placeholder { color: ${cFieldPlaceholder} !important; }
      `}</style>
      <Header />
      <main className="flex-1 pt-[10px] md:py-10 pb-20 lg:pb-10 px-[10px] md:px-4 relative">
        <div className="w-full max-w-3xl mx-auto relative font-['Hind_Siliguri',_sans-serif]">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Single Column Layout */}
            <div className="grid grid-cols-1 gap-6">
              {/* Order Form (with embedded cart items) */}
              <div 
                className="rounded-2xl overflow-hidden h-fit"
                style={{
                  background: cCardBg,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header */}
                <div 
                  className="px-6 py-6 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${cHeaderFrom}, ${cHeaderTo})`
                  }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: cHeading }}>
                    {getSetting("checkout_header_title", "") || t('checkout.title')}
                  </h2>
                  <p className="text-sm flex items-center justify-center gap-1.5 mt-1.5" style={{ color: cSubheading }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cSubheading }} />
                    {getSetting("checkout_header_subtitle", "") || t('checkout.fast_delivery')}
                  </p>
                </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 checkout-form">
                {/* Block Alert */}
                {blockStatus?.isBlocked && (
                  <div ref={blockAlertRef}>
                    <DuplicateOrderBlockAlert
                      message={blockStatus.message}
                      whatsappNumber={blockStatus.whatsappNumber}
                      productName={cartItems.map(item => item.product.name_bn).join(", ")}
                    />
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif]" style={{ color: cLabel }}>
                    {t('checkout.your_name')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('checkout.name_placeholder')}
                    required
                    style={fieldStyle}
                    className="h-12 border rounded-xl text-base px-4 focus:ring-0 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif]" style={{ color: cLabel }}>
                    {t('checkout.mobile')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      required
                      style={fieldStyle}
                      className={cn(
                        "h-12 rounded-xl text-base px-4 focus:ring-0 pr-11 border transition-colors",
                        formData.phone && !phoneValidation.isValid && "border-red-300 focus:border-red-400"
                      )}
                    />
                    {formData.phone && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {phoneValidation.isValid ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.phone && !phoneValidation.isValid && phoneValidation.message && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {phoneValidation.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif] flex items-center gap-1.5" style={{ color: cLabel }}>
                    <MapPin className="h-4 w-4" style={{ color: cLabel }} />
                    {t('checkout.address')}
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t('checkout.address_placeholder')}
                    required
                    style={fieldStyle}
                    className="h-12 border rounded-xl text-base px-4 focus:ring-0 transition-colors"
                  />
                </div>

                {/* Thana & District */}
                {thanaDistrictEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="thana" className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif] flex items-center gap-1.5" style={{ color: cLabel }}>
                      <MapPin className="h-4 w-4" style={{ color: cLabel }} />
                      থানা
                    </Label>
                    <Input
                      id="thana"
                      name="thana"
                      value={formData.thana}
                      onChange={handleInputChange}
                      placeholder="থানা লিখুন"
                      required
                      style={fieldStyle}
                      className="h-12 border rounded-xl text-base px-4 focus:ring-0 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif] flex items-center gap-1.5" style={{ color: cLabel }}>
                      <MapPin className="h-4 w-4" style={{ color: cLabel }} />
                      জেলা
                    </Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="জেলা লিখুন"
                      required
                      style={fieldStyle}
                      className="h-12 border rounded-xl text-base px-4 focus:ring-0 transition-colors"
                    />
                  </div>
                </div>
                )}

                {/* Delivery Area */}
                <div className="space-y-3">
                  <Label className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif] flex items-center gap-1.5 mb-1" style={{ color: cLabel }}>
                    <Truck className="h-4 w-4" style={{ color: cLabel }} />
                    {t('checkout.delivery_area')}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "ঢাকার ভিতরে", label: t('checkout.inside_dhaka'), price: defaultShipping.inside },
                      { value: "ঢাকার বাইরে", label: t('checkout.outside_dhaka'), price: defaultShipping.outside },
                    ].map((area) => {
                      const active = formData.city === area.value;
                      return (
                        <button
                          key={area.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, city: area.value }))}
                          className={cn(
                            "relative py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2 whitespace-nowrap"
                          )}
                          style={active ? {
                            background: `linear-gradient(135deg, ${cOptActFrom}, ${cOptActTo})`,
                            borderColor: 'transparent',
                            color: cOptActText,
                            boxShadow: `0 6px 16px -6px ${cOptActFrom}66`
                          } : {
                            background: cOptBg,
                            borderColor: cOptBorder,
                            color: cOptText,
                          }}
                        >
                          <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: active ? cOptActText : cOptText }} />
                          <span>{area.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cart Items - inline */}
                <div className="space-y-2.5">
                  {cartItems.map((item) => {
                    const itemKey = cartItemKey(item);
                    const itemPrice = cartItemPrice(item);
                    const variationLabel = cartItemVariationLabel(item);
                    const itemName = variationLabel
                      ? `${language === 'en' ? (item.product.name || item.product.name_bn) : item.product.name_bn} (${variationLabel})`
                      : (language === 'en' ? (item.product.name || item.product.name_bn) : item.product.name_bn);
                    return (
                      <div 
                        key={itemKey} 
                        className="relative flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}
                      >
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.variation?.id, itemKey)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name_bn} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm line-clamp-2">{itemName}</p>
                          <p className="text-base font-bold mt-0.5" style={{ color: primaryColor }}>৳{itemPrice.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id, itemKey)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id, itemKey)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Field */}
                {couponEnabled && (
                  <CouponField
                    cartTotal={cartTotal}
                    onApply={setAppliedCoupon}
                    appliedCoupon={appliedCoupon}
                    accentColor={accentColor}
                  />
                )}

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-[17px] font-semibold font-['Hind_Siliguri',sans-serif] flex items-center gap-1.5 mb-1" style={{ color: cLabel }}>
                    <CreditCard className="h-4 w-4" style={{ color: cLabel }} />
                    {t('checkout.payment_method')}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "cod" }))}
                      className="py-3 px-4 rounded-xl text-[11.5px] font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2 whitespace-nowrap"
                      style={formData.paymentMethod === "cod" ? {
                        background: `linear-gradient(135deg, ${cOptActFrom}, ${cOptActTo})`,
                        borderColor: 'transparent',
                        color: cOptActText,
                        boxShadow: `0 6px 16px -6px ${cOptActFrom}66`
                      } : { background: cOptBg, borderColor: cOptBorder, color: cOptText }}
                    >
                      <Wallet className="h-3.5 w-3.5 flex-shrink-0" />
                      {t('checkout.cod')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "online" }))}
                      className="py-3 px-4 rounded-xl text-[11.5px] font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2 whitespace-nowrap"
                      style={["online","bkash","nagad","rocket"].includes(formData.paymentMethod) ? {
                        background: `linear-gradient(135deg, ${cOptActFrom}, ${cOptActTo})`,
                        borderColor: 'transparent',
                        color: cOptActText,
                        boxShadow: `0 6px 16px -6px ${cOptActFrom}66`
                      } : { background: cOptBg, borderColor: cOptBorder, color: cOptText }}
                    >
                      <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>অনলাইন পেমেন্ট</span>
                    </button>
                  </div>

                  {/* Online Payment Sub-options */}
                  {["online","bkash","nagad","rocket"].includes(formData.paymentMethod) && (
                    <div className="mt-3 space-y-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "bkash", label: "বিকাশ", color: "#E2136E", number: bkashNumber },
                          { value: "nagad", label: "নগদ", color: "#EB6F26", number: nagadNumber },
                          { value: "rocket", label: "রকেট", color: "#8C3494", number: rocketNumber },
                        ].map((m) => {
                          const active = formData.paymentMethod === m.value;
                          return (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: m.value }))}
                              className={cn(
                                "py-2.5 px-2 rounded-lg text-[13px] font-semibold transition-all border-2 flex items-center justify-center gap-1.5",
                                active ? "text-white shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              )}
                              style={active ? { background: m.color, borderColor: 'transparent' } : {}}
                            >
                              <Smartphone className="h-3.5 w-3.5" />
                              {m.label}
                            </button>
                          );
                        })}
                      </div>

                      {["bkash","nagad","rocket"].includes(formData.paymentMethod) && (() => {
                        const numbers: Record<string, string> = { bkash: bkashNumber, nagad: nagadNumber, rocket: rocketNumber };
                        const labels: Record<string, string> = { bkash: "বিকাশ", nagad: "নগদ", rocket: "রকেট" };
                        const num = numbers[formData.paymentMethod];
                        return (
                          <div className="space-y-3">
                            {num ? (
                              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white border border-slate-200">
                                <div className="flex flex-col">
                                  <span className="text-[11px] text-slate-500">{labels[formData.paymentMethod]} পেমেন্ট নাম্বার (Send Money)</span>
                                  <span className="text-base font-bold text-slate-800 tracking-wide">{num}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(num);
                                    toast.success("নাম্বার কপি হয়েছে");
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  কপি
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-amber-600">পেমেন্ট নাম্বার সেট করা নেই। অ্যাডমিন প্যানেল থেকে যোগ করুন।</p>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="senderNumber" className="text-slate-700 text-sm font-semibold">
                                  সেন্ডার নাম্বার
                                </Label>
                                <Input
                                  id="senderNumber"
                                  name="senderNumber"
                                  value={formData.senderNumber}
                                  onChange={handleInputChange}
                                  placeholder="যে নাম্বার থেকে পাঠিয়েছেন"
                                  required
                                  className="h-11 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="transactionId" className="text-slate-700 text-sm font-semibold">
                                  ট্রাঞ্জেকশন আইডি
                                </Label>
                                <Input
                                  id="transactionId"
                                  name="transactionId"
                                  value={formData.transactionId}
                                  onChange={handleInputChange}
                                  placeholder="TrxID লিখুন"
                                  required
                                  className="h-11 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div 
                  className="rounded-xl p-4 space-y-2.5"
                  style={{ 
                    background: cSumBg,
                    border: `1px solid ${cSumBorder}`
                  }}
                >
                  <div className="flex justify-between text-base" style={{ color: cSumText }}>
                    <span>{t('checkout.subtotal')}</span>
                    <span className="font-medium" style={{ color: cSumText }}>৳{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-base" style={{ color: cSumText }}>
                    <span>{t('checkout.delivery_charge')}</span>
                    <span className="font-medium" style={{ color: cSumText }}>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">{t('checkout.free')}</span>
                      ) : (
                        `৳${shippingCost}`
                      )}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-base">
                      <span className="text-emerald-600">কুপন ছাড়</span>
                      <span className="font-medium text-emerald-600">-৳{couponDiscount}</span>
                    </div>
                  )}
                  <div 
                    className="flex justify-between font-bold text-lg pt-2.5"
                    style={{ borderTop: `1px solid ${cSumBorder}` }}
                  >
                    <span style={{ color: cSumText }}>{t('checkout.total')}</span>
                    <span style={{ color: cTotal }}>
                      ৳{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions */}
                {termsEnabled && (
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer" style={{ background: cTermsBg, borderColor: cTermsBorder }}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 cursor-pointer"
                      style={{ accentColor: cTermsLink }}
                    />
                    <span className="text-sm leading-relaxed" style={{ color: cTermsText }}>
                      <span dangerouslySetInnerHTML={{ __html: termsText }} />
                      {termsPageUrl && termsLinkLabel && (
                        <>
                          {" "}
                          <a
                            href={termsPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                            style={{ color: cTermsLink }}
                          >
                            {termsLinkLabel}
                          </a>
                        </>
                      )}
                      {termsLink2Url && termsLink2Label && (
                        <>
                          {" "}{termsSeparator}{" "}
                          <a
                            href={termsLink2Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                            style={{ color: cTermsLink }}
                          >
                            {termsLink2Label}
                          </a>
                        </>
                      )}
                      {termsSuffix}
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || blockStatus?.isBlocked || (termsEnabled && !termsAccepted)}
                  className="w-full h-14 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wide"
                  style={{ 
                    background: `linear-gradient(135deg, ${cSubmitFrom}, ${cSubmitTo})`,
                    color: cSubmitText,
                    boxShadow: `0 10px 25px -8px ${cSubmitFrom}50`,
                    opacity: blockStatus?.isBlocked ? 0.5 : 1
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('checkout.processing')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      {t('checkout.confirm_order')}
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-900">
                  {formData.paymentMethod === "cod" 
                    ? t('checkout.cod_note')
                    : t('checkout.bkash_note')
                  }
                </p>
              </form>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;