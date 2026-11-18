import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MessageCircle, User, Tag } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { bottomBarDefaults, bottomLink, bottomWhatsapp } from '@/lib/bottomBarSettings';
const MobileBottomNav=()=>{
 const {pathname,search}=useLocation();const {getSetting}=useSiteSettings();
 const value=(key:string,fallback='')=>getSetting(key,(bottomBarDefaults as Record<string,string>)[key]??fallback);
 const color=(key:string,fallback:string)=>/^#[\da-f]{6}$/i.test(value(key))?value(key):fallback;
 if(value('bottom_nav_enabled')==='false'||value('bottom_nav_enabled')==='0'||['/lp/','/admin','/checkout','/order-success','/lp-order-success'].some(p=>pathname.startsWith(p)))return null;
 const number=value('bottom_nav_whatsapp_number');
 const whatsapp=bottomWhatsapp(number,getSetting('bottom_nav_whatsapp_link'),value('bottom_nav_whatsapp_message'))||(!number?bottomWhatsapp(getSetting('whatsapp_number')||getSetting('footer_whatsapp_number'),'',value('bottom_nav_whatsapp_message')):undefined);
 const items=[{key:'home',Icon:Home,href:bottomLink(value('bottom_nav_home_link','/'),'/')},{key:'shop',Icon:ShoppingBag,href:bottomLink(value('bottom_nav_shop_link','/products'),'/products')},{key:'offers',Icon:Tag,href:bottomLink(value('bottom_nav_offers_link','/products?featured=true'),'/products?featured=true')},{key:'whatsapp',Icon:MessageCircle,href:whatsapp},{key:'account',Icon:User,href:bottomLink(value('bottom_nav_account_link','/dashboard'),'/dashboard')}];
 return <nav data-mobile-bottom-bar aria-label="মোবাইল নেভিগেশন" className="fixed bottom-0 inset-x-0 z-40 border-t shadow-[0_-2px_12px_#00000008] lg:hidden" style={{background:color('bottom_nav_background','#ffffff'),paddingBottom:'env(safe-area-inset-bottom, 0px)'}}><div className="flex h-16 items-stretch px-1">{items.map(({key,Icon,href})=>{
 const active=!!href&&(href.includes('?')?pathname+search===href:pathname===href&&!((key==='shop')&&search));
 const tone=key==='whatsapp'||active?color('bottom_nav_active_color','#16b653'):key==='offers'?color('bottom_nav_offers_color','#ff781c'):color('bottom_nav_color','#6b8580');
 const content=<><Icon className="h-[23px] w-[23px] shrink-0" strokeWidth={1.6}/><span className="max-w-full truncate text-[10px] leading-4">{value('bottom_nav_'+key+'_label')}</span></>;
 const props={className:'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 transition-opacity active:opacity-60',style:{color:tone}};
 if(!href)return <span key={key} {...props} aria-disabled="true" className={props.className+' opacity-50'}>{content}</span>;
 return href.startsWith('/')?<Link key={key} to={href} {...props} aria-current={active?'page':undefined}>{content}</Link>:<a key={key} href={href} {...props} target="_blank" rel="noopener noreferrer">{content}</a>;
 })}</div></nav>;
};
export default MobileBottomNav;
