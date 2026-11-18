import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/integrations/cloudflare/client";

interface OrderDetails {
  id: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  product_name?: string;
  quantity?: number;
  product_price?: number;
}

const SalesPageOrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [supportPhone, setSupportPhone] = useState("01XXXXXXXXX");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data: order, error: orderError } = await api
          .from("orders")
          .select("id, customer_name, total_amount, payment_method")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;

        const { data: items } = await api
          .from("order_items")
          .select("product_name, quantity, product_price")
          .eq("order_id", orderId)
          .limit(1)
          .single();

        if (items) {
          setOrderDetails({
            ...order,
            product_name: items.product_name,
            quantity: items.quantity,
            product_price: items.product_price,
          });
        } else {
          setOrderDetails(order);
        }

        const { data: settings } = await api
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "support_phone")
          .single();

        if (settings?.setting_value) {
          setSupportPhone(settings.setting_value);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod": return "Cash on Delivery";
      case "bkash": return "বিকাশ (অনলাইন)";
      case "nagad": return "নগদ (অনলাইন)";
      case "rocket": return "রকেট (অনলাইন)";
      default: return method;
    }
  };

  const formatOrderId = (id: string) => {
    const hash = id.replace(/-/g, "").slice(-6);
    const num = parseInt(hash, 16) % 1000;
    return `#${num.toString().padStart(3, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0f36, #2e1a5b, #1a0f36)' }}>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a0f36, #2e1a5b, #1a0f36)' }}>
      <div className="w-full max-w-[600px]">
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
                <span className="font-bold text-white">{formatOrderId(orderDetails.id)}</span>
              </div>
              {orderDetails.product_name && (
                <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                  <span style={{ color: '#ddd' }}>প্রোডাক্ট:</span>
                  <span className="font-bold text-white text-right max-w-[250px] truncate">
                    {orderDetails.quantity && orderDetails.quantity > 1 ? `${orderDetails.quantity}x ` : ""}
                    {orderDetails.product_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                <span style={{ color: '#ddd' }}>পেমেন্ট মেথড:</span>
                <span className="font-bold text-white">{getPaymentMethodLabel(orderDetails.payment_method)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span style={{ color: '#ddd' }}>সর্বমোট:</span>
                <span className="font-bold text-lg" style={{ color: '#f1c40f' }}>৳ {orderDetails.total_amount.toFixed(2)}</span>
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
              href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`}
              className="block mt-1 text-xl no-underline"
              style={{ color: '#f1c40f' }}
            >
              ☎ {supportPhone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPageOrderSuccess;