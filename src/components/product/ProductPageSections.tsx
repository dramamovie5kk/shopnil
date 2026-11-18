import DOMPurify from 'dompurify';
import { FileText, RotateCcw, Star, Facebook, Instagram, Youtube, Music2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { productEnabled, safeProductLink } from '@/lib/productPageSettings';
import ReviewSection from './ReviewSection';
import type { Product } from '@/types';
export default function ProductPageSections({product}:{product:Product}){
  const {getSetting}=useSiteSettings();const {language,t}=useLanguage();
  const social=[['facebook',Facebook,'Facebook'],['instagram',Instagram,'Instagram'],['youtube',Youtube,'YouTube'],['tiktok',Music2,'TikTok']] as const;
  const links=social.map(([key,Icon,label])=>({key,Icon,label,url:safeProductLink(getSetting(`product_social_${key}`,getSetting(`social_${key}`)))})).filter(link=>link.url&&productEnabled(getSetting(`product_social_${link.key}_enabled`,'true')));
  const description=language==='en'?(product.description || product.description_bn):(product.description_bn || product.description);
  return <div data-product-lower className="mt-6 space-y-5">
    {productEnabled(getSetting('product_social_enabled','true'))&&links.length>0&&<section data-product-social className="flex flex-col items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-center sm:flex-row sm:text-left">
      <div><h2 className="font-semibold">{getSetting('product_social_title','আমাদের সঙ্গে যুক্ত থাকুন')}</h2><p className="mt-1 text-xs opacity-70">{getSetting('product_social_subtitle','নতুন পণ্য ও আপডেট পেতে আমাদের সঙ্গে থাকুন')}</p></div>
      <div className="flex flex-wrap justify-center gap-2">{links.map(({key,Icon,label,url})=><a key={key} href={url} aria-label={label} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border bg-white text-[#276442] shadow-sm transition-transform hover:-translate-y-0.5"><Icon className="h-5 w-5"/></a>)}</div>
    </section>}
    <Accordion type="multiple" defaultValue={productEnabled(getSetting('product_description_open','true'))?['description']:[]} className="space-y-3">
      {productEnabled(getSetting('product_description_enabled','true'))&&<AccordionItem data-product-detail-panel value="description" className="overflow-hidden rounded-xl border px-4 md:px-5">
        <AccordionTrigger className="gap-3 py-4 text-left font-semibold hover:no-underline"><span className="flex items-center gap-3"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><FileText className="h-4 w-4"/></span>{getSetting('product_description_title','বিস্তারিত বিবরণ')}</span></AccordionTrigger>
        <AccordionContent className="pb-5"><div className="product-details-copy prose prose-sm max-w-none whitespace-pre-line leading-7" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(description || t('product.no_description'))}}/></AccordionContent>
      </AccordionItem>}
      {productEnabled(getSetting('product_policy_enabled','true'))&&<AccordionItem data-product-detail-panel value="policy" className="overflow-hidden rounded-xl border px-4 md:px-5">
        <AccordionTrigger className="gap-3 py-4 text-left font-semibold hover:no-underline"><span className="flex items-center gap-3"><span className="rounded-lg bg-orange-50 p-2 text-orange-700"><RotateCcw className="h-4 w-4"/></span>{getSetting('product_policy_title','রিটার্ন ও এক্সচেঞ্জ পলিসি')}</span></AccordionTrigger>
        <AccordionContent className="whitespace-pre-line pb-5 text-sm leading-7">{getSetting('product_policy_content',getSetting('return_policy','৭ দিনের মধ্যে রিটার্ন/এক্সচেঞ্জ করা যাবে। পণ্য অবশ্যই অব্যবহৃত ও আসল প্যাকেজিং সহ থাকতে হবে।'))}</AccordionContent>
      </AccordionItem>}
      {productEnabled(getSetting('product_reviews_enabled','true'))&&<AccordionItem data-product-detail-panel value="reviews" className="overflow-hidden rounded-xl border px-4 md:px-5">
        <AccordionTrigger className="gap-3 py-4 text-left font-semibold hover:no-underline"><span className="flex flex-wrap items-center gap-3"><span className="rounded-lg bg-amber-50 p-2 text-amber-600"><Star className="h-4 w-4"/></span>{getSetting('product_reviews_title','কাস্টমার রিভিউ')}<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">★ {(product.rating || 0).toFixed(1)}</span></span></AccordionTrigger>
        <AccordionContent className="pb-5"><ReviewSection productId={product.id} productName={product.name_bn} totalReviews={product.reviews_count} averageRating={product.rating} embedded/></AccordionContent>
      </AccordionItem>}
    </Accordion>
  </div>;
}
