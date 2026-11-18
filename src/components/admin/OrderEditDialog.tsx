import { useState, useEffect } from "react";
import { Loader2, Save, Pencil, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  variation_name?: string;
}

interface OrderEditDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const cityOptions = [
  "ঢাকার ভিতরে",
  "ঢাকার বাইরে",
];

const OrderEditDialog = ({ order, open, onOpenChange, onUpdate }: OrderEditDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // Order fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order && open) {
      setCustomerName(order.customer_name || "");
      setCustomerPhone(order.customer_phone || "");
      setCustomerAddress(order.customer_address || "");
      setCustomerCity(order.customer_city || "");
      setShippingCost(order.shipping_cost || 0);
      setNotes(order.notes || "");
      loadOrderItems();
    }
  }, [order, open]);

  const loadOrderItems = async () => {
    if (!order?.id) return;
    setLoadingItems(true);
    
    const { data, error } = await api
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (error) {
      toast.error("আইটেম লোড করতে সমস্যা হয়েছে");
    } else {
      setOrderItems(data || []);
    }
    setLoadingItems(false);
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
    return itemsTotal + shippingCost;
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        id: `new-${Date.now()}`,
        product_name: "",
        product_price: 0,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!order?.id) return;
    
    // Validation
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("কমপক্ষে একটি আইটেম থাকতে হবে");
      return;
    }

    setSaving(true);

    try {
      const newTotal = calculateTotal();

      // Update order
      const { error: orderError } = await api
        .from("orders")
        .update({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          customer_city: customerCity,
          shipping_cost: shippingCost,
          notes: notes,
          total_amount: newTotal,
        })
        .eq("id", order.id);

      if (orderError) throw orderError;

      // Delete existing items
      await api.from("order_items").delete().eq("order_id", order.id);

      // Insert updated items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        variation_name: item.variation_name || null,
      }));

      const { error: itemsError } = await api
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Log the edit
      await api.from("order_logs").insert({
        order_id: order.id,
        action: "order_edited",
        notes: "অর্ডার এডিট করা হয়েছে",
        performed_by: user?.id,
      });

      toast.success("অর্ডার আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      onUpdate?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error("সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            অর্ডার এডিট #{order?.id?.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">গ্রাহক তথ্য</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">নাম</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="গ্রাহকের নাম"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ফোন</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">ঠিকানা</label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="পূর্ণ ঠিকানা"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">শহর</label>
                <Select value={customerCity} onValueChange={setCustomerCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="শহর নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">শিপিং খরচ</label>
                <Input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  placeholder="০"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">অর্ডার আইটেম</h4>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                আইটেম যোগ
              </Button>
            </div>

            {loadingItems ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="col-span-5">
                      <Input
                        value={item.product_name}
                        onChange={(e) => handleItemChange(index, "product_name", e.target.value)}
                        placeholder="প্রোডাক্টের নাম"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={item.product_price}
                        onChange={(e) => handleItemChange(index, "product_price", Number(e.target.value))}
                        placeholder="দাম"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                        placeholder="পরিমাণ"
                        min={1}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">নোট</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="অতিরিক্ত নোট (ঐচ্ছিক)"
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
            <span className="font-medium">মোট</span>
            <span className="text-2xl font-bold text-primary">৳{calculateTotal()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              বাতিল
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
