import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getSiteMode } from '@/lib/siteMode';

const LandingHome = lazy(() => import('./HomeSalesPage'));
const WebsiteHome = lazy(() => import('./WebsiteHome'));
const LoadingHome = () => <div role="status" aria-label="হোমপেজ লোড হচ্ছে" className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

export default function HomePage() {
  const { getSetting, isLoading } = useSiteSettings();
  if (isLoading) return <LoadingHome />;
  return <Suspense fallback={<LoadingHome />}>
    {getSiteMode(getSetting('site_mode')) === 'website' ? <WebsiteHome /> : <LandingHome />}
  </Suspense>;
}
