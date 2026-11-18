import { Link } from "react-router-dom";
import { Package, Heart, User, ShoppingBag, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const { data: ordersData } = useQuery({
    queryKey: ["userOrdersCount", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, pending: 0 };
      const { data, error } = await api
        .from("orders")
        .select("id, status")
        .eq("user_id", user.id);
      if (error) return { total: 0, pending: 0 };
      const total = data?.length || 0;
      const pending = data?.filter((o) => o.status === "pending" || o.status === "processing").length || 0;
      return { total, pending };
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await api
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlistCount", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await api
        .from("wishlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

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
      <main className="flex-1 bg-secondary/30">
        <div className="bg-gradient-brand py-8">
          <div className="container">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              {t('dashboard.welcome')}, {profile?.full_name || t('dashboard.customer')}!
            </h1>
            <p className="text-primary-foreground/80 mt-1">
              {t('dashboard.manage_desc')}
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ordersData?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.total_orders')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ordersData?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.active_orders')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wishlistCount}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.wishlist')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <User className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">১</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.account')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('dashboard.my_orders')}
                </CardTitle>
                <CardDescription>{t('dashboard.orders_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/orders">{t('dashboard.view_orders')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  {t('dashboard.wishlist_title')}
                </CardTitle>
                <CardDescription>{t('dashboard.wishlist_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/wishlist">{t('dashboard.view_wishlist')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  {t('dashboard.profile_settings')}
                </CardTitle>
                <CardDescription>{t('dashboard.profile_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">{t('dashboard.edit_profile')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-500" />
                  {t('dashboard.shopping')}
                </CardTitle>
                <CardDescription>{t('dashboard.shopping_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-gradient-brand">
                  <Link to="/products">{t('dashboard.view_products')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
