import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { homeSectionEnabled } from '@/lib/homePageSettings';

export default function HomePageSettings({ values,onChange }: { values:Record<string,string>;onChange:(key:string,value:string)=>void }) {
  const text=(key:string,label:string)=><div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Input id={key} value={values[key] || ''} onChange={e=>onChange(key,e.target.value)} /></div>;
  const color=(key:string,label:string)=><div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><div className="flex gap-2"><input type="color" aria-label={`${label} পিকার`} value={/^#[\da-f]{6}$/i.test(values[key] || '')?values[key]:'#ffffff'} onChange={e=>onChange(key,e.target.value)} className="h-10 w-12 shrink-0 rounded border"/><Input id={key} value={values[key] || ''} onChange={e=>onChange(key,e.target.value)} placeholder="খালি রাখলে বর্তমান রং" /></div></div>;
  const toggle=(key:string,label:string)=><div className="flex items-center justify-between gap-3"><Label htmlFor={key}>{label}</Label><Switch id={key} checked={homeSectionEnabled(values[key] || 'true')} onCheckedChange={checked=>onChange(key,String(checked))}/></div>;
  return <div className="space-y-6">
    <p className="text-sm text-muted-foreground">হোমপেজের সেকশনগুলো সাজিয়ে নিচের “সেটিংস সেভ করুন” চাপুন।</p>
    <section className="space-y-4 rounded-xl border p-5"><h2 className="text-lg font-semibold">প্রোডাক্ট সেকশন</h2>
      {toggle('home_products_enabled','প্রোডাক্ট / সেলস পেজের তালিকা দেখাবে')}
      <div className="grid gap-4 md:grid-cols-2">{text('home_products_title','সেকশনের শিরোনাম')}{text('home_products_subtitle','ছোট বিবরণ')}{text('home_shop_button_text','সব প্রোডাক্ট দেখার বাটন')}{text('home_products_button_text','ল্যান্ডিং মোডে সেলস পেজের বাটন')}</div>
      <p className="text-xs text-muted-foreground">নিচের সংখ্যা ও কলামের সেটিংস ওয়েবসাইট মোডের প্রোডাক্ট গ্রিডের জন্য।</p>
      <div className="grid gap-4 sm:grid-cols-3">{([['home_products_limit','প্রোডাক্ট সংখ্যা',1,60],['home_products_columns_mobile','মোবাইলে প্রতি সারিতে',1,3],['home_products_columns_desktop','ডেস্কটপে প্রতি সারিতে',2,6]] as const).map(([key,label,min,max])=><div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Input id={key} type="number" min={min} max={max} value={values[key]} onChange={e=>onChange(key,e.target.value)}/></div>)}</div>
      <div className="grid gap-4 md:grid-cols-2">{color('home_products_title_color','প্রোডাক্ট শিরোনামের রং')}{color('home_products_bg_color','প্রোডাক্ট সেকশনের পটভূমি')}{color('home_products_button_bg_color','প্রোডাক্ট বাটনের পটভূমি')}{color('home_products_button_text_color','প্রোডাক্ট বাটনের লেখা')}</div>
    </section>
    <section className="space-y-4 rounded-xl border p-5"><h2 className="text-lg font-semibold">ক্যাটেগরি সেকশন</h2>
      {toggle('category_section_enabled','হোমপেজে ক্যাটেগরি দেখাবে')}
      <p className="text-xs text-muted-foreground">ক্যাটেগরি সেকশন ওয়েবসাইট মোডের হোমপেজে দেখাবে। ক্যাটেগরির নাম ও ছবি ক্যাটেগরি ম্যানেজমেন্ট থেকে বদলান।</p>
      <div className="grid gap-4 md:grid-cols-2">{text('category_section_title','ক্যাটেগরি শিরোনাম')}{text('category_section_button_text','সব দেখুন বাটনের লেখা')}
        {color('category_section_title_color','ক্যাটেগরি শিরোনামের রং')}{color('category_section_bg_color','ক্যাটেগরি সেকশনের পটভূমি')}{color('category_section_button_bg_color','ক্যাটেগরি বাটনের পটভূমি')}{color('category_section_button_text_color','ক্যাটেগরি বাটনের লেখা')}{color('category_card_bg_color','ক্যাটেগরি কার্ডের পটভূমি')}{color('category_card_border_color','ক্যাটেগরি কার্ডের বর্ডার')}{color('category_text_color','ক্যাটেগরির নামের রং')}
      </div>{toggle('category_section_border','ক্যাটেগরি কার্ডের বর্ডার দেখাবে')}
    </section>
  </div>;
}
