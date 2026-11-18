import MobileBottomNav from "@/components/layout/MobileBottomNav";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CustomCodeInjector from "@/components/CustomCodeInjector";
import FBPixelLoader from "@/components/FBPixelLoader";
import TikTokPixelLoader from "@/components/TikTokPixelLoader";
import OptionalSpinWheel from "@/components/spin/OptionalSpinWheel";
import ScrollToTop from "@/components/layout/ScrollToTop";
import OrderSourceCapture from "@/components/OrderSourceCapture";
import DynamicTitle from "@/components/DynamicTitle";
import { lazy as reactLazy, Suspense, type ComponentType } from "react";

// After a new version is published, old page files disappear. If loading one fails,
// reload once so the browser picks up the latest version instead of a blank screen.
const lazy = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) =>
  reactLazy(async () => {
    const key = "chunk-reload-at";
    try {
      const mod = await factory();
      sessionStorage.removeItem(key);
      return mod;
    } catch (error) {
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
import { Loader2 } from "lucide-react";

// Lazy load all pages for code splitting
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const SalesPageOrderSuccess = lazy(() => import("./pages/SalesPageOrderSuccess"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));

// Admin Pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminBlocked = lazy(() => import("./pages/admin/AdminBlocked"));
const AdminAbandoned = lazy(() => import("./pages/admin/AdminAbandoned"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCustomCode = lazy(() => import("./pages/admin/AdminCustomCode"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminSalesPages = lazy(() => import("./pages/admin/AdminSalesPages"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminSpinSettings = lazy(() => import("./pages/admin/AdminSpinSettings"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
const queryClient = new QueryClient({defaultOptions:{queries:{
  retry:(attempt,error)=>{const status=(error as Error & {status?:number}).status;return attempt<2&&(status===undefined||status>=500);},
}}});

const App = () => (
  <AppErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <ScrollToTop />
              <OrderSourceCapture />
              <DynamicTitle />
              <CustomCodeInjector />
              <FBPixelLoader />
              <TikTokPixelLoader />
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/shop" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/admin/pages" element={<AdminPages />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/lp-order-success" element={<SalesPageOrderSuccess />} />
                  {/* Sales Landing Pages - No Header/Footer */}
                  <Route path="/lp/:slug" element={<SalesPage />} />
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/blocked" element={<AdminBlocked />} />
                  <Route path="/admin/abandoned" element={<AdminAbandoned />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/custom-code" element={<AdminCustomCode />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/inventory" element={<AdminInventory />} />
                  <Route path="/admin/sales-pages" element={<AdminSalesPages />} />
                  <Route path="/admin/reviews" element={<AdminReviews />} />
                  <Route path="/admin/spin-settings" element={<AdminSpinSettings />} />
                  <Route path="/admin/blogs" element={<AdminBlogs />} />

                  <Route path="*" element={<NotFound />} />
                  <Route path="/page/:slug" element={<DynamicPage />} />
                  <Route path="/:slug" element={<DynamicPage />} />
                </Routes>
              </Suspense>
              <MobileBottomNav />
              <OptionalSpinWheel />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
