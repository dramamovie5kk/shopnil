import { useState } from "react";
import { ShoppingBag, Loader2, Phone, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAbandonedCarts } from "@/hooks/useAdmin";
import { useProducts } from "@/hooks/useProducts";
import { api } from "@/integrations/cloudflare/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AbandonedCartOrderDialog from "@/components/admin/AbandonedCartOrderDialog";
import CourierRatioChecker from "@/components/admin/CourierRatioChecker";

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

const AdminAbandoned = () => {
  const { data: abandonedCarts = [], isLoading } = useAbandonedCarts();
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const [expandedCarts, setExpandedCarts] = useState<Record<string, boolean>>({});
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [deleteCartId, setDeleteCartId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const toggleExpand = (cartId: string) => {
    setExpandedCarts((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  const handleCreateOrder = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setIsOrderDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(abandonedCarts.map((c: any) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDelete = async () => {
    if (!deleteCartId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await api
        .from("abandoned_carts")
        .delete()
        .eq("id", deleteCartId);

      if (error) throw error;

      toast.success("ডাটা ডিলিট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["abandonedCarts"] });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setIsDeleting(false);
      setDeleteCartId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await api
        .from("abandoned_carts")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length}টি ডিলিট হয়েছে`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["abandonedCarts"] });
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setIsDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="অসম্পূর্ণ অর্ডার">
        <div className="space-y-6">
          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                ডিলিট ({selectedIds.length})
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : abandonedCarts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">কোনো অসম্পূর্ণ অর্ডার নেই</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.length === abandonedCarts.length && abandonedCarts.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>কাস্টমার</TableHead>
                        <TableHead>ফোন</TableHead>
                        <TableHead>রেসিও</TableHead>
                        <TableHead>কার্ট আইটেম</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abandonedCarts.map((cart: any) => {
                        const cartData = cart.cart_data as CartData | null;
                        const items = cartData?.items || [];
                        const total = cartData?.total || 0;
                        const form = cartData?.form;
                        const isExpanded = expandedCarts[cart.id];

                        return (
                          <Collapsible key={cart.id} asChild open={isExpanded}>
                            <>
                              <TableRow className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedIds.includes(cart.id)}
                                    onCheckedChange={(checked) => handleSelectOne(cart.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => toggleExpand(cart.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {form?.name && (
                                      <p className="font-medium">{form.name}</p>
                                    )}
                                    {!form?.name && (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(cart.customer_phone || form?.phone) ? (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      {cart.customer_phone || form?.phone}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {(cart.customer_phone || form?.phone) ? (
                                    <CourierRatioChecker 
                                      phone={cart.customer_phone || form?.phone || ''} 
                                      saveToDb={false}
                                    />
                                  ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <span className="font-medium">{items.length} আইটেম</span>
                                    {total > 0 && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        (৳{total})
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(cart.created_at).toLocaleString("bn-BD")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setDeleteCartId(cart.id)}
                                      className="gap-1 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleCreateOrder(cart as AbandonedCart)}
                                      className="gap-1"
                                    >
                                      <Plus className="h-4 w-4" />
                                      অর্ডার
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                              <CollapsibleContent asChild>
                                <TableRow className="bg-muted/30">
                                  <TableCell colSpan={7} className="p-4">
                                    <div className="space-y-3">
                                      {/* Customer Address Info */}
                                      {(form?.address || form?.city) && (
                                        <div className="text-sm">
                                          <span className="font-medium">ঠিকানা: </span>
                                          <span className="text-muted-foreground">
                                            {[form?.address, form?.city].filter(Boolean).join(", ")}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Product List */}
                                      <div>
                                        <p className="font-medium text-sm mb-2">কার্ট প্রোডাক্ট:</p>
                                        <div className="grid gap-2">
                                          {items.map((item, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center justify-between bg-background rounded-lg p-3 border"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center shrink-0 overflow-hidden">
                                                  {(() => {
                                                    const product = products.find(p => p.id === item.product_id);
                                                    return product?.image_url ? (
                                                      <img
                                                        src={product.image_url}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <span className="text-lg">📦</span>
                                                    );
                                                  })()}
                                                </div>
                                                <div>
                                                  <p className="font-medium text-sm">{item.product_name}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    ৳{item.price} × {item.quantity}
                                                  </p>
                                                </div>
                                              </div>
                                              <p className="font-medium text-primary">
                                                ৳{item.price * item.quantity}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                        {items.length === 0 && (
                                          <p className="text-sm text-muted-foreground">কোনো প্রোডাক্ট নেই</p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </CollapsibleContent>
                            </>
                          </Collapsible>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Creation Dialog */}
        <AbandonedCartOrderDialog
          open={isOrderDialogOpen}
          onOpenChange={setIsOrderDialogOpen}
          abandonedCart={selectedCart}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteCartId} onOpenChange={(open) => !open && setDeleteCartId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ডিলিট করতে চান?</AlertDialogTitle>
              <AlertDialogDescription>
                এই অসম্পূর্ণ অর্ডারটি ডিলিট করলে আর ফেরত আনা যাবে না।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                ডিলিট করুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>বাল্ক ডিলিট করতে চান?</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedIds.length}টি ডিলিট করলে আর ফেরত আনা যাবে না।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                ডিলিট করুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminAbandoned;
