import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2, 
  Phone, Mail, LogOut, LayoutDashboard, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/hooks/useProducts";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePages } from "@/hooks/usePages";

import CartDrawer from "./CartDrawer";
import DesktopHeader from "./DesktopHeader";
import { headerCustomizationCss, parseHeaderCustomization, type HeaderPart } from "@/lib/headerCustomization";
import SearchPopover from "./SearchPopover";
import LanguageSwitcher from "./LanguageSwitcher";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  "মোবাইল": Smartphone,
  "ল্যাপটপ": Laptop,
  "অডিও": Headphones,
  "স্মার্টওয়াচ": Watch,
  "ক্যামেরা": Camera,
  "গেমিং": Gamepad2,
};

const categoryColors: Record<string, string> = {
  "মোবাইল": "from-blue-500 to-cyan-500",
  "ল্যাপটপ": "from-purple-500 to-pink-500",
  "অডিও": "from-orange-500 to-red-500",
  "স্মার্টওয়াচ": "from-green-500 to-emerald-500",
  "ক্যামেরা": "from-yellow-500 to-orange-500",
  "গেমিং": "from-indigo-500 to-purple-500",
};

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLElement | null>(null);
  const [menuDevice, setMenuDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"category" | "menu">("category");
  
  const { user, signOut } = useAuth();
  const { cartCount, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { data: categories = [] } = useCategories();
  const { data: pages = [] } = usePages();
  const { isAdmin, isModerator } = useStaffAccess();
  const navigate = useNavigate();
  const { getSetting } = useSiteSettings();
  const { t, language } = useLanguage();
  const customization = parseHeaderCustomization(getSetting('header_customization'));
  const mobilePart = (name: HeaderPart) => ({ 'data-header-device': 'mobile', 'data-header-part': name });
  const mobileCopy = (name: HeaderPart, fallback: string) => customization.mobile[name]?.text?.trim() || fallback;
  

  const siteName = getSetting("site_name", "GadgetBD");
  const siteTagline = getSetting("site_tagline", "প্রিমিয়াম গ্যাজেট শপ");
  const siteLogo = getSetting("site_logo_text", "G");
  const siteLogoUrl = customization.mobile.logo?.imageUrl || getSetting("site_logo_url", "");
  const contactPhone = getSetting("footer_phone", "০১৭XX-XXXXXX");
  const contactEmail = getSetting("footer_email", "support@gadgetbd.com");
  
  // Header colors from settings
  const headerBgColor = getSetting("header_bg_color", "#0f172a");
  const headerTextColor = getSetting("header_text_color", "#ffffff");
  const topBarEnabled = getSetting("topbar_enabled", "1") !== "0";
  const topBarMessage = (getSetting(
    "topbar_messages",
    "👉 টাকা হাতে পেয়ে দেখে টাকা দিন|🏆 ১০০% কোয়ালিটি পণ্য|🔁 ৭ দিনের রিটার্ন/এক্সচেঞ্জ|🚚 হোম ডেলিভারি সারা বাংলাদেশে"
  ).split(/\n|\|/).map(s => s.trim()).filter(Boolean)[0]) || "";
  const topBarBgColor = getSetting("topbar_bg_color", "");
  const topBarTextColor = getSetting("topbar_text_color", "");
  const topBarGradFrom = getSetting("topbar_gradient_from", "#16a34a");
  const topBarGradTo = getSetting("topbar_gradient_to", "#15803d");
  const topBarGradDir = getSetting("topbar_gradient_direction", "to right");
  const catnavBgColor = getSetting("header_catnav_bg", "");
  const catnavTextColor = getSetting("header_catnav_text", "");
  const searchBgColor = getSetting("header_search_bg", "");
  const searchTextColor = getSetting("header_search_text", "");
  const badgeBgColor = getSetting("header_badge_bg", "");
  const badgeTextColor = getSetting("header_badge_text", "");
  const hoverBgColor = getSetting("header_hover_bg", "");
  const hotdealColor = getSetting("header_hotdeal_color", "");
  const logoSize = getSetting("logo_size", "44");

  const hoverStyle = hoverBgColor || "rgba(255,255,255,0.1)";

  // Header menu items (admin-managed). Falls back to sensible defaults.
  const defaultMenuItems = [
    { label_bn: "হোম", label_en: "Home", url: "/" },
    { label_bn: "শপ", label_en: "Shop", url: "/products" },
    { type: "categories", label_bn: "ক্যাটেগরি", label_en: "Categories" },
    { label_bn: "যোগাযোগ", label_en: "Contact", url: "/contact" },
    { label_bn: "আমাদের সম্পর্কে", label_en: "About", url: "/about" },
  ];
  const headerMenuItems = useMemo(() => {
    const raw = getSetting("header_menu_items", "");
    if (!raw) return defaultMenuItems;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-inject categories item if missing
        if (!parsed.some((it: any) => it?.type === "categories")) {
          const insertAt = Math.min(2, parsed.length);
          return [
            ...parsed.slice(0, insertAt),
            { type: "categories", label_bn: "ক্যাটেগরি", label_en: "Categories" },
            ...parsed.slice(insertAt),
          ];
        }
        return parsed;
      }
    } catch {}
    return defaultMenuItems;
  }, [getSetting]);

  // Separate parent and child categories
  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);



  const getDashboardPath = () => {
    if (isAdmin || isModerator) return "/admin";
    return "/dashboard";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };



  return (
    <>
      <header className="sticky top-0 z-50 bg-background shadow-lg">
        <style>{headerCustomizationCss(customization)}</style>
        <DesktopHeader onMenuOpen={trigger => { menuTriggerRef.current = trigger; setMenuDevice('desktop'); setMobileMenuOpen(true); }} />
        {/* Top Bar (single static message, toggleable from header settings) */}
        {(topBarEnabled || customization.mobile.topbar?.visible === true) && topBarMessage && (
          <div 
            {...mobilePart('topbar')}
            className="bg-primary text-primary-foreground lg:hidden"
            style={{ 
              backgroundColor: (topBarGradFrom && topBarGradTo) ? undefined : (topBarBgColor || undefined),
              backgroundImage: (topBarGradFrom && topBarGradTo)
                ? `linear-gradient(${topBarGradDir}, ${topBarGradFrom}, ${topBarGradTo})`
                : undefined,
              color: topBarTextColor || undefined 
            }}
          >
            <div className="overflow-hidden h-9 flex items-center justify-center">
              <span {...mobilePart('message')} className="text-[13px] font-medium">{mobileCopy('message',topBarMessage.replace(/<[^>]*>/g, ''))}</span>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div 
          {...mobilePart('header')}
          className="text-white lg:hidden"
          style={{ 
            backgroundColor: headerBgColor,
            color: headerTextColor 
          }}
        >
          <div className="w-[98%] max-w-[1240px] mx-auto">
            <div data-header-row className="flex items-center justify-between h-16 gap-2">
              {/* Mobile left: menu + search */}
              <div className="flex items-center gap-2 lg:hidden flex-1">
                <button
                  {...mobilePart('menu')}
                  onClick={event => { menuTriggerRef.current = event.currentTarget; setMenuDevice('mobile'); setMobileMenuOpen(!mobileMenuOpen); }}
                  aria-label="মেনু"
                  className="h-10 w-10 rounded-xl border border-white/20 flex items-center justify-center transition-colors"
                  style={{ color: headerTextColor }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <button
                  {...mobilePart('search')}
                  onClick={() => setIsMobileSearchOpen((v) => !v)}
                  aria-label="সার্চ"
                  className="h-10 w-10 rounded-xl border border-white/20 flex items-center justify-center transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Search className="h-5 w-5 opacity-90" />
                </button>
              </div>
              {/* Logo - center on mobile, left on desktop */}
              <Link {...mobilePart('logo')} to="/" className="flex items-center shrink-0">
                {siteLogoUrl ? (
                  <img 
                    src={siteLogoUrl} 
                    alt={siteName} 
                    style={{ height: `${logoSize}px` }}
                    className="w-auto object-contain"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border border-white/20"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {siteLogo}
                  </div>
                )}
              </Link>

              {/* Center Nav - Desktop */}
              <nav className="hidden lg:flex flex-1 items-center justify-center gap-7">
                {headerMenuItems.map((item: any, idx: number) => {
                  if (item?.type === "categories") {
                    return (
                      <div key={idx} className="relative group">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[15px] font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
                          style={{ color: headerTextColor }}
                        >
                          {language === 'en' ? (item.label_en || 'Categories') : (item.label_bn || 'ক্যাটেগরি')}
                          <ChevronDown className="h-4 w-4 opacity-80" />
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="bg-white text-foreground rounded-xl shadow-xl border min-w-[240px] max-h-[70vh] overflow-y-auto py-2">
                            {parentCategories.length === 0 ? (
                              <p className="px-4 py-2 text-sm text-muted-foreground">
                                {language === 'en' ? 'No categories' : 'কোনো ক্যাটেগরি নেই'}
                              </p>
                            ) : (
                              parentCategories.map((cat) => {
                                const subs = getSubcategories(cat.id);
                                return (
                                  <div key={cat.id} className="group/cat relative">
                                    <Link
                                      to={`/products?category=${cat.slug}`}
                                      className="flex items-center justify-between px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                    >
                                      <span>{cat.name}</span>
                                      {subs.length > 0 && <ChevronRight className="h-4 w-4 opacity-60" />}
                                    </Link>
                                    {subs.length > 0 && (
                                      <div className="absolute left-full top-0 pl-1 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-200">
                                        <div className="bg-white text-foreground rounded-xl shadow-xl border min-w-[200px] py-2">
                                          {subs.map((sub) => (
                                            <Link
                                              key={sub.id}
                                              to={`/products?category=${sub.slug}`}
                                              className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                            >
                                              {sub.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      to={item.url || "/"}
                      className="text-[15px] font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
                      style={{ color: headerTextColor }}
                    >
                      {language === 'en' ? (item.label_en || item.label_bn) : (item.label_bn || item.label_en)}
                    </Link>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-1 lg:flex-none justify-end">
                {/* Desktop Search Icon */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden lg:flex p-2.5 rounded-xl transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Search className="h-5 w-5 opacity-90" />
                </button>

                {/* Account */}
                <div className="relative group">
                  <button {...mobilePart('account')} className="flex items-center gap-2 p-2 rounded-xl max-lg:h-10 max-lg:w-10 max-lg:justify-center max-lg:border max-lg:border-white/20 transition-colors" style={{ color: headerTextColor }}>
                    <User className="h-5 w-5 opacity-90" />
                    <div className="text-left hidden sm:block">
                      <p className="text-xs opacity-70">{language === 'bn' ? 'আমার' : 'My'}</p>
                      <p className="text-sm font-medium -mt-0.5">{t('header.account')}</p>
                    </div>
                  </button>
                  
                  {/* Account Dropdown */}
                  <div {...mobilePart('dropdown')} className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white text-foreground rounded-xl shadow-xl border min-w-[200px] py-2 overflow-hidden">
                      {user ? (
                        <>
                          <Link 
                            to={getDashboardPath()} 
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-secondary transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            {isAdmin ? t('header.admin_dashboard') : isModerator ? t('header.moderator_dashboard') : t('header.my_dashboard')}
                          </Link>
                          <Link 
                            to="/orders" 
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-secondary transition-colors"
                          >
                            {t('header.my_orders')}
                          </Link>
                          <Link 
                            to="/wishlist" 
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-secondary transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                            {t('header.wishlist')}
                          </Link>
                          <div className="border-t my-1" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary transition-colors text-destructive text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            {t('header.logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/login" 
                            className="block px-4 py-2.5 hover:bg-secondary transition-colors"
                          >
                            {t('header.login')}
                          </Link>
                          <Link 
                            to="/register" 
                            className="block px-4 py-2.5 hover:bg-secondary transition-colors"
                          >
                            {t('header.register')}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cart */}
                <button
                  {...mobilePart('cart')}
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label={mobileCopy('cart','কার্ট')}
                  className="relative p-2 rounded-xl max-lg:h-10 max-lg:w-10 max-lg:flex max-lg:items-center max-lg:justify-center lg:border-0 border border-white/20 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShoppingCart className="h-5 w-5 opacity-90" />
                  {cartCount > 0 && (
                    <span
                      {...mobilePart('badge')}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                      style={{
                        backgroundColor: badgeBgColor || "#22c55e",
                        color: badgeTextColor || "#ffffff",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Inline Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-background border-b border-border overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mobileSearchQuery.trim()) {
                    navigate(`/products?search=${encodeURIComponent(mobileSearchQuery)}`);
                    setMobileSearchQuery("");
                    setIsMobileSearchOpen(false);
                  }
                }}
                className="w-full px-3 py-2 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    {...mobilePart('searchInput')}
                    placeholder={mobileCopy('searchInput',t('header.search_placeholder'))}
                    className="w-full h-10 pl-9 pr-12 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="submit"
                    {...mobilePart('searchButton')}
                    aria-label={mobileCopy('searchButton','Search')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            data-header-device={menuDevice}
            data-header-part="dropdown"
            aria-describedby={undefined}
            onCloseAutoFocus={event => { event.preventDefault(); menuTriggerRef.current?.focus(); }}
            className=" p-0 w-[85%] max-w-[340px] lg:w-[400px] lg:max-w-[400px] overflow-y-auto border-r bg-background text-foreground"
          >
            <SheetTitle className="sr-only">{language === 'en' ? 'Menu and categories' : 'মেনু ও ক্যাটেগরি'}</SheetTitle>
            {/* Logo header strip — matches main header color */}
            <div
              className="px-4 py-4 border-b"
              style={{
                backgroundColor: menuDevice === 'desktop' ? '#ffffff' : (topBarGradFrom && topBarGradTo) ? undefined : (headerBgColor || undefined),
                backgroundImage: menuDevice === 'desktop' ? undefined : (topBarGradFrom && topBarGradTo)
                  ? `linear-gradient(${topBarGradDir}, ${topBarGradFrom}, ${topBarGradTo})`
                  : undefined,
                color: menuDevice === 'desktop' ? '#07391E' : headerTextColor,
              }}
            >
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                {(customization[menuDevice].logo?.imageUrl || getSetting('site_logo_url')) ? (
                  <img
                    src={(customization[menuDevice].logo?.imageUrl || getSetting('site_logo_url'))}
                    alt={siteName}
                    style={{ height: `${logoSize}px` }}
                    className="w-auto object-contain"
                  />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-white/15 border border-white/20">
                      {siteLogo}
                    </div>
                    <div className="leading-tight">
                      <p className="font-bold text-base">{siteName}</p>
                      <p className="text-xs opacity-80">{siteTagline}</p>
                    </div>
                  </>
                )}
              </Link>
            </div>

            <div className="p-4">
                {/* Mobile Search */}
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted rounded-xl text-muted-foreground mb-4 border border-border"
                >
                  <Search className="h-5 w-5" />
                  <span>{t('header.search_products')}</span>
                </button>

                {/* Tabs: Category / Menu */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-3">
                  <button
                    onClick={() => setMobileTab("category")}
                    className={`py-2 text-sm font-medium rounded-lg transition-colors ${mobileTab === "category" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </button>
                  <button
                    onClick={() => setMobileTab("menu")}
                    className={`py-2 text-sm font-medium rounded-lg transition-colors ${mobileTab === "menu" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    {language === 'bn' ? 'মেনু' : 'Menu'}
                  </button>
                </div>

                {/* Categories with subcategories */}
                {mobileTab === "category" && (
                <div className="space-y-1 mb-4">
                  {parentCategories.map((cat) => {
                    const subs = getSubcategories(cat.id);
                    const isExpanded = expandedMobileCategory === cat.id;
                    
                    return (
                      <div key={cat.id}>
                        {subs.length > 0 ? (
                          <>
                            <button
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                              className="w-full flex items-center justify-between px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                              <span>{language === 'en' ? cat.name : cat.name_bn}</span>
                              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 space-y-0.5">
                                    <Link
                                      to={`/products?category=${cat.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                                    >
                                      {language === 'bn' ? 'সকল' : 'All'} {language === 'en' ? cat.name : cat.name_bn}
                                    </Link>
                                    {subs.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={`/products?category=${sub.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                                      >
                                        {language === 'en' ? sub.name : sub.name_bn}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            to={`/products?category=${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                          >
                            {language === 'en' ? cat.name : cat.name_bn}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Menu Tab: Quick Links + Pages + Account */}
                {mobileTab === "menu" && (
                <div className="space-y-1">
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    {t('header.all_products')}
                  </Link>
                  <Link
                    to="/products?featured=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-orange-500 hover:bg-muted rounded-xl transition-colors"
                  >
                    {t('header.hot_deal')}
                  </Link>

                  {pages.filter(p => p.is_published).map((page) => (
                    <Link
                      key={page.id}
                      to={`/${page.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      {page.title}
                    </Link>
                  ))}

                  <div className="border-t border-border pt-2 mt-2" />
                  {user ? (
                    <>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5 opacity-60" />
                        {isAdmin ? t('header.admin_dashboard') : isModerator ? t('header.moderator_dashboard') : t('header.my_dashboard')}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                      >
                        {t('header.my_orders')}
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-muted rounded-xl transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        {t('header.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                      >
                        {t('header.login')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                      >
                        {t('header.register')}
                      </Link>
                    </>
                  )}
                </div>
                )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Search Popover */}
      <SearchPopover isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
};

export default Header;
