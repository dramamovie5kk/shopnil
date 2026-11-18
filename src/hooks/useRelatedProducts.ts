import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/cloudflare/client';
import { useSiteSettings } from './useSiteSettings';
import { productEnabled, productNumber, selectedRelatedIds } from '@/lib/productPageSettings';
import type { Product } from '@/types';
export function useRelatedProducts(productId:string|undefined){
  const {getSetting}=useSiteSettings();const mode=getSetting('product_related_mode','auto');
  const ids=selectedRelatedIds(getSetting('product_related_ids'));const count=productNumber(getSetting('product_related_count','4'),1,12,4);
  return useQuery({queryKey:['related-products',productId,mode,ids,count],enabled:!!productId&&productEnabled(getSetting('product_related_enabled','true')),staleTime:180000,queryFn:async()=>{
    if(mode==='manual'&&!ids.length)return [];
    let query=api.from('products').select('*, categories(*)').neq('id',productId!);
    query=mode==='manual'?query.in('id',ids).limit(24):query.order('created_at',{ascending:false}).limit(count);
    const {data,error}=await query;if(error)throw error;
    const rows=(data || []) as Product[];
    return (mode==='manual'?ids.map(id=>rows.find(row=>row.id===id)).filter((row):row is Product=>!!row):rows).slice(0,count);
  }});
}
