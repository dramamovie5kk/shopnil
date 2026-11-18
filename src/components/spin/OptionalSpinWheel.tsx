import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SpinWheel = lazy(() => import('./SpinWheel'));
export default function OptionalSpinWheel() {
  const { getSetting, isLoading } = useSiteSettings();
  const { pathname } = useLocation();
  const excluded = ['/checkout', '/order-success', '/lp-order-success', '/admin'].some(path => pathname.startsWith(path));
  if (isLoading || excluded || getSetting('spin_enabled', 'false') !== 'true') return null;
  return <Suspense fallback={null}><SpinWheel /></Suspense>;
}
