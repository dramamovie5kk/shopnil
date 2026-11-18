import { parseHeaderCustomization, type HeaderPart } from '@/lib/headerCustomization';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Heart, User, ShoppingBag, ShieldCheck, Truck, Sun, LogOut, LayoutDashboard } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffAccess } from '@/hooks/useStaffAccess';
import { useWishlist } from '@/hooks/useWishlist';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function DesktopHeader({ onMenuOpen }: { onMenuOpen: (trigger: HTMLButtonElement) => void }) {
  const { getSetting } = useSiteSettings();
  const theme = parseHeaderCustomization(getSetting('header_customization')).desktop;
  const copy = (part: HeaderPart, fallback: string) => theme[part]?.text?.trim() || fallback;
  const part = (name: HeaderPart) => ({ 'data-header-device': 'desktop', 'data-header-part': name });
  const { language, t } = useLanguage();
  const { cartCount, cartTotal, setIsDrawerOpen } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin, isModerator } = useStaffAccess();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const bn = language !== 'en';
  const siteName = getSetting('site_name', 'বারিধারা');
  const logo = theme.logo?.imageUrl || getSetting('site_logo_url');
  const messages = getSetting('topbar_messages', bn ? 'টাকা হাতে পেয়ে দেখে পরিশোধ করুন!' : 'Pay when your order arrives').split(/\n|\|/).map(x => x.trim()).filter(Boolean);
  const plain = (text: string) => text.replace(/<[^>]*>/g, '').trim();
  const dashboard = isAdmin || isModerator ? '/admin' : '/dashboard';
  const locale = bn ? 'bn-BD' : 'en-BD';
  const iconClass = 'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e3ebe6] bg-white text-[#173d2d] transition-colors hover:bg-[#eff6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b7745]';
  return <div data-desktop-header className="hidden lg:block">
    {(getSetting('topbar_enabled', '1') !== '0' || theme.topbar?.visible === true) && <div {...part('topbar')} className="bg-[#073b29] text-white" style={{ backgroundImage: 'radial-gradient(#ffffff12 0.6px, transparent 0.6px)', backgroundSize: '16px 16px' }}>
      <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-between gap-5 px-5 text-[11px] xl:text-xs">
        <div className="flex shrink-0 items-center gap-4">
          <span {...part('assurance')} className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#f4c700]" />{plain(copy('assurance',getSetting('topbar_original', bn ? 'পণ্যের মানের নিশ্চয়তা' : 'Quality products')))}</span>
          <span className="h-3 w-px bg-white/20" />
          <span {...part('delivery')} className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[#f4c700]" />{plain(copy('delivery',getSetting('topbar_delivery', bn ? 'সারা দেশে ক্যাশ অন ডেলিভারি' : 'Delivery across Bangladesh')))}</span>
        </div>
        <p className="flex min-w-0 items-center justify-end gap-2"><span {...part('offer')} className="shrink-0 rounded-full bg-[#f5c900] px-2 py-0.5 text-[10px] font-bold text-[#143d28]">{copy('offer',bn ? 'অফার' : 'Offer')}</span><span {...part('message')} className="truncate">{plain(copy('message',messages[0] || ''))}</span></p>
      </div>
    </div>}
    <div {...part('header')} className="border-b border-[#e7eee8] bg-white text-[#153d2a]">
      <div data-header-row className="mx-auto flex h-[88px] max-w-[1440px] items-center gap-4 px-5 xl:gap-5">
        <button {...part('menu')} type="button" aria-label={bn ? 'ডেস্কটপ মেনু' : 'Desktop menu'} aria-haspopup="dialog" onClick={event => onMenuOpen(event.currentTarget)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f3] text-[#17492f] hover:bg-[#e3eee7]"><Menu className="h-5 w-5" /></button>
        <Link {...part('logo')} to="/" aria-label={siteName} className="flex min-w-0 max-w-[230px] shrink-0 items-center gap-3">
          {logo ? <img src={logo} alt={siteName} className="h-12 w-auto max-w-[190px] object-contain" /> : <><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#07522f] to-[#188449] text-[#f6cf24] shadow-md"><Sun className="h-7 w-7" /></span><span className="min-w-0"><span {...part('brand')} className="block max-w-[160px] truncate text-[23px] font-bold leading-tight tracking-tight">{copy('brand',siteName)}<span className="text-[#dcae00]">.</span></span><span {...part('tagline')} className="block max-w-[160px] truncate text-xs font-medium text-[#26704a]">{copy('tagline',getSetting('site_tagline', bn ? 'বাংলা ফুড' : 'Bangla Food'))}</span></span></>}
        </Link>
        <form {...part('search')} role="search" aria-label={bn ? 'প্রোডাক্ট খুঁজুন' : 'Find products'} onSubmit={event => { event.preventDefault(); if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`); }} className="ml-1 flex min-w-0 flex-1 items-center rounded-full border border-[#cbd7cf] bg-[#f9fbfa] p-1 shadow-inner focus-within:ring-2 focus-within:ring-[#1b7745]/30">
          <input {...part('searchInput')} type="search" aria-label={bn ? 'প্রোডাক্টের নাম' : 'Product name'} placeholder={copy('searchInput',bn ? 'আপনার পছন্দের খাঁটি পণ্যটি খুঁজুন…' : 'Search your favourite products…')} value={search} onChange={event => setSearch(event.target.value)} className="h-10 w-full min-w-0 rounded-full bg-transparent px-4 text-sm text-[#173d2d] outline-none placeholder:text-[#98a49d]" />
          <button {...part('searchButton')} type="submit" className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#073d29] px-5 text-sm font-semibold text-white hover:bg-[#145a3b]"><Search className="h-4 w-4" /><span>{copy('searchButton',bn ? 'খুঁজুন' : 'Search')}</span></button>
        </form>
        <div className="flex shrink-0 items-center gap-3">
          <Link {...part('wishlist')} to="/wishlist" aria-label={t('header.wishlist')} className={iconClass}><Heart className="h-5 w-5" />{wishlistItems.length > 0 && <span {...part('badge')} className="absolute -right-0.5 -top-1 rounded-full bg-[#178344] px-1.5 text-[10px] font-bold text-white">{wishlistItems.length.toLocaleString(locale)}</span>}</Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button {...part('account')} type="button" aria-label={t('header.account')} className={iconClass}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f7f2]"><User className="h-4 w-4" /></span></button></DropdownMenuTrigger>
            <DropdownMenuContent {...part('dropdown')} align="end" className="w-52">
              {user ? <><DropdownMenuItem asChild><Link to={dashboard}><LayoutDashboard className="mr-2 h-4 w-4" />{isAdmin ? t('header.admin_dashboard') : isModerator ? t('header.moderator_dashboard') : t('header.my_dashboard')}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/orders">{t('header.my_orders')}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/profile">{bn ? 'প্রোফাইল' : 'Profile'}</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={async () => { await signOut(); navigate('/'); }}><LogOut className="mr-2 h-4 w-4" />{t('header.logout')}</DropdownMenuItem></> : <><DropdownMenuItem asChild><Link to="/login">{t('header.login')}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/register">{t('header.register')}</Link></DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
          <button {...part('cart')} type="button" onClick={() => setIsDrawerOpen(true)} aria-label={bn ? 'কার্ট খুলুন' : 'Open cart'} className="flex h-11 items-center gap-3 rounded-full bg-gradient-to-r from-[#07412a] to-[#158241] px-4 text-white shadow-md hover:brightness-110">
            <span className="relative"><ShoppingBag className="h-5 w-5 text-[#f6d200]" /><span {...part('badge')} className="absolute -right-2 -top-2 min-w-4 rounded-full bg-[#f5cd00] px-1 text-[9px] font-bold text-[#153d2a]">{cartCount.toLocaleString(locale)}</span></span>
            <span className="text-left text-[10px] leading-tight"><span className="block">{copy('cart',bn ? 'মোট বাজার' : 'Cart total')}</span><strong className="block text-sm">৳ {cartTotal.toLocaleString(locale, { maximumFractionDigits: 2 })}</strong></span>
          </button>
        </div>
      </div>
    </div>
  </div>;
}
