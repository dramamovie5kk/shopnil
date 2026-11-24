import { lazy, Suspense, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2, 
  Phone, Mail, LogOut, LayoutDashboard, Heart, LayoutGrid, ShoppingBag
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/hooks/useProducts";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePages } from "@/hooks/usePages";

import { HeaderMarquee } from "./HeaderMarquee";
import DesktopHeader from "./DesktopHeader";
import { headerCustomizationCss, parseHeaderCustomization, type HeaderPart } from "@/lib/headerCustomization";
import LanguageSwitcher from "./LanguageSwitcher";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageVariant } from "@/lib/responsiveImage";

const mobileHeaderIcon = { className: "size-[22px] shrink-0", strokeWidth: 2.35 } as const;

const CartDrawer = lazy(() => import("./CartDrawer"));
const SearchPopover = lazy(() => import("./SearchPopover"));

const CartDrawerWhenOpened = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [hasOpened, setHasOpened] = useState(open);
  if (open && !hasOpened) setHasOpened(true);
  return hasOpened ? <CartDrawer open={open} onOpenChange={onOpenChange} /> : null;
};

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
  const [isSearchOpen, setIsSearchOpen] = useState<boolean | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  
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
  const siteLogo = getSetting("site_logo_text", "G");
  const siteLogoUrl = customization.mobile.logo?.imageUrl || getSetting("site_logo_url", "");
  const contactPhone = getSetting("footer_phone", "০১৭XX-XXXXXX");
  const contactEmail = getSetting("footer_email", "support@gadgetbd.com");
  
  // Header colors from settings
  const headerBgColor = getSetting("header_bg_color", "#0f172a");
  const headerTextColor = getSetting("header_text_color", "#ffffff");
  const topBarEnabled = getSetting("topbar_enabled", "1") !== "0";
  const topBarMessages = getSetting(
    "topbar_messages",
    "👉 টাকা হাতে পেয়ে দেখে টাকা দিন|🏆 ১০০% কোয়ালিটি পণ্য|🔁 ৭ দিনের রিটার্ন/এক্সচেঞ্জ|🚚 হোম ডেলিভারি সারা বাংলাদেশে"
  );
  const topBarMessage = topBarMessages.split(/\n|\|/).map(s => s.trim()).find(Boolean) || "";
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
        {getSetting('topbar_mode', 'marquee') !== 'static' ? (
          topBarEnabled && <div className="lg:hidden">
            <HeaderMarquee device="mobile" bn={language !== 'en'} messages={mobileCopy('message', topBarMessages)}
              duration={getSetting('topbar_marquee_duration', '30')}
              background={topBarBgColor || (getSetting('topbar_gradient_from') && getSetting('topbar_gradient_to') ? `linear-gradient(${topBarGradDir}, ${topBarGradFrom}, ${topBarGradTo})` : undefined)}
              color={topBarTextColor} />
          </div>
        ) : (
          (topBarEnabled || customization.mobile.topbar?.visible === true) && topBarMessage && (
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
          )
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
                  className="h-10 w-10 rounded-xl mobile-header-button flex items-center justify-center transition-colors"
                  style={{ color: headerTextColor }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {mobileMenuOpen ? <X {...mobileHeaderIcon} /> : <Menu {...mobileHeaderIcon} />}
                </button>
                <button
                  {...mobilePart('search')}
                  onClick={() => setIsMobileSearchOpen((v) => !v)}
                  aria-label="সার্চ"
                  className="h-10 w-10 rounded-xl mobile-header-button flex items-center justify-center transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Search {...mobileHeaderIcon} />
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
                  <button {...mobilePart('account')} className="flex items-center gap-2 p-2 rounded-xl max-lg:h-10 max-lg:w-10 max-lg:justify-center mobile-header-button transition-colors" style={{ color: headerTextColor }}>
                    <User {...mobileHeaderIcon} />
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
                  className="relative p-2 rounded-xl max-lg:h-10 max-lg:w-10 max-lg:flex max-lg:items-center max-lg:justify-center mobile-header-button transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShoppingCart {...mobileHeaderIcon} />
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
        {isMobileSearchOpen && (
          <div className="lg:hidden bg-background border-b border-border overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 duration-200">
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
          </div>
        )}

        <Sheet open={mobileMenuOpen} onOpenChange={open => { setMobileMenuOpen(open); if (!open) setExpandedMobileCategory(null); }}>
          <SheetContent
            side="left"
            showClose={false}
            data-header-device={menuDevice}
            data-header-part="dropdown"
            aria-describedby={undefined}
            onCloseAutoFocus={event => { event.preventDefault(); menuTriggerRef.current?.focus(); }}
            className="flex w-[82vw] max-w-[365px] flex-col gap-0 overflow-hidden border-r bg-background p-0 text-foreground lg:w-[390px] lg:max-w-[390px]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-3.5">
              <SheetTitle className="truncate text-base font-bold">
                {language === 'en' ? 'Browse Shopnil' : 'শপনিল ঘুরে দেখুন'}
              </SheetTitle>
              <SheetClose className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 text-sm font-medium hover:bg-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                <X className="size-4" aria-hidden="true" />{language === 'en' ? 'Close' : 'বন্ধ করুন'}
              </SheetClose>
            </div>
            <Tabs defaultValue="category" className="flex min-h-0 flex-1 flex-col">
              <TabsList aria-label={language === 'en' ? 'Browse options' : 'ব্রাউজ করার ধরন'} className="mx-3 my-2 grid h-auto shrink-0 grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                <TabsTrigger value="category" className="gap-2 rounded-lg py-2.5 data-[state=active]:text-primary">
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  {language === 'en' ? 'Categories' : 'ক্যাটেগরি'}
                </TabsTrigger>
                <TabsTrigger value="menu" className="gap-2 rounded-lg py-2.5 data-[state=active]:text-primary">
                  <Menu className="size-4" aria-hidden="true" />
                  {language === 'en' ? 'Menu' : 'মেনু'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="category" className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {parentCategories.map(cat => {
                    const subs = getSubcategories(cat.id);
                    const isExpanded = expandedMobileCategory === cat.id;
                    const name = language === 'en' ? cat.name : cat.name_bn;
                    const subId = `header-subcategories-${cat.id}`;
                    return (
                      <li key={cat.id}>
                        <div className="flex items-stretch">
                          <Link to={`/products?category=${encodeURIComponent(cat.slug)}`} onClick={() => setMobileMenuOpen(false)}
                            className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                              {cat.image_url ? <img src={imageVariant(cat.image_url, 384)} alt="" loading="lazy" decoding="async"
                                className="h-full w-full object-contain" /> : <ShoppingBag className="size-4" aria-hidden="true" />}
                            </span>
                            <span className="min-w-0 break-words">{name}</span>
                          </Link>
                          {subs.length > 0 && (
                            <button type="button" aria-expanded={isExpanded} aria-controls={subId}
                              aria-label={language === 'en' ? `Subcategories of ${name}` : `${name} এর সাবক্যাটেগরি`}
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                              className="my-1.5 grid w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                              <ChevronRight className={`size-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                        {subs.length > 0 && (
                          <ul id={subId} hidden={!isExpanded} className="border-t bg-muted/40 py-1 pl-8 pr-2">
                            {subs.map(sub => (
                              <li key={sub.id}>
                                <Link to={`/products?category=${encodeURIComponent(sub.slug)}`} onClick={() => setMobileMenuOpen(false)}
                                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground">
                                  {language === 'en' ? sub.name : sub.name_bn}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </TabsContent>

              <TabsContent value="menu" className="mt-0 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-4">
                <button type="button" onClick={() => { setIsSearchOpen(true); setMobileMenuOpen(false); }}
                  className="mb-2 flex w-full items-center gap-3 rounded-xl border border-border bg-muted px-3 py-3 text-sm text-muted-foreground">
                  <Search className="size-4" aria-hidden="true" />{t('header.search_products')}
                </button>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  {t('header.all_products')}
                </Link>
                <Link
                  to="/products?featured=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-orange-500 hover:bg-muted rounded-xl transition-colors"
                >
                  {t('header.hot_deal')}
                </Link>

                {pages.filter(p => p.is_published).map((page) => (
                  <Link
                    key={page.id}
                    to={`/${page.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
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
                      className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5 opacity-60" />
                      {isAdmin ? t('header.admin_dashboard') : isModerator ? t('header.moderator_dashboard') : t('header.my_dashboard')}
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      {t('header.my_orders')}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-destructive hover:bg-muted rounded-xl transition-colors text-left"
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
                      className="block px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      {t('header.register')}
                    </Link>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </header>

      {/* Search Popover */}
      {isSearchOpen !== null && <Suspense fallback={null}>
        <SearchPopover isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </Suspense>}

      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawerWhenOpened open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      </Suspense>
    </>
  );
};

export default Header;
