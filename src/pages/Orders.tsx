import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Package, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/cloudflare/client";
import { Order } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: t('orders.status_pending'), color: "bg-yellow-500" },
    processing: { label: t('orders.status_processing'), color: "bg-blue-500" },
    shipped: { label: t('orders.status_shipped'), color: "bg-purple-500" },
    delivered: { label: t('orders.status_delivered'), color: "bg-green-500" },
    cancelled: { label: t('orders.status_cancelled'), color: "bg-red-500" },
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await api
      .from("orders")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('orders.title')}</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">{t('orders.no_orders')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('orders.no_orders_desc')}
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-brand px-6 py-2 text-primary-foreground hover:opacity-90"
                >
                  {t('orders.start_shopping')}
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusMap[order.status] || statusMap.pending;
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">
                              {t('orders.order')} #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(language === 'bn' ? "bn-BD" : "en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_address}, {order.customer_city}
                          </p>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{t('orders.total')}</p>
                            <p className="text-lg font-bold text-primary">
                              ৳{order.total_amount}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
