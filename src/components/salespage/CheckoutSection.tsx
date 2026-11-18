import { persistUser } from "@/lib/fbTracking";
import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesPage } from "@/types/salesPage";
 import { ProductVariation } from "@/types";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { CheckCircle, Minus, Plus, MapPin, Truck, Wallet, CreditCard, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import VariationSelector from "./VariationSelector";
import { selectionPrice, selectionLabel } from "@/lib/variationGroups";
 import { useProductVariations } from "@/hooks/useProductVariations";
import { useDuplicateOrderBlock } from "@/hooks/useDuplicateOrderBlock";
import DuplicateOrderBlockAlert from "@/components/checkout/DuplicateOrderBlockAlert";
import CouponField from "@/components/checkout/CouponField";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useCallback } from "react";
import { usePixelTracking } from "@/hooks/usePixelTracking";
import { getCheckoutDesign, getCheckoutColorVariables, getCheckoutText } from "@/lib/checkoutDesigns";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { checkoutSpacingStyle, hasCheckoutSpacing } from '@/lib/checkoutSpacing';
import { checkoutExtraFields, isCheckoutExtraFieldEnabled, enabledCheckoutExtraValues, checkoutExtraOrderData } from '@/lib/checkoutExtraFields';

interface CheckoutSectionProps {
  page: SalesPage;
}

