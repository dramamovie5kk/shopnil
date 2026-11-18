import { useState, useEffect } from "react";
import { Package, ShoppingCart, AlertCircle, DollarSign, Phone, ShoppingBag, AlertTriangle, CalendarDays, CalendarRange, CalendarCheck, ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import ManualOrderDialog from "@/components/admin/ManualOrderDialog";
import StatCard from "@/components/admin/StatCard";
import { useAdminStats, useAdminOrders, useAbandonedCarts } from "@/hooks/useAdmin";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { api } from "@/integrations/cloudflare/client";


const statusMap: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700 border-amber-200" },
  hold: { label: "Hold", classes: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed: { label: "Confirmed", classes: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  processing: { label: "Processing", classes: "bg-blue-100 text-blue-700 border-blue-200" },
  shipped: { label: "Shipped", classes: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", classes: "bg-rose-100 text-rose-700 border-rose-200" },
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: abandonedCarts = [] } = useAbandonedCarts();
  const { isAdmin, isModerator } = useStaffAccess();
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  

  // Low stock count for admin
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loadingLowStock, setLoadingLowStock] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchLowStockCount();
    } else {
      setLoadingLowStock(false);
    }
  }, [isAdmin]);

  const fetchLowStockCount = async () => {
    try {
      const { data: products } = await api
        .from("products")
        .select("stock, low_stock_threshold");

      if (products) {
        const lowStock = products.filter(
          (p) => (p.stock || 0) <= (p.low_stock_threshold || 5)
        ).length;
        setLowStockCount(lowStock);
      }
    } catch (error) {
      console.error("Error fetching low stock count:", error);
    } finally {
      setLoadingLowStock(false);
    }
  };

  const dashboardTitle = isAdmin ? "Admin Dashboard" : "Moderator Dashboard";
  const dashboardSubtitle = isAdmin
    ? "ব্যবসার সামগ্রিক পারফরমেন্স ও সাম্প্রতিক অর্ডারের সংক্ষিপ্ত চিত্র"
    : "অর্ডার ও কাস্টমার ম্যানেজমেন্ট প্যানেল";

  return (
    <AdminGuard>
      <AdminLayout title={dashboardTitle} subtitle={dashboardSubtitle}>
        {statsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Quick Actions for Moderators */}
            {isModerator && !isAdmin && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-brand rounded-full" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link to="/admin/orders">
                    <Card className="cursor-pointer hover:border-primary/50 transition-all duration-300 h-full shadow-admin-card hover:shadow-admin-elevated hover:-translate-y-0.5 border-admin-border/50">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="rounded-2xl bg-primary/10 p-3 mb-3">
                          <ShoppingCart className="h-8 w-8 text-primary" />
                        </div>
                        <p className="font-medium text-center">Manage Orders</p>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          View and update all orders
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/admin/abandoned">
                    <Card className="cursor-pointer hover:border-orange-500/50 transition-all duration-300 h-full shadow-admin-card hover:shadow-admin-elevated hover:-translate-y-0.5 border-admin-border/50">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="rounded-2xl bg-orange-500/10 p-3 mb-3">
                          <ShoppingBag className="h-8 w-8 text-orange-500" />
                        </div>
                        <p className="font-medium text-center">Abandoned Orders</p>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          {abandonedCarts.length} pending
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Card 
                    className="cursor-pointer hover:border-emerald-500/50 transition-all duration-300 h-full shadow-admin-card hover:shadow-admin-elevated hover:-translate-y-0.5 border-admin-border/50"
                    onClick={() => setManualOrderOpen(true)}
                  >
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <div className="rounded-2xl bg-emerald-500/10 p-3 mb-3">
                        <Phone className="h-8 w-8 text-emerald-500" />
                      </div>
                      <p className="font-medium text-center">Phone Order</p>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Create a new order entry
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Manual Order Dialog */}
            <ManualOrderDialog open={manualOrderOpen} onOpenChange={setManualOrderOpen} />

            {/* Low Stock Alert for Admins */}
            {isAdmin && !loadingLowStock && lowStockCount > 0 && (
              <div className="mb-6">
                <Link to="/admin/inventory">
                  <div className="group relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-rose-50/50 to-transparent p-5 shadow-admin-card hover:shadow-admin-elevated transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl" />
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-rose-500/15 p-3 shadow-sm">
                          <AlertTriangle className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700/80">Low Stock Alert</p>
                          <p className="text-lg font-bold text-rose-700 mt-0.5">
                            {lowStockCount} products are running low
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-rose-700 group-hover:translate-x-1 transition-transform">
                        View Inventory <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Order Stats */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                <span className="w-1 h-4 bg-gradient-brand rounded-full" />
                Orders Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingCart} variant="primary" href="/admin/orders" />
                <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon={AlertCircle} variant="warning" href="/admin/orders" />
                {isAdmin && (
                  <>
                    <StatCard label="Today's Orders" value={stats?.todayOrders ?? 0} icon={CalendarDays} variant="info" />
                    <StatCard label="7-Day Orders" value={stats?.weekOrders ?? 0} icon={CalendarRange} variant="info" />
                    <StatCard label="30-Day Orders" value={stats?.monthOrders ?? 0} icon={CalendarCheck} variant="info" />
                  </>
                )}
                {!isAdmin && (
                  <StatCard label="Abandoned" value={abandonedCarts.length} icon={ShoppingBag} variant="warning" href="/admin/abandoned" />
                )}
              </div>
            </div>

            {/* Revenue & Inventory */}
            {isAdmin && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <span className="w-1 h-4 bg-gradient-brand rounded-full" />
                  Revenue & Catalog
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <StatCard label="Total Products" value={stats?.totalProducts ?? 0} icon={Package} variant="purple" href="/admin/products" />
                  <StatCard label="Today's Revenue" value={stats?.todayRevenue ?? 0} icon={DollarSign} variant="success" prefix="৳" />
                  <StatCard label="7-Day Revenue" value={stats?.weekRevenue ?? 0} icon={DollarSign} variant="success" prefix="৳" />
                  <StatCard label="30-Day Revenue" value={stats?.monthRevenue ?? 0} icon={DollarSign} variant="success" prefix="৳" />
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <Card className="border-admin-border/50 shadow-admin-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-admin-border/40 bg-admin-header">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-brand rounded-full" />
                    Recent Orders
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 ml-3">সর্বশেষ ৫টি অর্ডার</p>
                </div>
                <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                {ordersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    এখনো কোনো অর্ডার নেই
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentOrders.slice(0, 5).map((order: any) => {
                      const status = statusMap[order.status] || statusMap.pending;
                      return (
                        <Link
                          key={order.id}
                          to="/admin/orders"
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 hover:shadow-admin-card transition-all border border-transparent hover:border-admin-border/60 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 shadow-brand">
                              {getInitials(order.customer_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {order.customer_phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${status.classes}`}>
                              {status.label}
                            </span>
                            <p className="text-sm font-bold mt-1 tabular-nums">৳{order.total_amount}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;
