import { useState, useEffect } from "react";
import { Plus, Minus, Search, Loader2, Phone, Percent, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types";

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

type DiscountType = "none" | "percentage" | "fixed";

const ManualOrderDialog = ({ open, onOpenChange }: ManualOrderDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Discount state
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [customShipping, setCustomShipping] = useState<string>("");
  const [defaultShippingSettings, setDefaultShippingSettings] = useState({
    inside: 60,
    outside: 120,
  });

  useEffect(() => {
    const fetchShippingSettings = async () => {
      const { data } = await api
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "default_shipping_inside_dhaka",
          "default_shipping_outside_dhaka",
        ]);

      if (data) {
        const settings = { inside: 60, outside: 120 };
        data.forEach((item: any) => {
          if (item.setting_key === "default_shipping_inside_dhaka") {
            settings.inside = Number(item.setting_value) || 60;
          }
          if (item.setting_key === "default_shipping_outside_dhaka") {
            settings.outside = Number(item.setting_value) || 120;
          }
        });
        setDefaultShippingSettings(settings);
      }
    };
    fetchShippingSettings();
  }, []);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "ঢাকা",
    notes: "",
  });

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const { data, error } = await api
        .from("products")
        .select("*")
        .order("name_bn");

      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name_bn.includes(productSearch)
  );

  const addProduct = (product: Product) => {
    const existing = orderItems.find((item) => item.product.id === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }]);
    }
    setProductSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const defaultShipping =
    customerInfo.city === "ঢাকা"
      ? defaultShippingSettings.inside
      : defaultShippingSettings.outside;
  const shippingCost =
    customShipping !== "" && !isNaN(Number(customShipping))
      ? Number(customShipping)
      : defaultShipping;
  
  // Calculate discount
  const calculateDiscount = () => {
    if (discountType === "none" || discountValue <= 0) return 0;
    if (discountType === "percentage") {
      return Math.round((subtotal * Math.min(discountValue, 100)) / 100);
    }
    return Math.min(discountValue, subtotal);
  };
  
  const discountAmount = calculateDiscount();
  const total = subtotal - discountAmount + shippingCost;

  const handleSubmit = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error("গ্রাহকের তথ্য দিন");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("অন্তত একটি প্রোডাক্ট যোগ করুন");
      return;
    }

    setSaving(true);

    try {
      // Build notes with discount info
      let orderNotes = customerInfo.notes || "";
      if (discountAmount > 0) {
        const discountInfo = discountType === "percentage" 
          ? `ডিস্কাউন্ট: ${discountValue}% (৳${discountAmount})`
          : `ডিস্কাউন্ট: ৳${discountAmount}`;
        orderNotes = orderNotes ? `${orderNotes}\n${discountInfo}` : discountInfo;
      }

      // Create order
      const { data: order, error: orderError } = await api
        .from("orders")
        .insert({
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          customer_city: customerInfo.city,
          notes: orderNotes || null,
          total_amount: total,
          shipping_cost: shippingCost,
          payment_method: "cod",
          status: "pending",
          user_id: null,
          order_source: "manual",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name_bn,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await api
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Log the order creation
      const logNotes = discountAmount > 0 
        ? `ফোনে অর্ডার নেওয়া হয়েছে (ডিস্কাউন্ট: ৳${discountAmount})`
        : "ফোনে অর্ডার নেওয়া হয়েছে";
        
      await api.from("order_logs").insert({
        order_id: order.id,
        action: "manual_order_created",
        notes: logNotes,
        performed_by: user?.id,
      });

      toast.success("অর্ডার তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      
      // Reset form
      setOrderItems([]);
      setDiscountType("none");
      setDiscountValue(0);
      setCustomShipping("");
      setCustomerInfo({
        name: "",
        phone: "",
        address: "",
        city: "ঢাকা",
        notes: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "অর্ডার তৈরি ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            ফোনে অর্ডার নিন
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-medium">গ্রাহকের তথ্য</h3>
            <div className="space-y-3">
              <div>
                <Label>নাম *</Label>
                <Input
                  placeholder="গ্রাহকের নাম"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>ফোন নম্বর *</Label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>ঠিকানা *</Label>
                <Textarea
                  placeholder="সম্পূর্ণ ঠিকানা"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, address: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>শহর</Label>
                <Select
                  value={customerInfo.city}
                  onValueChange={(value) =>
                    setCustomerInfo({ ...customerInfo, city: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ঢাকা">ঢাকা (৳{defaultShippingSettings.inside})</SelectItem>
                    <SelectItem value="ঢাকার বাইরে">ঢাকার বাইরে (৳{defaultShippingSettings.outside})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>কাস্টম শিপিং চার্জ (অপশনাল)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder={`ডিফল্ট: ৳${defaultShipping}`}
                    value={customShipping}
                    onChange={(e) => setCustomShipping(e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ৳
                  </span>
                </div>
              </div>
              <div>
                <Label>নোট</Label>
                <Textarea
                  placeholder="অতিরিক্ত তথ্য (অপশনাল)"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-medium">প্রোডাক্ট যোগ করুন</h3>

            {/* Product Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Product List Box - Always visible, scrollable */}
            <div className="border rounded-lg bg-secondary/20 max-h-48 md:max-h-56 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">
                  কোনো প্রোডাক্ট পাওয়া যায়নি
                </p>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const isAdded = orderItems.some(item => item.product.id === product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className={`w-full flex items-center gap-2 p-2 hover:bg-secondary/50 text-left transition-colors ${
                          isAdded ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name_bn}</p>
                          <p className="text-xs text-primary">৳{product.price}</p>
                        </div>
                        {isAdded && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            যোগ হয়েছে
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Items */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {orderItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  কোনো প্রোডাক্ট যোগ করা হয়নি
                </p>
              ) : (
                orderItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name_bn}</p>
                      <p className="text-sm text-muted-foreground">
                        ৳{item.product.price} × {item.quantity} = ৳
                        {item.product.price * item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount Section */}
            {orderItems.length > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
                <Label className="flex items-center gap-2">
                  <BadgeDollarSign className="h-4 w-4" />
                  ডিস্কাউন্ট দিন
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={discountType}
                    onValueChange={(value: DiscountType) => {
                      setDiscountType(value);
                      setDiscountValue(0);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">কোনো ডিস্কাউন্ট নেই</SelectItem>
                      <SelectItem value="percentage">
                        <span className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          পার্সেন্টেজ (%)
                        </span>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <span className="flex items-center gap-1">
                          <BadgeDollarSign className="h-3 w-3" />
                          ফিক্সড (৳)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {discountType !== "none" && (
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        max={discountType === "percentage" ? 100 : subtotal}
                        placeholder={discountType === "percentage" ? "%" : "৳"}
                        value={discountValue || ""}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {discountType === "percentage" ? "%" : "৳"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">সাবটোটাল</span>
                  <span>৳{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      ডিস্কাউন্ট {discountType === "percentage" ? `(${discountValue}%)` : ""}
                    </span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">শিপিং</span>
                  <span>৳{shippingCost}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>মোট</span>
                  <span className="text-primary">৳{total}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || orderItems.length === 0}
            className="bg-gradient-brand"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            অর্ডার তৈরি করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrderDialog;
