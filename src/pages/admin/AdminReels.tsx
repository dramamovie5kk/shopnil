import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { homeReelsSetting, isReelSource, parseHomeReels, reelCover, reelPlayback, reelSources, type HomeReel } from '@/lib/homeReels';

type DraftReel = Omit<HomeReel, 'source'> & { source: HomeReel['source'] | '' };

function ReelEditor({ initial, onSave, saving }: {
  initial: HomeReel[];
  onSave: (value: string) => Promise<unknown>;
  saving: boolean;
}) {
  const [drafts, setDrafts] = useState<DraftReel[]>(initial);
  const [error, setError] = useState('');
  const update = (id: string, patch: Partial<DraftReel>) => {
    setDrafts(current => current.map(reel => reel.id === id ? { ...reel, ...patch } : reel));
    setError('');
  };

  const save = async () => {
    const invalid = drafts.findIndex(reel => !reel.title.trim() || !reel.source || !reelPlayback(reel.source, reel.url)
      || (reel.cover.trim() && !reelCover(reel.cover)));
    if (invalid >= 0) {
      setError(`রিল ${(invalid + 1).toLocaleString('bn-BD')}: শিরোনাম, নির্বাচিত উৎসের ভিডিও লিংক এবং দেওয়া থাকলে কভার লিংক যাচাই করুন।`);
      return;
    }
    try {
      await onSave(JSON.stringify(drafts.map(reel => ({
        ...reel, title: reel.title.trim(), url: reel.url.trim(), cover: reelCover(reel.cover),
      }))));
      toast.success('রিলস সেভ হয়েছে।');
    } catch {
      setError('রিলস সেভ করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <form className="max-w-3xl space-y-4" onSubmit={event => { event.preventDefault(); void save(); }}>
      <fieldset disabled={saving} className="space-y-4">
        {!drafts.length && <p className="text-sm text-muted-foreground">এখনো কোনো রিল যোগ করা হয়নি।</p>}
        {drafts.map((reel, index) => (
          <Card key={reel.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex justify-between gap-2">
                <h2 className="font-semibold">রিল {(index + 1).toLocaleString('bn-BD')}</h2>
                <Button type="button" variant="ghost" size="icon" aria-label={`রিল ${index + 1} সরান`}
                  onClick={() => { setDrafts(current => current.filter(item => item.id !== reel.id)); setError(''); }}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${reel.id}-source`}>ভিডিওর উৎস</Label>
                <select id={`${reel.id}-source`} value={reel.source}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  onChange={event => update(reel.id, { source: isReelSource(event.target.value) ? event.target.value : '', url: '' })}>
                  <option value="">উৎস বেছে নিন</option>
                  {Object.entries(reelSources).map(([source, config]) => <option key={source} value={source}>{config.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${reel.id}-url`}>ভিডিও লিংক</Label>
                <Input id={`${reel.id}-url`} dir="ltr" inputMode="url" maxLength={2000}
                  value={reel.url} disabled={!reel.source} placeholder={reel.source ? reelSources[reel.source].example : 'আগে ভিডিওর উৎস বেছে নিন'}
                  onChange={event => update(reel.id, { url: event.target.value })} />
                {reel.source === 'drive' && <p className="text-xs text-muted-foreground">ড্রাইভ ফাইলে লিংক থাকা যে কেউ যেন ভিডিও দেখতে পারে, সেই অনুমতি দিন।</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${reel.id}-title`}>শিরোনাম</Label>
                <Input id={`${reel.id}-title`} value={reel.title} maxLength={120} onChange={event => update(reel.id, { title: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${reel.id}-cover`}>কভার ছবির লিংক (ঐচ্ছিক)</Label>
                <Input id={`${reel.id}-cover`} dir="ltr" inputMode="url" maxLength={2000} value={reel.cover}
                  onChange={event => update(reel.id, { cover: event.target.value })} />
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={drafts.length >= 30}
            onClick={() => setDrafts(current => [...current, { id: crypto.randomUUID(), source: '', url: '', title: '', cover: '' }])}>
            <Plus className="mr-2 size-4" />রিল যোগ করুন
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 size-4" />{saving ? 'সেভ হচ্ছে…' : 'রিলস সেভ করুন'}
          </Button>
        </div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

export default function AdminReels() {
  const { getSetting, isLoading, isError, updateSetting, isUpdating } = useSiteSettings();
  return (
    <AdminLayout title="রিলস" subtitle="হোমপেজের টপ ক্যাটেগরির নিচে দেখানোর জন্য রিল যোগ করুন।">
      {isLoading ? <p role="status">রিলস লোড হচ্ছে…</p> : isError ? <p role="alert">রিলসের সেটিংস লোড করা যায়নি। পেজটি রিফ্রেশ করুন।</p>
        : <ReelEditor initial={parseHomeReels(getSetting(homeReelsSetting))} onSave={value => updateSetting(homeReelsSetting, value)} saving={isUpdating} />}
    </AdminLayout>
  );
}
