import FooterManager from './FooterManager';
import { defaultQuickLinks, defaultCustomerServiceLinks, parseFooterLinks } from '@/lib/footerLinks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const fields = [
  ['footer_quick_title', 'প্রধান মেনুর শিরোনাম'], ['footer_service_title', 'সেবা মেনুর শিরোনাম'],
  ['footer_contact_title', 'যোগাযোগের শিরোনাম'], ['footer_phone', 'কলের নম্বর'],
  ['footer_whatsapp_number', 'WhatsApp নম্বর'], ['footer_address', 'ঠিকানা'],
  ['footer_call_label', 'কল বোতামের লেখা'], ['footer_whatsapp_label', 'WhatsApp বোতামের লেখা'],
  ['copyright_text', 'কপিরাইটের লেখা'], ['developer_text', 'নিচের ছোট লেখা'],
  ['social_facebook', 'Facebook লিঙ্ক'], ['social_instagram', 'Instagram লিঙ্ক'], ['social_youtube', 'YouTube লিঙ্ক'],
] as const;
export type FooterSettingKey = typeof fields[number][0] | 'footer_description' | 'footer_quick_links' | 'footer_customer_service_links' | 'footer_show_brand' | 'footer_show_contact';

export default function FooterSettings({ getValue, onChange }: { getValue: (key: FooterSettingKey) => string; onChange: (key: FooterSettingKey, value: string) => void }) {
  const { bulkUpdateSettings } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const keys: FooterSettingKey[] = [...fields.map(([key]) => key), 'footer_description', 'footer_quick_links', 'footer_customer_service_links', 'footer_show_brand', 'footer_show_contact'];
      await bulkUpdateSettings(Object.fromEntries(keys.map(key => [key, getValue(key)])));
      toast.success('ফুটার সেভ হয়েছে!');
    } catch { toast.error('ফুটার সেভ হয়নি, আবার চেষ্টা করুন।'); }
    finally { setSaving(false); }
  };
  return <div className="space-y-6">
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">ফুটারের তথ্য</h2>
      <div className="flex flex-wrap gap-6">{([['footer_show_brand', 'লোগো ও বিবরণ'], ['footer_show_contact', 'যোগাযোগ']] as const).map(([key, title]) => <div key={key} className="flex items-center gap-2"><Switch id={key} checked={getValue(key) !== '0'} onCheckedChange={v => onChange(key, v ? '1' : '0')} /><Label htmlFor={key}>{title}</Label></div>)}</div>
      <div className="grid sm:grid-cols-2 gap-4">{fields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`footer-setting-${key}`}>{label}</Label><Input id={`footer-setting-${key}`} value={getValue(key)} onChange={e => onChange(key, e.target.value)} /></div>)}</div>
      <div className="space-y-2"><Label htmlFor="footer-setting-description">ফুটারের বিবরণ</Label><Textarea id="footer-setting-description" rows={2} value={getValue('footer_description')} onChange={e => onChange('footer_description', e.target.value)} /></div>
    </section>
    <section className="border-t border-border pt-5 space-y-4">
      <h2 className="text-lg font-semibold">মেনু ও পেজের কন্টেন্ট</h2>
      <FooterManager quickLinks={parseFooterLinks(getValue('footer_quick_links'), defaultQuickLinks)} customerServiceLinks={parseFooterLinks(getValue('footer_customer_service_links'), defaultCustomerServiceLinks)} onQuickLinksChange={links => onChange('footer_quick_links', JSON.stringify(links))} onCustomerServiceChange={links => onChange('footer_customer_service_links', JSON.stringify(links))} />
    </section>
    <Button onClick={save} disabled={saving}><Save />{saving ? 'সেভ হচ্ছে…' : 'ফুটার সেভ করুন'}</Button>
  </div>;
}