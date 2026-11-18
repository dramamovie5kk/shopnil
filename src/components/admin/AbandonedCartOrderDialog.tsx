import { useState, useEffect } from "react";
import { Loader2, Trash2, Plus, Minus, Search, Percent, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/integrations/cloudflare/client";
import { useProducts } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Product } from "@/types";

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface CartData {
  items: CartItem[];
  total: number;
  form?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
}

interface AbandonedCart {
  id: string;
  session_id: string | null;
  customer_phone: string | null;
  checkout_step: string | null;
  cart_data: CartData | null;
  created_at: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface AbandonedCartOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abandonedCart: AbandonedCart | null;
}

const AbandonedCartOrderDialog = ({
  open,
  onOpenChange,
  abandonedCart,
}: AbandonedCartOrderDialogProps) => {
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  
  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [notes, setNotes] = useState("");
  
  // Discount
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");

  // Initialize from abandoned cart
  useEffect(() => {
    if (abandonedCart && open) {
      const cartData = abandonedCart.cart_data;
      const form = cartData?.form;
      
      // Set customer info
      setCustomerName(form?.name || "");
      setCustomerPhone(abandonedCart.customer_phone || form?.phone || "");
      setCustomerAddress(form?.address || "");
      setCustomerCity(form?.city || "");
      
      // Set cart items
      if (cartData?.items && cartData.items.length > 0) {
        const items: OrderItem[] = [];
        cartData.items.forEach((cartItem) => {
          const product = products.find(p => p.id === cartItem.product_id);
          if (product) {
            items.push({
              product,
              quantity: cartItem.quantity,
            });
          }
        });
        setOrderItems(items);
      }
      
      // Reset discount
      setDiscountType("percentage");
      setDiscountValue("");
      setNotes("");
    }
  }, [abandonedCart, open, products]);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = discountValue
    ? discountType === "percentage"
      ? (subtotal * parseFloat(discountValue)) / 100
      : parseFloat(discountValue)
    : 0;

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const filteredProducts = products.filter(
    (product) =>
      product.name_bn.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.name.toLowerCase().includes(productSearch.toLowerCase())
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
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeProduct(productId);
      return;
    }
    setOrderItems(
      orderItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeProduct = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.product.id !== productId));
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !customerAddress || !customerCity) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("অন্তত একটি প্রোডাক্ট যোগ করুন");
      return;
    }

    setLoading(true);

    try {
      // Build notes with discount info
      let orderNotes = notes || "";
      if (discountAmount > 0) {
        const discountInfo = discountType === "percentage" 
          ? `${discountValue}% ডিসকাউন্ট (৳${discountAmount.toFixed(0)})`
          : `৳${discountValue} ডিসকাউন্ট`;
        orderNotes = orderNotes 
          ? `${orderNotes}\n${discountInfo}` 
          : discountInfo;
      }
      orderNotes = orderNotes 
        ? `${orderNotes}\n(অসম্পূর্ণ অর্ডার থেকে তৈরি)` 
        : "(অসম্পূর্ণ অর্ডার থেকে তৈরি)";

      // Create order
      const { data: order, error: orderError } = await api
        .from("orders")
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          customer_city: customerCity,
          total_amount: total,
          shipping_cost: shippingCost,
          payment_method: "cod",
          notes: orderNotes,
          status: "pending",
          order_source: "abandoned_cart",
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

      // Create order log
      await api.from("order_logs").insert({
        order_id: order.id,
        action: "order_created",
        new_status: "pending",
        notes: `অসম্পূর্ণ অর্ডার থেকে তৈরি${discountAmount > 0 ? ` - ${discountType === "percentage" ? `${discountValue}%` : `৳${discountValue}`} ডিসকাউন্ট দেওয়া হয়েছে` : ""}`,
      });

      // Delete abandoned cart
      if (abandonedCart) {
        await api
          .from("abandoned_carts")
          .delete()
          .eq("id", abandonedCart.id);
      }

      toast.success("অর্ডার সফলভাবে তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["abandonedCarts"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      onOpenChange(false);
      
      // Reset form
      setOrderItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerCity("");
      setNotes("");
      setDiscountValue("");
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error("অর্ডার তৈরিতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>অসম্পূর্ণ অর্ডার থেকে অর্ডার তৈরি</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-medium">কাস্টমার তথ্য</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>নাম *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="কাস্টমারের নাম"
                />
              </div>
              <div className="space-y-2">
                <Label>ফোন *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ঠিকানা *</Label>
              <Textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="সম্পূর্ণ ঠিকানা"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>শহর *</Label>
              <Input
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="ঢাকা"
              />
            </div>
          </div>

          <Separator />

          {/* Product Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">প্রোডাক্ট</h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Product List Box */}
            <div className="border rounded-lg bg-secondary/20 max-h-40 overflow-y-auto">
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
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">📦</span>
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

            {/* Selected Products */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">নির্বাচিত প্রোডাক্ট:</p>
                {orderItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name_bn}</p>
                        <p className="text-xs text-muted-foreground">৳{item.product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeProduct(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Discount */}
          <div className="space-y-4">
            <h3 className="font-medium">ডিসকাউন্ট (ঐচ্ছিক)</h3>
            <div className="flex gap-2">
              <Select
                value={discountType}
                onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      শতাংশ
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      টাকা
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={discountType === "percentage" ? "%" : "৳"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>নোট (ঐচ্ছিক)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="অর্ডার সম্পর্কে নোট..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2 bg-secondary/30 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>সাবটোটাল:</span>
              <span>৳{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>ডিসকাউন্ট:</span>
                <span>-৳{discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>ডেলিভারি:</span>
              <span>{shippingCost === 0 ? "ফ্রি" : `৳${shippingCost}`}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>মোট:</span>
              <span className="text-primary">৳{total.toFixed(0)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || orderItems.length === 0}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            অর্ডার তৈরি করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AbandonedCartOrderDialog;
