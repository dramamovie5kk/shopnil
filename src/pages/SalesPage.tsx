import { lazy, Suspense } from "react";
 import { useParams, useNavigate } from "react-router-dom";
 import { useSalesPage } from "@/hooks/useSalesPages";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Button } from "@/components/ui/button";
import { pageWithAvailableDesigns } from "@/lib/salesSectionDesignAvailability";
import { withCustomSectionOrder } from '@/lib/salesCustomSections';
 
 // Template Components - Self-contained full page templates
const Template01Organic = lazy(() => import("@/components/salespage/templates/Template01Organic"));
const Template02Clothing = lazy(() => import("@/components/salespage/templates/Template02Clothing"));
const Template03Fashion = lazy(() => import("@/components/salespage/templates/Template03Fashion"));
const Template04Gadget = lazy(() => import("@/components/salespage/templates/Template04Gadget"));
const Template05Countdown = lazy(() => import("@/components/salespage/templates/Template05Countdown"));
const Template06Panjabi = lazy(() => import("@/components/salespage/templates/Template06Panjabi"));
const Template07Gadget = lazy(() => import("@/components/salespage/templates/Template07Gadget"));
const Template08Minimal = lazy(() => import("@/components/salespage/templates/Template08Minimal"));
const Template09SuperFood = lazy(() => import("@/components/salespage/templates/Template09SuperFood"));
const Template10SuperFood2 = lazy(() => import("@/components/salespage/templates/Template10SuperFood2"));
const Template11SuperFood3 = lazy(() => import("@/components/salespage/templates/Template11SuperFood3"));
const Template12Gadget3 = lazy(() => import("@/components/salespage/templates/Template12Gadget3"));
const Template13NaturalCard = lazy(() => import("@/components/salespage/templates/Template13NaturalCard"));
const Template14VideoOrganic = lazy(() => import("@/components/salespage/templates/Template14VideoOrganic"));
import SalesPageEngagementTracker from "@/components/salespage/SalesPageEngagementTracker";
const Template15Universal = lazy(() => import("@/components/salespage/templates/Template15Universal"));

const LegacySalesPageRenderer = lazy(() => import("@/components/salespage/LegacySalesPageRenderer"));

const SalesPage = ({ slugOverride }: { slugOverride?: string } = {}) => {
  const params = useParams<{ slug: string }>();
  const slug = slugOverride || params.slug;
  const navigate = useNavigate();
  const { data: page, isLoading, error } = useSalesPage(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Skeleton className="h-12 w-full bg-gray-800" />
          <Skeleton className="h-64 w-full bg-gray-800" />
          <Skeleton className="h-32 w-full bg-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">পেজ পাওয়া যায়নি</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            হোমে ফিরুন
          </Button>
        </div>
      </div>
    );
  }

   return <SalesPageContent page={page} />;
 };

type LoadedSalesPage = NonNullable<ReturnType<typeof useSalesPage>['data']>;

export const SalesPageContent = ({ page: rawPage }: { page: LoadedSalesPage }) => {
   const renderTemplate = (page: LoadedSalesPage) => {
     switch (page.template_id) {
       case 'template-01-organic':
       case 'nature-fresh': // Legacy support
         return <Template01Organic page={page} />;
       
       case 'template-02-clothing':
         return <Template02Clothing page={page} />;
      
      case 'template-03-fashion':
        return <Template03Fashion page={page} />;
       
       case 'template-04-gadget':
         return <Template04Gadget page={page} />;
 
        case 'template-05-countdown':
          return <Template05Countdown page={page} />;

        case 'template-06-panjabi':
          return <Template06Panjabi page={page} />;

        case 'template-07-gadget':
          return <Template07Gadget page={page} />;

        case 'template-08-minimal':
          return <Template08Minimal page={page} />;

        case 'template-09-superfood':
          return <Template09SuperFood page={page} />;

        case 'template-10-superfood2':
          return <Template10SuperFood2 page={page} />;

        case 'template-11-superfood3':
          return <Template11SuperFood3 page={page} />;

        case 'template-12-gadget3':
          return <Template12Gadget3 page={page} />;

          case 'template-13-natural-card':
           return <Template13NaturalCard page={page} />;

          case 'template-14-video-organic':
            return <Template14VideoOrganic page={page} />;

          case 'template-15-universal':
            return <Template15Universal page={page} />;

           // Default: Use legacy section-based rendering for old templates
         default:
           return <LegacySalesPageRenderer page={page} />;
     }
   };
 
   return (
     <>
       <SalesPageEngagementTracker page={rawPage} />
       <Suspense fallback={<div className="min-h-screen p-4" role="status" aria-label="পেজ লোড হচ্ছে"><Skeleton className="h-64 max-w-3xl mx-auto" /></div>}>{renderTemplate(withCustomSectionOrder(pageWithAvailableDesigns(rawPage)))}</Suspense>
     </>
   );
 };
 

export default SalesPage;
