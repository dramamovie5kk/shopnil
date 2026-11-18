import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/integrations/cloudflare/client";

interface OrderDetails {
  id: string;
  total_amount: number;
  payment_method: string;
  notes?: string | null;
  customer_address?: string;
  customer_city?: string;
  product_name?: string;
  quantity?: number;
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [supportPhone, setSupportPhone] = useState("01XXXXXXXXX");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const { data: order } = await api
          .from("orders")
          .select("id, total_amount, payment_method, notes, customer_address, customer_city")
          .eq("id", orderId)
          .single();

        const { data: items } = await api
          .from("order_items")
          .select("product_name, quantity")
          .eq("order_id", orderId)
          .limit(1)
          .single();

        if (order) {
          setOrderDetails({
            ...order,
            product_name: items?.product_name,
            quantity: items?.quantity,
          });
        }

        const { data: settings } = await api
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "support_phone")
          .single();

        if (settings?.setting_value) setSupportPhone(settings.setting_value);
      } catch (e) {
        console.error("Error fetching order:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const formatOrderId = (id: string) => {
    const hash = id.replace(/-/g, "").slice(-6);
    const num = parseInt(hash, 16) % 1000;
    return `#${num.toString().padStart(3, "0")}`;
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod": return "Cash on Delivery";
      case "bkash": return "bKash";
      case "nagad": return "Nagad";
      case "rocket": return "Rocket";
      case "online": return "Online Payment";
      default: return method;
    }
  };

  const parseNotes = (notes?: string | null) => {
    if (!notes) return { sender: "", trxId: "" };
    const sender = notes.match(/সেন্ডার:\s*([^\s|]+)/)?.[1] || "";
    const trxId = notes.match(/TrxID:\s*([^\s|]+)/)?.[1] || "";
    return { sender, trxId };
  };

  const parseAddress = (addr?: string) => {
    if (!addr) return { address: "", thana: "", district: "" };
    const thana = addr.match(/থানা:\s*([^,]+)/)?.[1]?.trim() || "";
    const district = addr.match(/জেলা:\s*([^,]+)/)?.[1]?.trim() || "";
    const address = addr.split(/,\s*থানা:/)[0].trim();
    return { address, thana, district };
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
          <div className="text-6xl mb-5" style={{ color: '#f1c40f' }}>✔</div>
          <h1 className="text-3xl font-bold mb-2 uppercase" style={{ color: '#f1c40f' }}>অভিনন্দন!</h1>
          <p className="text-lg font-semibold mb-5" style={{ color: '#e0e0e0' }}>আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#ccc' }}>
            আপনার অর্ডারটি আমরা সফলভাবে গ্রহণ করেছি এবং শীঘ্রই প্রসেস করা হবে। আমাদের টিম পণ্যটি আপনার কাছে পৌঁছে দেওয়ার জন্য কাজ করবে।
          </p>

          {orderDetails && (
            <div className="rounded-xl p-6 text-left my-5" style={{ background: '#432c7a', border: '1px dashed #6b52a3' }}>
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
              {(() => {
                const { sender, trxId } = parseNotes(orderDetails.notes);
                return (
                  <>
                    {sender && (
                      <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>সেন্ডার নাম্বার:</span>
                        <span className="font-bold text-white">{sender}</span>
                      </div>
                    )}
                    {trxId && (
                      <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>ট্রানজেকশন আইডি:</span>
                        <span className="font-bold text-white">{trxId}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              {(() => {
                const { address, thana, district } = parseAddress(orderDetails.customer_address);
                return (
                  <>
                    {address && (
                      <div className="flex justify-between py-3 gap-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>ঠিকানা:</span>
                        <span className="font-bold text-white text-right">{address}</span>
                      </div>
                    )}
                    {thana && (
                      <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>থানা:</span>
                        <span className="font-bold text-white">{thana}</span>
                      </div>
                    )}
                    {district && (
                      <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>জেলা:</span>
                        <span className="font-bold text-white">{district}</span>
                      </div>
                    )}
                    {orderDetails.customer_city && (
                      <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #5e4399' }}>
                        <span style={{ color: '#ddd' }}>শহর:</span>
                        <span className="font-bold text-white">{orderDetails.customer_city}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex justify-between py-3">
                <span style={{ color: '#ddd' }}>সর্বমোট:</span>
                <span className="font-bold text-lg" style={{ color: '#f1c40f' }}>৳ {orderDetails.total_amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl p-4 text-center font-bold mt-6" style={{ background: '#3b256b' }}>
            <span style={{ color: '#ddd' }}>যেকোনো প্রয়োজনে কল করুন:</span>
            <a href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`} className="block mt-1 text-xl no-underline" style={{ color: '#f1c40f' }}>
              ☎ {supportPhone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
