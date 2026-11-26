import type { CSSProperties } from 'react';
import { extraHomeProductSlots, homePageDefaults, homeSectionEnabled, homeNumber, homeColor } from '@/lib/homePageSettings';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeBanner from '@/components/home/HomeBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import ReelsSection from '@/components/home/ReelsSection';
import ProductCard from '@/components/home/ProductCard';
import BlogSection from '@/components/home/BlogSection';
import { Button } from '@/components/ui/button';
import { useCategories, useProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';

function HomeProductGrid({ slot, categorySlug, categoryTitle }: { slot: number; categorySlug: string; categoryTitle?: string }) {
  const { getSetting } = useSiteSettings();
  const { data: products = [], isLoading, isError, refetch } = useProducts({
    compact: true,
    limit: homeNumber(getSetting('home_products_limit', '12'), 1, 60, 12),
    categorySlug: categorySlug || undefined,
  });
  const { language, t } = useLanguage();
  const customTitle = slot === 1 ? getSetting('home_products_title', homePageDefaults.home_products_title) : '';
  const title = slot === 1 && language !== 'en' && customTitle !== homePageDefaults.home_products_title
    ? customTitle
    : categoryTitle || (language === 'en' ? t('products.all_products') : homePageDefaults.home_products_title);
  const headingId = slot === 1 ? 'home-products-heading' : `home-products-heading-${slot}`;
  const Heading = slot === 1 ? 'h1' : 'h2';
  const shopPath = categorySlug ? `/shop?category=${encodeURIComponent(categorySlug)}` : '/shop';

  return <section style={{backgroundColor:homeColor(getSetting('home_products_bg_color'))}} className="py-8 w-[calc(100vw-40px)] left-1/2 -translate-x-1/2 relative" aria-labelledby={headingId}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Heading style={{color:homeColor(getSetting('home_products_title_color'))}} id={headingId} className="text-2xl md:text-3xl font-bold">{title}</Heading>
          <Button asChild variant="outline" style={{backgroundColor:homeColor(getSetting('home_products_button_bg_color')),color:homeColor(getSetting('home_products_button_text_color'))}}><Link to={shopPath}>{language === 'en' ? 'Visit shop' : getSetting('home_shop_button_text','সব প্রোডাক্ট দেখুন')}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
        {slot === 1 && getSetting('home_products_subtitle') && <p className="mb-5 text-muted-foreground">{getSetting('home_products_subtitle')}</p>}
        {isLoading ? <div role="status" className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin" /></div> : isError ?
          <div role="alert" className="py-10 text-center space-y-3"><p>{language === 'en' ? 'Could not load products.' : 'প্রোডাক্ট লোড করতে সমস্যা হয়েছে।'}</p><Button variant="outline" onClick={() => refetch()}>{language === 'en' ? 'Try again' : 'আবার চেষ্টা করুন'}</Button></div> : products.length ?
          <div className="grid home-products-grid gap-3 md:gap-5" style={{'--home-grid-mobile':homeNumber(getSetting('home_products_columns_mobile','2'),1,3,2),'--home-grid-desktop':homeNumber(getSetting('home_products_columns_desktop','4'),2,6,4)} as CSSProperties}>{products.map(product => <ProductCard key={product.id} product={product} />)}</div> :
          <p className="text-center text-muted-foreground py-10">{language === 'en' ? 'No products yet.' : 'এখনও কোনো প্রোডাক্ট যোগ করা হয়নি।'}</p>}
      </section>;
}

export default function WebsiteHome() {
  const { getSetting } = useSiteSettings();
  const { data: categories = [] } = useCategories();
  const { language } = useLanguage();
  const sections = [
    { slot: 1, enabled: homeSectionEnabled(getSetting('home_products_enabled', 'true')), category: getSetting('home_products_category') },
    ...extraHomeProductSlots.map(slot => ({
      slot,
      enabled: homeSectionEnabled(getSetting(`home_products_${slot}_enabled`, 'false')),
      category: getSetting(`home_products_${slot}_category`),
    })),
  ];

  return <div className="min-h-screen flex flex-col">
    <Header />
    <HomeBanner />
    <main className="flex-1 max-w-[1240px] mx-auto w-full px-1.5 md:px-4 pb-20 lg:pb-8">
      <CategoryGrid />
      <ReelsSection />
      {sections.filter(section => section.enabled).map(({ slot, category }) => {
        const match = categories.find(item => item.slug === category);
        return <HomeProductGrid key={slot} slot={slot} categorySlug={category}
          categoryTitle={language === 'en' ? match?.name : match?.name_bn || match?.name} />;
      })}
      <BlogSection />
    </main>
    <Footer />
  </div>;
}