const CheckoutSection = ({ page }: CheckoutSectionProps) => {
  const checkoutDesign = getCheckoutDesign(page.template_styles?.checkout?.design);
  const checkoutColors = getCheckoutColorVariables(page.template_styles?.checkout);
  const checkoutColorClasses = Object.keys(checkoutColors).map(key => `checkout-color-${key.slice("--checkout-".length)}`);
  const text = (key: Parameters<typeof getCheckoutText>[1], fallback: string) => getCheckoutText(page.template_styles?.checkout, key, fallback);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackPurchase } = usePixelTracking();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const { getSetting } = useSiteSettings();
  const onlineNumbers = [
    { key: "bkash", label: "বিকাশ", number: getSetting("payment_bkash_number", "") },
    { key: "nagad", label: "নগদ", number: getSetting("payment_nagad_number", "") },
    { key: "rocket", label: "রকেট", number: getSetting("payment_rocket_number", "") },
  ].filter((n) => n.number.trim());
  const [onlineProvider, setOnlineProvider] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
   const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockInfo, setBlockInfo] = useState({ remainingMinutes: 0, message: "", whatsappNumber: "" });
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponCode: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    offerText: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "ঢাকার বাইরে",
    thana: "",
    district: "",
    additionalInfo: "",
  });

  // Session ID for abandoned cart tracking
  const sessionId = useRef<string>(
    localStorage.getItem("session_id") || crypto.randomUUID()
  );

   const { data: variations = [] } = useProductVariations(page.product_id);
  const { checkBlockStatus, markOrderPlaced, getUserIP } = useDuplicateOrderBlock();
 
  // Save session ID to localStorage
  useEffect(() => {
    localStorage.setItem("session_id", sessionId.current);
  }, []);

  // Block status is only checked on form submit (handleSubmit), not on phone change

  useEffect(() => {
    const saved = localStorage.getItem("checkoutFormData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData({
        name: parsed.name || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
        city: parsed.city || "ঢাকার বাইরে",
        thana: parsed.thana || "",
        district: parsed.district || "",
        additionalInfo: "",
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time phone validation
    if (name === "phone") {
      if (value.length === 0) {
        setPhoneValidation(null);
      } else if (value.length < 11) {
         setPhoneValidation({ isValid: false, message: text("phoneIncomplete", "ফোন নম্বর অসম্পূর্ণ") });
      } else if (!validatePhone(value)) {
         setPhoneValidation({ isValid: false, message: text("phoneInvalid", "সঠিক বাংলাদেশি ফোন নম্বর দিন") });
      } else {
         setPhoneValidation({ isValid: true, message: text("phoneValid", "সঠিক ফোন নম্বর") });
      }
    }
  };

  // Persist customer identifiers as they type → higher Event Match Quality for every later event
  useEffect(() => {
    const t = window.setTimeout(() => {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length < 11 && !formData.name.trim()) return;
      persistUser({
        firstName: formData.name.trim() || undefined,
        phone: digits.length >= 11 ? formData.phone : undefined,
        city: formData.district || formData.thana || undefined,
        state: formData.district || undefined,
        country: "BD",
      });
    }, 800);
    return () => window.clearTimeout(t);
  }, [formData.name, formData.phone, formData.district, formData.thana]);

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    const bdPattern = /^(?:\+?88)?01[3-9]\d{8}$/;
    return bdPattern.test(cleaned);
  };

  const normalizePhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("+88")) cleaned = cleaned.slice(3);
    if (cleaned.startsWith("88")) cleaned = cleaned.slice(2);
    return cleaned;
  };

  const isDhaka = formData.city === "ঢাকার ভিতরে";
  const product = page.products;
   
   // Use summed variation prices if selected, otherwise use product price
   const unitPrice = selectedVariations.length > 0
     ? selectionPrice(selectedVariations, product?.price ?? page.offer_price)
     : (product?.price ?? page.offer_price);
   
   // Get original price for discount calculation
   const originalPrice = product?.original_price || null;
   
   // Calculate discount percentage
   const discountPercentage = originalPrice && originalPrice > unitPrice 
     ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
     : 0;

  // Multiple linked products
  const linkedIds = (page.template_styles?.products?.ids || "").split(",").filter(Boolean);
  const allowMultiple = page.template_styles?.products?.multiple === "1";
  const isMultiProduct = linkedIds.length > 1;
  const { data: linkedProducts = [] } = useQuery({
    queryKey: ["sales-page-linked-products", linkedIds.join(",")],
    enabled: isMultiProduct,
    queryFn: async () => {
      const { data, error } = await api.from("products").select("*").in("id", linkedIds);
      if (error) throw error;
      return linkedIds.map(id => data?.find(p => p.id === id)).filter(Boolean) as any[];
    },
  });
  const [selectedQty, setSelectedQty] = useState<Record<string, number>>({});
  useEffect(() => {
    if (isMultiProduct && linkedProducts.length && !Object.keys(selectedQty).length) {
      setSelectedQty({ [linkedProducts[0].id]: 1 });
    }
  }, [isMultiProduct, linkedProducts, selectedQty]);
  const toggleProduct = (id: string) => setSelectedQty(prev => {
    if (!allowMultiple) return { [id]: prev[id] || 1 };
    if (prev[id]) {
      if (Object.keys(prev).length === 1) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [id]: 1 };
  });
  const changeQty = (id: string, delta: number) => setSelectedQty(prev => prev[id] ? { ...prev, [id]: Math.max(1, prev[id] + delta) } : prev);

  const productLabel = (p: any) => p?.name_bn || p?.name || page.offer_details || page.title;
  const orderItems = isMultiProduct && linkedProducts.length
    ? linkedProducts.filter(p => selectedQty[p.id]).map(p => {
        const variationsForItem = p.id === page.product_id ? selectedVariations : [];
        const variationLabel = selectionLabel(variationsForItem);
        return {
          product: p,
          product_id: p.id,
          product_name: variationLabel ? `${productLabel(p)} (${variationLabel})` : productLabel(p),
          price: variationsForItem.length > 0 ? selectionPrice(variationsForItem, Number(p.price)) : Number(p.price),
          quantity: selectedQty[p.id],
          variation_id: variationsForItem[0]?.id || null,
          variation_name: variationLabel || null,
        };
      })
    : [{
        product,
        product_id: product?.id || null,
        product_name: selectedVariations.length > 0 ? `${productLabel(product)} (${selectionLabel(selectedVariations)})` : productLabel(product),
        price: unitPrice,
        quantity,
        variation_id: selectedVariations[0]?.id || null,
        variation_name: selectedVariations.length > 0 ? selectionLabel(selectedVariations) : null,
      }];
  const showVariations = !isMultiProduct || !!selectedQty[page.product_id || ""];

  const shippingFor = (p: any) => {
    if (p?.free_shipping) return 0;
    if (isDhaka && p?.shipping_inside_dhaka != null) return Number(p.shipping_inside_dhaka);
    if (!isDhaka && p?.shipping_outside_dhaka != null) return Number(p.shipping_outside_dhaka);
    return isDhaka ? 60 : 120;
  };
  const shippingCost = orderItems.length ? Math.max(...orderItems.map(i => shippingFor(i.product))) : 0;

   const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const effectiveShipping = appliedCoupon?.discountType === "free_shipping" ? 0 : shippingCost;
  const total = Math.max(0, subtotal - couponDiscount) + effectiveShipping;

  // Abandoned cart tracking - save when phone is valid
  const saveAbandonedCart = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone || normalizedPhone.length !== 11) return;

    const cartData = {
      items: orderItems.map(i => ({ product_id: i.product_id, product_name: i.product_name, price: i.price, quantity: i.quantity })),
      total: total,
      form: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        ...enabledCheckoutExtraValues(page.template_styles?.checkout, formData),
      },
      salesPage: page.title,
    };

    try {
      const { error } = await api.rpc("save_abandoned_cart", {
        _session_id: sessionId.current,
        _customer_phone: normalizedPhone,
        _cart_data: cartData as any,
        _checkout_step: "sales_page_checkout",
      });

      if (error) {
        console.error("Error saving abandoned cart:", error);
      }
    } catch (error) {
      console.error("Error saving abandoned cart:", error);
    }
  }, [JSON.stringify(orderItems.map(i => [i.product_id, i.price, i.quantity])), page.title, total, formData, user?.id, page.template_styles?.checkout]);

  // Effect to save abandoned cart when phone changes
  useEffect(() => {
    if (validatePhone(formData.phone)) {
      const timeoutId = setTimeout(() => {
        saveAbandonedCart(formData.phone);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [formData.phone, formData.name, formData.address, saveAbandonedCart]);

  // Delete abandoned cart when order is placed
  const deleteAbandonedCart = async () => {
    try {
      const normalizedPhone = normalizePhone(formData.phone);
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

    if (!validatePhone(formData.phone)) {
       toast.error(text("orderPhoneInvalid", "সঠিক ফোন নম্বর দিন (১১ ডিজিট)"));
      return;
    }

    // Get IP early for both blocking check and order saving
    const userIP = await getUserIP();

    // Check duplicate order block before submitting
    const blockStatus = await checkBlockStatus(formData.phone, userIP);
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      setBlockInfo({
        remainingMinutes: blockStatus.remainingMinutes,
        message: blockStatus.message,
        whatsappNumber: blockStatus.whatsappNumber,
      });
       toast.error(text("duplicateOrder", "আপনি ইতিমধ্যে একটি অর্ডার করেছেন"));
      return;
    }

    if (paymentMethod === "online") {
      if (!/^01\d{9}$/.test(senderNumber.trim())) {
         toast.error(text("senderInvalid", "যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি সঠিকভাবে দিন (১১ ডিজিট)"));
        return;
      }
      if (!/^[A-Za-z0-9]{6,30}$/.test(transactionId.trim())) {
         toast.error(text("transactionInvalid", "সঠিক ট্রানজেকশন আইডি দিন"));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const normalizedPhone = normalizePhone(formData.phone);
      const extraOrderData = checkoutExtraOrderData(page.template_styles?.checkout, formData, formData.address);

      const generatedOrderId = crypto.randomUUID();
      const { error: orderError } = await api.checkout({
        sales_page_id: page.id,
        order: {
          id: generatedOrderId,
          customer_name: formData.name,
          customer_phone: normalizedPhone,
          customer_address: extraOrderData.address,
          customer_city: formData.city,
          total_amount: total,
          shipping_cost: effectiveShipping,
          payment_method: paymentMethod === "online" ? onlineProvider : paymentMethod,
          notes: [paymentMethod === "online"
            ? `সেলস পেজ: ${page.title}\nঅনলাইন পেমেন্ট (${onlineNumbers.find((n) => n.key === onlineProvider)?.label || onlineProvider}) — প্রেরক: ${senderNumber.trim()}, TrxID: ${transactionId.trim()} — ভেরিফাই বাকি`
            : `সেলস পেজ: ${page.title}`, extraOrderData.note].filter(Boolean).join('\n'),
          order_source: "sales_page",
          coupon_code: appliedCoupon?.couponCode || null,
          coupon_discount: couponDiscount || 0,
          customer_ip: userIP || null,
        },
        items: orderItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          variation_ids: i.product_id === page.product_id ? selectedVariations.map(v => v.id) : [],
        })),
      });
      if (orderError) throw orderError;

      // Mark order as placed for duplicate blocking (localStorage)
      markOrderPlaced();

      // Delete abandoned cart after successful order
      await deleteAbandonedCart();

      // Mark coupon as used
      if (appliedCoupon?.couponCode) {
        await api.rpc("redeem_spin_coupon", {
          _code: appliedCoupon.couponCode,
          _order_id: generatedOrderId,
        });
      }

      // Track Purchase event for Facebook Pixel / GA4
      const eventId = trackPurchase(
        {
          order_id: generatedOrderId,
          total: total,
          shipping: shippingCost,
          items: orderItems.map(i => ({
            product_id: i.product_id,
            product_name: i.product_name,
            price: i.price,
            quantity: i.quantity,
            variation_name: i.variation_name || undefined,
          })),
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: extraOrderData.address,
          customer_city: formData.district || formData.thana || undefined,
          customer: {
            firstName: formData.name,
            phone: formData.phone,
            city: formData.district || formData.thana || undefined,
            state: formData.district || undefined,
            address: extraOrderData.address,
            country: "BD",
          } as any,
        },
        page.title
      );

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

      localStorage.setItem("checkoutFormData", JSON.stringify({ ...formData, ...enabledCheckoutExtraValues(page.template_styles?.checkout, formData), additionalInfo: '' }));

       toast.success(text("orderSuccess", "অর্ডার সফল হয়েছে!"));
      window.scrollTo({ top: 0 });
      navigate(`/lp-order-success?orderId=${generatedOrderId}`);
    } catch (err: any) {
      console.error("Order error:", err);
       toast.error(err.message || text("orderError", "অর্ডার করতে সমস্যা হয়েছে"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimal design (02): products render below the payment method instead of the top
  const productsBelowPayment = checkoutDesign === "02";
  // Ticket design (04): products render below the delivery area section
  const productsBelowArea = checkoutDesign === "04";
  // Coupon field can be turned off per page from the checkout design settings
  const couponEnabled = page.template_styles?.checkout?.coupon !== "0";

  const productBlock = isMultiProduct && linkedProducts.length > 0 ? (
          <div className={cn("checkout-product py-3 space-y-2", !productsBelowPayment && "px-4 border-b border-white/10")}>
            <p className="checkout-products-heading text-sm font-semibold text-white">{renderSalesText(text("productsHeading", "আপনার পছন্দের প্রোডাক্ট সিলেক্ট করুন"))}</p>
            {renderSalesText(linkedProducts.map((p: any) => {
              const selected = !!selectedQty[p.id];
              const img = p.image_url || p.images?.[0];
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  data-selected={selected}
                  onClick={() => toggleProduct(p.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleProduct(p.id); } }}
                  className="flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-all"
                  style={{ border: `2px solid ${selected ? page.accent_color : "rgba(255,255,255,0.15)"}` }}
                >
                  <span
                    className={cn("w-5 h-5 flex-shrink-0 flex items-center justify-center border-2", allowMultiple ? "rounded" : "rounded-full")}
                    style={{ borderColor: selected ? page.accent_color : "rgba(255,255,255,0.4)", background: selected ? page.accent_color : "transparent" }}
                  >
                    {renderSalesText(selected && <Check className="h-3 w-3 text-white" />)}
                  </span>
                  {renderSalesText(img && <img src={img} alt={salesPlainText(productLabel(p))} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />)}
                  <div className="flex-1 min-w-0">
                    <p className="checkout-product-name font-medium text-white text-sm truncate">{renderSalesText(productLabel(p))}</p>
                    <div className="flex items-center gap-2">
                      <p className="checkout-price text-base font-bold" style={{ color: page.accent_color }}>{renderSalesText(page.price_unit)}{renderSalesText(p.price)}</p>
                      {renderSalesText(p.original_price && Number(p.original_price) > Number(p.price) && (
                        <span className="checkout-old-price text-xs text-white/50 line-through">{renderSalesText(page.price_unit)}{renderSalesText(p.original_price)}</span>
                      ))}
                    </div>
                  </div>
                  {renderSalesText(selected && (
                    <div className="checkout-quantity flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => changeQty(p.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: page.primary_color }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-white">{renderSalesText(selectedQty[p.id])}</span>
                      <button type="button" onClick={() => changeQty(p.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: page.primary_color }}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            }))}
          </div>
  ) : (
          <div className="checkout-product px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              {renderSalesText((product?.image_url || (page.gallery_images && page.gallery_images.length > 0)) && (
                <img
                  src={product?.image_url || page.gallery_images?.[0]}
                  alt={salesPlainText(product?.name_bn || page.title)}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  style={{ border: `2px solid ${page.primary_color}40` }}
                />
              ))}
              <div className="flex-1 min-w-0">
                 <p className="checkout-product-name font-medium text-white text-sm truncate">
                  {renderSalesText(product?.name_bn || product?.name || page.offer_details || page.title)}
                </p>
                <div className="flex items-center gap-2">
                   <p className="checkout-price text-lg font-bold" style={{ color: page.accent_color }}>
                    {renderSalesText(page.price_unit)}{renderSalesText(unitPrice)}
                  </p>
                  {renderSalesText(originalPrice && originalPrice > unitPrice && (
                    <>
                       <span className="checkout-old-price text-sm text-white/50 line-through">
                        {renderSalesText(page.price_unit)}{renderSalesText(originalPrice)}
                      </span>
                      <span
                         className="checkout-discount text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${page.accent_color}30`,
                          color: page.accent_color
                        }}
                      >
                         {renderSalesText(discountPercentage)}% {renderSalesText(text("discount", "ছাড়"))}
                      </span>
                    </>
                  ))}
                </div>
              </div>

              {/* Quantity - Compact */}
               <div className="checkout-quantity flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-105"
                  style={{ background: page.primary_color }}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-bold text-white">{renderSalesText(quantity)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-105"
                  style={{ background: page.primary_color }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
  );

  const variationBlock = showVariations && variations.length > 0 ? (
               <div className="checkout-variation px-4 py-3 border-b border-white/10">
               <VariationSelector
                 variations={variations}
                 variationType={variations[0]?.variation_type || "size"}
                 selected={selectedVariations}
                 onSelect={setSelectedVariations}
                 primaryColor={page.primary_color}
                 accentColor={page.accent_color}
                 priceUnit={page.price_unit}
                  labels={{ size: text("variationSize", "সাইজ বাছুন"), color: text("variationColor", "রঙ বাছুন"), pack: text("variationPack", "প্যাক বাছুন"), custom: text("variationCustom", "অপশন বাছুন") }}
               />
             </div>
  ) : null;

  // Payment method block — in the minimal design (02) it renders below the coupon field
  const paymentSection = (
            <div className="space-y-1.5">
              <Label className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" style={{ color: page.accent_color }} />
                 {renderSalesText(text("paymentLabel", "পেমেন্ট মেথড"))}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                   data-selected={paymentMethod === "cod"}
                  className={cn(
                     "checkout-payment-option py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-1.5",
                    paymentMethod === "cod"
                      ? "text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                  style={paymentMethod === "cod" ? {
                    background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`,
                    borderColor: 'transparent'
                  } : {}}
                >
                  <Wallet className="h-3.5 w-3.5" />
                   {renderSalesText(text("cod", "ক্যাশ অন ডেলিভারি"))}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                   data-selected={paymentMethod === "online"}
                  className={cn(
                     "checkout-payment-option py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-1.5",
                    paymentMethod === "online"
                      ? "text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                  style={paymentMethod === "online" ? {
                    background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`,
                    borderColor: 'transparent'
                  } : {}}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                   {renderSalesText(text("online", "অনলাইন পেমেন্ট"))}
                </button>
              </div>
              {renderSalesText(paymentMethod === "online" && (
                <div className="checkout-summary rounded-xl p-3 space-y-3 mt-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {renderSalesText(onlineNumbers.length === 0 ? (
                     <p className="text-xs text-white/70">{renderSalesText(text("noPaymentNumber", "অনলাইন পেমেন্ট নাম্বার এখনো যোগ করা হয়নি।"))}</p>
                  ) : (
                    <>
                       <p className="text-xs text-white/70">{renderSalesText(text("paymentInstruction", "নিচের যেকোনো নাম্বারে মোট"))} {renderSalesText(page.price_unit)}{renderSalesText(total)} {renderSalesText(text("paymentInstructionEnd", "Send Money করুন, তারপর তথ্য দিন:"))}</p>
                        {renderSalesText((() => {
                          const active = onlineNumbers.find((n) => n.key === onlineProvider) || onlineNumbers[0];
                          return (
                            <>
                              <div className="flex gap-1.5 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                {renderSalesText(onlineNumbers.map((n) => (
                                  <button
                                    key={n.key}
                                    type="button"
                                    onClick={() => setOnlineProvider(n.key)}
                                    data-selected={active?.key === n.key}
                                    className={cn(
                                      "checkout-provider-tab flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200",
                                      active?.key === n.key
                                        ? "text-white shadow-sm"
                                        : "text-white/60 hover:text-white"
                                    )}
                                    style={active?.key === n.key ? {
                                      background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`
                                    } : {}}
                                  >
                                     {renderSalesText(text(n.key as "bkash" | "nagad" | "rocket", n.label))}
                                  </button>
                                )))}
                              </div>
                              {renderSalesText(active && (
                                <div
                                  className="flex items-center justify-between rounded-lg px-3 py-2.5"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                  <div className="min-w-0">
                                     <p className="text-[10px] text-white/50 leading-tight">{renderSalesText(text(active.key as "bkash" | "nagad" | "rocket", active.label))} {renderSalesText(text("accountDetail", "(পার্সোনাল) — Send Money"))}</p>
                                    <p className="font-mono text-sm font-bold text-white tracking-wider">{renderSalesText(active.number)}</p>
                                  </div>
                                  <button
                                    type="button"
                                     onClick={() => { navigator.clipboard?.writeText(active.number); toast.success(text("copySuccess", "নাম্বার কপি হয়েছে")); }}
                                    className="checkout-provider-copy shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95"
                                    style={{ background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})` }}
                                  >
                                     {renderSalesText(text("copy", "কপি"))}
                                  </button>
                                </div>
                              ))}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                   <Label className="text-white/80 text-xs">{renderSalesText(text("senderLabel", "সেন্ডার"))} {renderSalesText(text(active.key as "bkash" | "nagad" | "rocket", active.label))} {renderSalesText(text("senderSuffix", "নাম্বার"))}</Label>
                                   <Input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))} placeholder={salesPlainText(text("senderPlaceholder", "01XXXXXXXXX"))} inputMode="numeric" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-white/80 text-xs">{renderSalesText(text("transactionLabel", "ট্রানজেকশন আইডি (TrxID)"))}</Label>
                                   <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 30))} placeholder={salesPlainText(text("transactionPlaceholder", "যেমন: 8N7A6D5X2K"))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                                </div>
                              </div>
                            </>
                          );
                        })())}
                    </>
                  ))}
                </div>
              ))}
            </div>
  );

  return (
    <section id="checkout" data-checkout-design={checkoutDesign} data-checkout-spacing={hasCheckoutSpacing(page.template_styles?.checkout) ? 'custom' : undefined} style={{ ...checkoutColors } as React.CSSProperties} className={cn("sales-checkout pt-4 pb-8 md:pt-6 md:pb-12 bg-slate-950 relative", ...checkoutColorClasses)}>
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: page.primary_color }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="checkout-container relative max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto"
        style={checkoutSpacingStyle(page.template_styles?.checkout)}
      >
        {/* Card */}
        <div 
          className="checkout-card rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header - Compact */}
          <div 
            className="checkout-heading px-4 py-4 text-center"
            style={{
              background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`
            }}
          >
            <h2 className="checkout-title text-xl font-bold text-white">
               {renderSalesText(text("title", "অর্ডার করুন"))}
            </h2>
            <p className="checkout-urgency text-white/80 text-xs flex items-center justify-center gap-1.5 mt-1">
              <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
               {renderSalesText(text("urgency", page.cta_urgency_text))}
            </p>
          </div>

          {renderSalesText(!productsBelowPayment && !productsBelowArea && productBlock)}

          {renderSalesText(!productsBelowPayment && !productsBelowArea && variationBlock)}
 
          {/* Form - Compact */}
          <form onSubmit={handleSubmit} className="checkout-form p-4 space-y-3">
            {/* Duplicate Order Block Alert */}
            {renderSalesText(isBlocked && (
              <DuplicateOrderBlockAlert
                message={blockInfo.message}
                whatsappNumber={blockInfo.whatsappNumber}
                productName={product?.name_bn || product?.name || page.title}
              />
            ))}

            <div className="checkout-name-field space-y-1">
              <Label htmlFor="name" className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide">
                 {renderSalesText(text("nameLabel", "আপনার নাম"))}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                 placeholder={salesPlainText(text("namePlaceholder", "আপনার পুরো নাম"))}
                required
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg text-sm focus:border-white/30 focus:ring-0"
              />
            </div>

            <div className="checkout-phone-field space-y-1">
              <Label htmlFor="phone" className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide">
                 {renderSalesText(text("phoneLabel", "মোবাইল নম্বর"))}
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                   placeholder={salesPlainText(text("phonePlaceholder", "01XXXXXXXXX"))}
                  required
                  className={cn(
                    "h-10 bg-white/5 text-white placeholder:text-white/40 rounded-lg text-sm focus:ring-0 pr-10",
                    phoneValidation === null 
                      ? "border-white/10 focus:border-white/30"
                      : phoneValidation.isValid 
                        ? "border-green-500/50 focus:border-green-500"
                        : "border-red-500/50 focus:border-red-500"
                  )}
                />
                {renderSalesText(phoneValidation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {renderSalesText(phoneValidation.isValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ))}
                  </div>
                ))}
              </div>
              {renderSalesText(phoneValidation && !phoneValidation.isValid && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {renderSalesText(phoneValidation.message)}
                </p>
              ))}
            </div>

            {checkoutExtraFields.some(field => field.key !== 'additionalInfo' && isCheckoutExtraFieldEnabled(page.template_styles?.checkout, field.key)) && <div className="checkout-extra-fields">
              <div className="checkout-extra-field-pair grid grid-cols-2 gap-2">
                {checkoutExtraFields.filter(field => field.key !== 'additionalInfo' && isCheckoutExtraFieldEnabled(page.template_styles?.checkout, field.key)).map(field => (
                  <div key={field.key} className="space-y-1 min-w-0">
                    <Label htmlFor={`checkout-${field.key}`} className="checkout-field-label text-sm font-semibold">{renderSalesText(text(`${field.key}Label`, field.label))}</Label>
                    <Input id={`checkout-${field.key}`} name={field.key} value={formData[field.key]} onChange={handleInputChange} maxLength={120} placeholder={salesPlainText(text(`${field.key}Placeholder`, field.placeholder))} className="checkout-extra-input h-10 rounded-lg text-sm" />
                  </div>
                ))}
              </div>
            </div>}

            <div className="space-y-1">
              <Label htmlFor="address" className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <MapPin className="h-4 w-4" style={{ color: page.accent_color }} />
                 {renderSalesText(text("addressLabel", "সম্পূর্ণ ঠিকানা"))}
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                 placeholder={salesPlainText(text("addressPlaceholder", "বাড়ি নং, রোড, এলাকা, থানা"))}
                required
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg text-sm focus:border-white/30 focus:ring-0"
              />
            </div>

            {isCheckoutExtraFieldEnabled(page.template_styles?.checkout, 'additionalInfo') && <div className="checkout-extra-fields">
              <div className="space-y-1">
                <Label htmlFor="checkout-additionalInfo" className="checkout-field-label text-sm font-semibold">{renderSalesText(text('additionalInfoLabel', 'অতিরিক্ত কোনো তথ্য'))}</Label>
                <Input id="checkout-additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} maxLength={1000} placeholder={salesPlainText(text('additionalInfoPlaceholder', 'অতিরিক্ত কোনো তথ্য থাকলে লিখুন'))} className="checkout-extra-input h-10 rounded-lg text-sm" />
              </div>
            </div>}

            {/* Delivery Area - Compact */}
            <div className="space-y-1.5">
              <Label className="checkout-field-label text-white/80 text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <Truck className="h-4 w-4" style={{ color: page.accent_color }} />
                 {renderSalesText(text("areaLabel", "ডেলিভারি এলাকা"))}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {renderSalesText(["ঢাকার ভিতরে", "ঢাকার বাইরে"].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, city: area }))}
                     data-selected={formData.city === area}
                    className={cn(
                       "checkout-area-option py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                      formData.city === area
                        ? "text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    )}
                    style={formData.city === area ? { 
                      background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`,
                      borderColor: 'transparent'
                    } : {}}
                  >
                     {renderSalesText(area === "ঢাকার ভিতরে" ? text("insideDhaka", area) : text("outsideDhaka", area))}
                  </button>
                )))}
              </div>
            </div>

            {renderSalesText(productsBelowArea && productBlock)}

            {renderSalesText(productsBelowArea && variationBlock)}

            {renderSalesText(!productsBelowPayment && paymentSection)}

            {renderSalesText(productsBelowPayment && productBlock)}

            {renderSalesText(productsBelowPayment && variationBlock)}

            {/* Coupon Field */}
            {renderSalesText(couponEnabled && (
            <CouponField
              cartTotal={subtotal}
              onApply={setAppliedCoupon}
              appliedCoupon={appliedCoupon}
              accentColor={page.accent_color || '#f472b6'}
               labels={{ title: text("couponLabel", "কুপন কোড আছে?"), placeholder: text("couponPlaceholder", "কুপন কোড লিখুন"), apply: text("couponApply", "প্রয়োগ"), freeShipping: text("couponFreeShipping", "ফ্রি শিপিং! 🚚"), discount: text("couponDiscount", "ছাড়:"), invalid: text("couponInvalid", "কুপন কোডটি অবৈধ বা ইতিমধ্যে ব্যবহৃত"), error: text("couponError", "কুপন চেক করতে সমস্যা হয়েছে") }}
              />
            ))}

            {renderSalesText(productsBelowPayment && paymentSection)}

            <div className="checkout-order-panel">
             {/* Order Summary - Compact */}
            <div 
              className="checkout-summary rounded-xl p-3 space-y-2"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex justify-between text-white/70 text-sm">
                 <span>{renderSalesText(text("subtotal", "সাবটোটাল:"))}</span>
                <span className="font-medium text-white">{renderSalesText(page.price_unit)}{renderSalesText(subtotal)}</span>
              </div>
              {renderSalesText(couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                   <span className="text-emerald-400">{renderSalesText(text("couponSavings", "কুপন ছাড়:"))}</span>
                  <span className="font-medium text-emerald-400">-{renderSalesText(page.price_unit)}{renderSalesText(couponDiscount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-white/70 text-sm">
                 <span>{renderSalesText(text("deliveryCharge", "ডেলিভারি চার্জ:"))}</span>
                <span className="font-medium text-white">
                  {renderSalesText(effectiveShipping === 0 ? (
                     <span className="text-green-400">{renderSalesText(text("free", "ফ্রি"))}</span>
                  ) : (
                    `${page.price_unit}${effectiveShipping}`
                  ))}
                </span>
              </div>
              <div 
                className="flex justify-between font-bold text-base pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
              >
                  <span className="checkout-total-label text-white">{renderSalesText(text("total", "মোট:"))}</span>
                 <span className="checkout-total-value" style={{ color: page.accent_color }}>
                  {renderSalesText(page.price_unit)}{renderSalesText(total)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isBlocked}
               className="checkout-submit w-full h-11 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-white"
              style={{ 
                background: `linear-gradient(135deg, ${page.primary_color}, ${page.accent_color})`,
                boxShadow: `0 10px 25px -8px ${page.primary_color}50`,
                opacity: isBlocked ? 0.5 : 1
              }}
            >
              {renderSalesText(isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   {renderSalesText(text("processing", "প্রসেস হচ্ছে..."))}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                   {renderSalesText(text("submit", "অর্ডার কনফার্ম করুন"))}
                </span>
              ))}
            </Button>

             <p className="checkout-footer-text text-xs text-center text-white/50">
              {renderSalesText(paymentMethod === "cod" 
                 ? text("codFooter", "📦 পণ্য হাতে পেয়ে পেমেন্ট করুন")
                 : text("onlineFooter", "💳 টাকা পাঠিয়ে নাম্বার ও TrxID দিয়ে অর্ডার কনফার্ম করুন"))
              }
            </p>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default CheckoutSection;
