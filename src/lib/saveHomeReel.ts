import { api } from '@/integrations/cloudflare/client';
import { homeReelsSetting, parseHomeReels, type HomeReel } from '@/lib/homeReels';

export async function saveHomeReel(original: HomeReel | null, next: HomeReel | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row, error: readError } = await api.from('site_settings')
      .select('id,setting_value').eq('setting_key', homeReelsSetting).maybeSingle();
    if (readError) throw readError;
    const raw = row?.setting_value || '[]';
    const records: (HomeReel | null)[] = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error('রিলসের তালিকাটি পড়া যায়নি।');
    const current = parseHomeReels(raw);
    if (original) {
      const saved = current.find(reel => reel.id === original.id);
      if (JSON.stringify(saved) !== JSON.stringify(original)) {
        throw new Error('এই রিলটি অন্য কোথাও বদলানো হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
      }
    } else if (records.length >= 30) {
      throw new Error('সর্বোচ্চ ৩০টি রিল রাখা যাবে।');
    }
    let updated = records;
    if (original) updated = next ? records.map(reel => reel?.id === original.id ? next : reel) : records.filter(reel => reel?.id !== original.id);
    else if (next) updated = [...records, next];

    const setting_value = JSON.stringify(updated);
    const updated_at = new Date().toISOString();
    if (!row) {
      const { error } = await api.from('site_settings').insert({ setting_key: homeReelsSetting, setting_value, updated_at });
      if (!error) return;
      if (error.code !== 'CONFLICT') throw error;
    } else {
      const { data, error } = await api.from('site_settings').update({ setting_value, updated_at })
        .eq('id', row.id).eq('setting_value', row.setting_value).select('id');
      if (error) throw error;
      if (data.length) return;
    }
  }
  throw new Error('রিলসের তালিকা বদলেছে। আবার চেষ্টা করুন।');
}
