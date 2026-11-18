import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  Tags,
  Phone,
  Settings,
  Boxes,
  FileText,
  Star,
  RotateCw,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import ManualOrderDialog from "@/components/admin/ManualOrderDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Menu item types
interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  roles: string[];
  subItems?: SubMenuItem[];
}

// Menu items with role-based visibility
const getMenuItems = (isAdmin: boolean): MenuItem[] => {
  const items: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", roles: ["admin", "moderator"] },
    { 
      icon: Package, 
      label: "Products", 
      path: "/admin/products", 
      roles: ["admin"],
      subItems: [
        { label: "All Products", path: "/admin/products" },
        { label: "Categories", path: "/admin/categories" },
        { label: "Reviews", path: "/admin/reviews" },
      ]
    },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders", roles: ["admin", "moderator"] },
    { icon: ShoppingBag, label: "Abandoned Orders", path: "/admin/abandoned", roles: ["admin", "moderator"] },
    { icon: Boxes, label: "Inventory", path: "/admin/inventory", roles: ["admin"] },
    { icon: FileText, label: "Sales Pages", path: "/admin/sales-pages", roles: ["admin"] },
    { icon: RotateCw, label: "Spin Settings", path: "/admin/spin-settings", roles: ["admin", "moderator"] },
    { icon: Settings, label: "Settings", path: "/admin/settings", roles: ["admin"] },
  ];

  if (isAdmin) {
    return items;
  }
  
  return items.filter((item) => item.roles.includes("moderator"));
};

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const AdminLayout = ({ children, title, subtitle, actions }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin, isStaff } = useStaffAccess();

  const menuItems = getMenuItems(isAdmin);

  // Auto-open submenu if current path matches a sub-item
  useState(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const isSubActive = item.subItems.some((sub) => location.pathname === sub.path);
        if (isSubActive) {
          setOpenSubMenu(item.path);
        }
      }
    });
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-admin-surface">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card/80 backdrop-blur-md border-b border-admin-border/60 sticky top-0 z-30 shadow-admin-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg bg-gradient-brand bg-clip-text text-transparent">
            {isAdmin ? "Admin Panel" : "Moderator Panel"}
          </h1>
        </div>
        <Link to="/" className="text-sm text-primary hover:underline">
          Back to Site
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-admin-sidebar border-r border-admin-border/60 transition-all duration-300 shadow-admin-card",
          sidebarOpen ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-border/60">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-primary-foreground font-bold text-[10px] tracking-wider">{isAdmin ? "ADMIN" : "MOD"}</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm">{isAdmin ? "Admin" : "Moderator"}</span>
                <span className="text-[10px] text-muted-foreground">Control Panel</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubActive = hasSubItems && item.subItems!.some((sub) => location.pathname === sub.path);
            const isOpen = openSubMenu === item.path;

            if (hasSubItems && sidebarOpen) {
              return (
                <Collapsible
                  key={item.path}
                  open={isOpen || isSubActive}
                  onOpenChange={() => setOpenSubMenu(isOpen ? null : item.path)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200 group",
                        isSubActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", isSubActive && "text-primary")} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", (isOpen || isSubActive) && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-9 mt-1 space-y-0.5">
                    {item.subItems!.map((subItem) => {
                      const isSubItemActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-[13px] transition-all relative",
                            isSubItemActive
                              ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-primary before:rounded-r"
                              : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-brand text-primary-foreground shadow-brand font-semibold"
                    : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", isActive && "drop-shadow-sm")} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
          
          {/* Phone Order Button */}
          {isStaff && (
            <button
              onClick={() => {
                setManualOrderOpen(true);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full mt-2 group",
                "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 hover:shadow-md"
              )}
            >
              <Phone className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110" />
              {sidebarOpen && <span className="text-sm font-medium">Phone Order</span>}
            </button>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-admin-border/60 bg-admin-sidebar">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            )}
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
            {sidebarOpen && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
            )}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 hidden lg:flex h-7 w-7 rounded-full border border-admin-border bg-card shadow-admin-elevated hover:shadow-admin-glow hover:bg-primary hover:text-primary-foreground transition-all"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </Button>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Page Header */}
        <div className="bg-admin-header border-b border-admin-border/60 px-6 py-5 sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 animate-fade-in">{children}</div>
      </main>
      
      {/* Manual Order Dialog */}
      <ManualOrderDialog open={manualOrderOpen} onOpenChange={setManualOrderOpen} />
    </div>
  );
};

export default AdminLayout;
