import { useState } from "react";
import { Loader2, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CourierSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    total_amount: number;
    notes?: string;
    courier_id?: string;
    courier_tracking_code?: string;
  } | null;
}

const CourierSendDialog = ({ open, onOpenChange, order }: CourierSendDialogProps) => {
  const [sending, setSending] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSendToCourier = async (courier: "steadfast" | "pathao") => {
    if (!order) return;

    setSending(courier);
    try {
      const { data, error } = await api.functions.invoke("send-to-courier", {
        body: {
          orderId: order.id,
          courier,
          recipientName: order.customer_name,
          recipientPhone: order.customer_phone,
          recipientAddress: order.customer_address,
          recipientCity: order.customer_city,
          codAmount: order.total_amount,
          note: order.notes || "",
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || `অর্ডার ${courier.toUpperCase()}-এ পাঠানো হয়েছে`);
        if (data.trackingCode) {
          toast.info(`ট্র্যাকিং কোড: ${data.trackingCode}`);
        }
        queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
        onOpenChange(false);
      } else {
        throw new Error(data.error || "কুরিয়ারে পাঠাতে ব্যর্থ");
      }
    } catch (error) {
      console.error("Error sending to courier:", error);
      toast.error(error instanceof Error ? error.message : "কুরিয়ারে পাঠাতে সমস্যা হয়েছে");
    } finally {
      setSending(null);
    }
  };

  if (!order) return null;

  const alreadySent = !!order.courier_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            কুরিয়ারে পাঠান
          </DialogTitle>
          <DialogDescription>
            অর্ডার #{order.id.slice(0, 8).toUpperCase()} কুরিয়ারে পাঠাতে নিচের অপশন থেকে বেছে নিন।
          </DialogDescription>
        </DialogHeader>

        {alreadySent ? (
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-muted-foreground">
              এই অর্ডার ইতিমধ্যে <strong className="text-foreground uppercase">{order.courier_id}</strong>-এ পাঠানো হয়েছে।
            </p>
            {order.courier_tracking_code && (
              <p className="mt-2">
                ট্র্যাকিং কোড: <strong className="text-primary">{order.courier_tracking_code}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>গ্রাহক:</strong> {order.customer_name}</p>
              <p><strong>ফোন:</strong> {order.customer_phone}</p>
              <p><strong>ঠিকানা:</strong> {order.customer_address}, {order.customer_city}</p>
              <p><strong>COD:</strong> ৳{order.total_amount}</p>
            </div>

            {/* Courier Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSendToCourier("steadfast")}
                disabled={sending !== null}
                className="h-auto py-4 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600"
              >
                {sending === "steadfast" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Package className="h-6 w-6" />
                )}
                <span className="font-bold">স্টেডফাস্ট</span>
                <span className="text-xs opacity-80">Steadfast Courier</span>
              </Button>

              <Button
                onClick={() => handleSendToCourier("pathao")}
                disabled={sending !== null}
                className="h-auto py-4 flex flex-col gap-2 bg-red-500 hover:bg-red-600"
              >
                {sending === "pathao" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Truck className="h-6 w-6" />
                )}
                <span className="font-bold">পাঠাও</span>
                <span className="text-xs opacity-80">Pathao Courier</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              কুরিয়ার API সেটআপ করতে <strong>সেটিংস → কুরিয়ার API</strong> যান
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourierSendDialog;
