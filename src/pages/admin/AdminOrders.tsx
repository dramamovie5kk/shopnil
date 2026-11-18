import { useState } from "react";
import { Search, Eye, Loader2, Truck, Check, X, Ban, Phone, Trash2, Pencil, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import ManualOrderDialog from "@/components/admin/ManualOrderDialog";
import CourierSendDialog from "@/components/admin/CourierSendDialog";
import CourierRatioChecker from "@/components/admin/CourierRatioChecker";
import OrderEditDialog from "@/components/admin/OrderEditDialog";
import InvoicePrint from "@/components/admin/InvoicePrint";
import { getSourceLabel, getSourceColor } from "@/hooks/useOrderSource";
import { useAdminOrders } from "@/hooks/useAdmin";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePixelTracking } from "@/hooks/usePixelTracking";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  hold: { label: "Hold", color: "bg-orange-500" },
  confirmed: { label: "Confirmed", color: "bg-cyan-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getSetting } = useSiteSettings();
  const { trackOrderCancelled } = usePixelTracking();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  const [courierDialogOpen, setCourierDialogOpen] = useState(false);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = filteredOrders.map((order: any) => ({
        "Order ID": order.id.slice(0, 8).toUpperCase(),
        "Customer Name": order.customer_name,
        "Phone": order.customer_phone,
        "Address": order.customer_address,
        "City": order.customer_city,
        "Status": statusMap[order.status]?.label || order.status,
        "Total (৳)": order.total_amount,
        "Shipping (৳)": order.shipping_cost || 0,
        "Payment Method": order.payment_method,
        "Source": getSourceLabel(order.order_source),
        "Coupon": order.coupon_code || "",
        "Discount (৳)": order.coupon_discount || 0,
        "Notes": order.notes || "",
        "Date": new Date(order.created_at).toLocaleDateString("en-US"),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, `orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Orders exported successfully!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredOrders.map((o: any) => o.id));
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

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await api
        .from("orders")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length} orders deleted`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setLoadingItems(true);

    const { data, error } = await api
      .from("order_items")
      .select("*, products(image_url), product_variations(image_url)")
      .eq("order_id", order.id);

    if (error) {
      toast.error("Failed to load order items");
    } else {
      setOrderItems(data);
    }
    setLoadingItems(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string, oldStatus: string) => {
    const { error } = await api
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    // Log the change
    await api.from("order_logs").insert({
      order_id: orderId,
      action: "status_change",
      old_status: oldStatus,
      new_status: newStatus,
      performed_by: user?.id,
    });

    // Cancel tracking
    if (newStatus === "cancelled" && getSetting("cancel_tracking_enabled", "true") === "true") {
      try {
        const { data: orderData } = await api
          .from("orders")
          .select("purchase_event_id, tracking_data, customer_name, customer_phone, customer_city, customer_ip")
          .eq("id", orderId)
          .single();

        if (orderData?.purchase_event_id) {
          const { data: items } = await api
            .from("order_items")
            .select("product_id, product_name, product_price, quantity")
            .eq("order_id", orderId);

          if (items && items.length > 0) {
            const td: any = orderData.tracking_data || {};
            trackOrderCancelled(
              orderId,
              orderData.purchase_event_id,
              items.map(item => ({
                product_id: item.product_id || undefined,
                product_name: item.product_name,
                price: item.product_price,
                quantity: item.quantity,
              })),
              {
                customer: {
                  name: orderData.customer_name || undefined,
                  phone: orderData.customer_phone || undefined,
                  city: orderData.customer_city || undefined,
                  country: "BD",
                },
                tracking: {
                  fbp: td.fbp || null,
                  fbc: td.fbc || null,
                  ttp: td.ttp || null,
                  ttclid: td.ttclid || null,
                  user_agent: td.user_agent || null,
                  external_id: td.external_id || null,
                  source_url: td.source_url || null,
                  customer_ip: orderData.customer_ip || null,
                },
              }
            );
          }
        }
      } catch (err) {
        console.error("[Tracking] Cancel tracking error:", err);
      }
    }

    toast.success("Order status updated");
    queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleBlockCustomer = async (phone: string) => {
    const { error } = await api.from("blocked_users").insert({
      phone,
      reason: "Admin blocked from order management",
      block_type: "permanent",
      blocked_by: user?.id,
    });

    if (error) {
      if (error.code === "CONFLICT") {
        toast.error("This number is already blocked");
      } else {
        toast.error("Failed to block");
      }
    } else {
      toast.success("Customer blocked");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Order Management">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders (name, phone, order ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setManualOrderOpen(true)} className="bg-gradient-brand">
              <Phone className="h-4 w-4 mr-2" />
              Phone Order
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>

          {/* Manual Order Dialog */}
          <ManualOrderDialog open={manualOrderOpen} onOpenChange={setManualOrderOpen} />

          {/* Orders Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Checkbox
                              checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Fraud Check</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Edit</TableHead>
                          <TableHead>Courier</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: any) => {
                        const status = statusMap[order.status] || statusMap.pending;
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(order.id)}
                                onCheckedChange={(checked) => handleSelectOne(order.id, !!checked)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer_city}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  handleStatusChange(order.id, value, order.status)
                                }
                              >
                                <SelectTrigger className="w-auto h-8 px-3 py-1 rounded-full border-0 shadow-sm bg-background hover:bg-muted transition-colors">
                                  <Badge className={`${status.color} text-white text-xs px-3 py-0.5 rounded-full shadow-sm`}>
                                    {status.label}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusMap).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            
                            <TableCell>
                              <CourierRatioChecker 
                                phone={order.customer_phone} 
                                orderId={order.id}
                                cachedData={order.courier_ratio_data}
                              />
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              ৳{order.total_amount}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-US")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setOrderToEdit(order);
                                  setEditDialogOpen(true);
                                }}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderForCourier(order);
                                  setCourierDialogOpen(true);
                                }}
                                title="Send to Courier"
                                className={order.courier_id 
                                  ? "bg-green-600 hover:bg-green-700 text-white" 
                                  : "bg-primary hover:bg-primary/90 text-primary-foreground"}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                {order.courier_id ? "Sent" : "Send"}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getSourceColor(order.order_source)} text-xs`}>
                                {getSourceLabel(order.order_source)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details Dialog */}
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customer_phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      {(() => {
                        const addr = selectedOrder.customer_address || "";
                        const thanaMatch = addr.match(/থানা:\s*([^,]+)/);
                        const districtMatch = addr.match(/জেলা:\s*([^,]+)/);
                        const baseAddr = addr.replace(/,\s*থানা:[^,]+/, "").replace(/,\s*জেলা:[^,]+/, "").trim();
                        return (
                          <div className="space-y-1">
                            <p className="font-medium">{baseAddr}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              {thanaMatch && (
                                <span><span className="text-muted-foreground">থানা:</span> <b>{thanaMatch[1].trim()}</b></span>
                              )}
                              {districtMatch && (
                                <span><span className="text-muted-foreground">জেলা:</span> <b>{districtMatch[1].trim()}</b></span>
                              )}
                              <span><span className="text-muted-foreground">এরিয়া:</span> <b>{selectedOrder.customer_city}</b></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {selectedOrder.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p>{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Order Items</h4>
                    {loadingItems ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {(item.product_variations?.image_url || item.products?.image_url) ? (
                                <img
                                  src={item.product_variations?.image_url || item.products?.image_url}
                                  alt={item.product_name}
                                  className="h-12 w-12 rounded-md object-cover border shrink-0"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-md bg-muted shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{item.product_name}</p>
                                {item.variation_name && (
                                  <p className="text-xs text-muted-foreground">{item.variation_name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  ৳{item.product_price} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold">৳{item.product_price * item.quantity}</p>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3 border-t">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>৳{selectedOrder.shipping_cost}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">৳{selectedOrder.total_amount}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.status === "pending" && (
                      <>
                        <Button
                          onClick={() =>
                            handleStatusChange(selectedOrder.id, "confirmed", selectedOrder.status)
                          }
                          className="bg-cyan-500 hover:bg-cyan-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirm
                        </Button>
                        <Button
                          onClick={() =>
                            handleStatusChange(selectedOrder.id, "hold", selectedOrder.status)
                          }
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Hold
                        </Button>
                      </>
                    )}
                    {selectedOrder.status === "hold" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, "confirmed", selectedOrder.status)
                        }
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                    )}
                    {selectedOrder.status === "confirmed" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, "processing", selectedOrder.status)
                        }
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Process
                      </Button>
                    )}
                    {selectedOrder.status === "processing" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, "shipped", selectedOrder.status)
                        }
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Ship
                      </Button>
                    )}
                    {selectedOrder.status === "shipped" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, "delivered", selectedOrder.status)
                        }
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Delivered
                      </Button>
                    )}
                    {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleStatusChange(selectedOrder.id, "cancelled", selectedOrder.status)
                        }
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Courier Send & Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <InvoicePrint order={selectedOrder} items={orderItems} />
                    <Button
                      onClick={() => {
                        setSelectedOrderForCourier(selectedOrder);
                        setCourierDialogOpen(true);
                      }}
                      className={selectedOrder.courier_id ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      {selectedOrder.courier_id ? "Sent to Courier" : "Send to Courier"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBlockCustomer(selectedOrder.customer_phone)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Block
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Courier Send Dialog */}
          <CourierSendDialog
            open={courierDialogOpen}
            onOpenChange={setCourierDialogOpen}
            order={selectedOrderForCourier}
          />

          {/* Order Edit Dialog */}
          <OrderEditDialog
            order={orderToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />

          {/* Bulk Delete Confirmation Dialog */}
          <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bulk delete?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedIds.length} orders will be permanently deleted. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminOrders;
