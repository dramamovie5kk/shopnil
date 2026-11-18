import { imageVariant, imageSrcSet } from "@/lib/responsiveImage";
import { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { Play, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface ProductMediaProps {
  imageUrl: string | null; videoUrl: string | null; images?: string[] | null;
  isNew?: boolean; discount?: number; showVideoFirst?: boolean;
}
const ProductMedia = memo(({imageUrl,videoUrl,images=[]}: ProductMediaProps)=>{
  const [selected,setSelected]=useState(0);
  const candidate=videoUrl?.match(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/)?.[1];
  const videoId=candidate && /^[\w-]{11}$/.test(candidate)?candidate:undefined;
  const slides=useMemo(()=>{
    const photos=[...new Set([imageUrl,...(images || [])].filter((src):src is string=>!!src))].map(src=>({src,video:false}));
    if(videoId)photos.splice(imageUrl?1:0,0,{src:`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,video:true});
    return photos;
  },[imageUrl,images,videoId]);
  const [ref,api]=useEmblaCarousel({loop:slides.length>1});
  const sync=useCallback(()=>setSelected(api?.selectedScrollSnap() || 0),[api]);
  useEffect(()=>{if(!api)return;sync();api.on('select',sync).on('reInit',sync);return()=>{api.off('select',sync).off('reInit',sync);};},[api,sync]);
  return <div data-product-media className="flex min-w-0 flex-col-reverse gap-3 lg:grid lg:grid-cols-[64px_minmax(0,1fr)] lg:items-start">
    {slides.length>0 && <div aria-label="প্রোডাক্টের ছোট ছবি" className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[420px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:py-3">
      {slides.map((slide,index)=><button type="button" key={`${slide.src}-${index}`} aria-label={`প্রোডাক্টের ছবি ${index+1}`} aria-pressed={selected===index} onClick={()=>api?.scrollTo(index)} className={cn('relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-white p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',selected===index?'border-[#fa861c]':'border-gray-200 hover:border-orange-300')}>
        <img src={imageVariant(slide.src,384)} decoding="async" alt={`থাম্বনেইল ${index+1}`} loading="lazy" className="h-full w-full object-contain" />
        {slide.video?<Play className="absolute inset-0 m-auto h-5 w-5 fill-white text-orange-500"/>:selected===index?<span className="absolute bottom-1 right-1 rounded-full bg-[#fa861c] p-0.5 text-white"><Check className="h-3 w-3"/></span>:null}
      </button>)}
    </div>}
    <div className="relative min-w-0 overflow-hidden rounded-sm border border-gray-200 bg-white">
      {slides.length?<div ref={ref} className="overflow-hidden"><div className="flex">{slides.map((slide,index)=><div key={`${slide.src}-${index}`} className="min-w-0 flex-[0_0_100%]"><div className="flex aspect-square items-center justify-center bg-white lg:aspect-auto lg:h-[420px]">
        {slide.video && selected===index?<iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=0`} title="Product video" className="h-full w-full" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />:<img src={imageVariant(slide.src,960)} srcSet={imageSrcSet(slide.src)} sizes="(min-width: 1024px) 50vw, 100vw" decoding="async" alt={`প্রোডাক্ট ${index+1}`} className="h-full w-full object-contain" draggable={false} loading={index===0?'eager':'lazy'} fetchPriority={index===0?'high':'auto'} />}
      </div></div>)}</div></div>:<div className="flex aspect-square items-center justify-center bg-white lg:aspect-auto lg:h-[420px]"><span className="text-7xl">📦</span></div>}
      {slides.length>1 && <><button type="button" aria-label="আগের প্রোডাক্ট ছবি" onClick={()=>api?.scrollPrev()} className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-slate-400 hover:text-orange-500"><ChevronLeft className="h-4 w-4"/></button><button type="button" aria-label="পরের প্রোডাক্ট ছবি" onClick={()=>api?.scrollNext()} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-blue-500 hover:text-orange-500"><ChevronRight className="h-4 w-4"/></button></>}
    </div>
  </div>;
});
ProductMedia.displayName='ProductMedia';
export default ProductMedia;
