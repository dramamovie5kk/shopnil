import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clapperboard, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductOptions } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { api } from '@/integrations/cloudflare/client';
import { homeReelsSetting, isReelSource, parseHomeReels, reelCover, reelPlayback, reelSources, type HomeReel } from '@/lib/homeReels';
import { imageVariant } from '@/lib/responsiveImage';
import { saveHomeReel } from '@/lib/saveHomeReel';

type Draft = Omit<HomeReel, 'source'> & { source: HomeReel['source'] | '' };
const fieldClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm';

function ReelEditor({ original, onSave, onClose, saving }: {
  original: HomeReel | null;
  onSave: (reel: HomeReel) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const { data: products = [], isLoading, isError } = useProductOptions();
  const [draft, setDraft] = useState<Draft>(() => original || { id: crypto.randomUUID(), title: '', source: '', url: '', cover: '' });
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const busy = saving || uploading;
  const update = (patch: Partial<Draft>) => {
    setDraft(current => ({ ...current, ...patch }));
    setError('');
  };

  const save = async () => {
    if (busy) return;
    const { source, title, productSlug } = draft;
    let cover = reelCover(draft.cover);
    const coverExtension = coverFile?.name.match(/\.(jpe?g|png|webp|avif)$/i)?.[1].toLowerCase();
    let url = draft.url.trim();
    if (!title.trim() || !source || (!file && !reelPlayback(source, url)) || (!coverFile && draft.cover.trim() && !cover)) {
      setError('শিরোনাম, নির্বাচিত উৎসের ভিডিও এবং দেওয়া থাকলে কভার লিংক যাচাই করুন।');
      return;
    }
    if (!products.some(product => product.slug === productSlug)) {
      setError('তালিকা থেকে একটি পণ্য বেছে নিন।');
      return;
    }
    if (file && (!/\.mp4$/i.test(file.name) || !file.size || file.size > 20 * 1024 * 1024)) {
      setError('সর্বোচ্চ ২০ MB আকারের MP4 ফাইল বেছে নিন।');
      return;
    }
    if (coverFile && (!coverExtension || !coverFile.size || coverFile.size > 10 * 1024 * 1024)) {
      setError('সর্বোচ্চ ১০ MB আকারের JPG, PNG, WebP বা AVIF কভার ছবি বেছে নিন।');
      return;
    }
    setError('');
    try {
      if (file) {
        setUploading(true);
        const path = `reels/${crypto.randomUUID()}.mp4`;
        const { error: uploadError } = await api.storage.from('products').upload(path, file);
        if (uploadError) throw new Error('MP4 আপলোড হয়নি। ফাইলটি যাচাই করে আবার চেষ্টা করুন।');
        url = '/api/media/products/' + path;
        setFile(null);
        if (fileInput.current) fileInput.current.value = '';
        update({ url });
      }
      if (coverFile) {
        setUploading(true);
        const path = `reels/covers/${crypto.randomUUID()}.${coverExtension}`;
        const { error: uploadError } = await api.storage.from('products').upload(path, coverFile);
        if (uploadError) throw new Error('কভার ছবি আপলোড হয়নি। ছবিটি যাচাই করে আবার চেষ্টা করুন।');
        cover = '/api/media/products/' + path;
        setCoverFile(null);
        if (coverInput.current) coverInput.current.value = '';
        update({ cover });
      }
      await onSave({ ...draft, source, title: title.trim(), url, cover, productSlug });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'রিল সেভ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogContent className={`max-h-[92dvh] w-[calc(100%-1rem)] max-w-xl overflow-y-auto rounded-xl ${busy ? "[&>button]:hidden" : ""}`}
      onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
      onInteractOutside={event => { if (busy) event.preventDefault(); }}>
      <DialogHeader>
        <DialogTitle>{original ? 'রিল সম্পাদনা' : 'নতুন রিল যোগ করুন'}</DialogTitle>
        <DialogDescription>ভিডিওর উৎস ও পণ্য বেছে এই রিলটি সেভ করুন।</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); void save(); }}>
        <fieldset disabled={busy} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="reel-source">ভিডিওর উৎস</Label>
            <select id="reel-source" value={draft.source} className={fieldClass}
              onChange={event => { setFile(null); update({ source: isReelSource(event.target.value) ? event.target.value : '', url: '' }); }}>
              <option value="">উৎস বেছে নিন</option>
              {Object.entries(reelSources).map(([source, config]) => <option key={source} value={source}>{config.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reel-url">ভিডিও লিংক</Label>
            <Input id="reel-url" dir="ltr" inputMode="url" maxLength={2000} value={draft.url} disabled={!draft.source || !!file}
              placeholder={draft.source ? reelSources[draft.source].example : 'আগে ভিডিওর উৎস বেছে নিন'} onChange={event => update({ url: event.target.value })} />
            {draft.source === 'drive' && <p className="text-xs text-muted-foreground">লিংক থাকা যে কেউ যেন ড্রাইভের ভিডিওটি দেখতে পারে, সেই অনুমতি দিন।</p>}
          </div>
          {draft.source === 'mp4' && <div className="space-y-1">
            <Label htmlFor="reel-file">অথবা MP4 ফাইল দিন (সর্বোচ্চ ২০ MB)</Label>
            <Input id="reel-file" ref={fileInput} type="file" accept="video/mp4,.mp4" onChange={event => { setFile(event.target.files?.[0] || null); setError(''); }} />
          </div>}
          <div className="space-y-1">
            <Label htmlFor="reel-title">শিরোনাম</Label>
            <Input id="reel-title" value={draft.title} maxLength={120} onChange={event => update({ title: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reel-product">রিলের পণ্য</Label>
            <select id="reel-product" className={fieldClass} value={draft.productSlug || ''} disabled={isLoading || isError}
              onChange={event => update({ productSlug: event.target.value })}>
              <option value="">{isLoading ? 'পণ্য লোড হচ্ছে…' : 'পণ্য বেছে নিন'}</option>
              {products.map(product => <option key={product.id} value={product.slug}>{product.name_bn || product.name}</option>)}
            </select>
            {isError && <p role="alert" className="text-xs text-destructive">পণ্যের তালিকা লোড হয়নি।</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="reel-cover-file">কভার ছবি আপলোড (ঐচ্ছিক)</Label>
            <Input id="reel-cover-file" ref={coverInput} type="file" accept=".jpg,.jpeg,.png,.webp,.avif"
              onChange={event => { setCoverFile(event.target.files?.[0] || null); setError(''); }} />
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP বা AVIF · সর্বোচ্চ ১০ MB</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reel-cover">অথবা কভার ছবির লিংক</Label>
            <Input id="reel-cover" dir="ltr" inputMode="url" maxLength={2000} value={draft.cover} disabled={!!coverFile}
              onChange={event => update({ cover: event.target.value })} />
          </div>
        </fieldset>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>বাতিল</Button>
          <Button type="submit" disabled={busy || isLoading || isError}>{uploading ? 'আপলোড হচ্ছে…' : saving ? 'সেভ হচ্ছে…' : 'রিল সেভ করুন'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AdminReels() {
  const { getSetting, isLoading, isError } = useSiteSettings();
  const queryClient = useQueryClient();
  const reels = parseHomeReels(getSetting(homeReelsSetting));
  const [editor, setEditor] = useState<{ original: HomeReel | null } | null>(null);
  const [removing, setRemoving] = useState<HomeReel | null>(null);
  const [saving, setSaving] = useState(false);
  const persist = async (original: HomeReel | null, next: HomeReel | null) => {
    setSaving(true);
    try {
      await saveHomeReel(original, next);
      await queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(next ? 'রিল সেভ হয়েছে।' : 'রিল সরানো হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="রিলস" subtitle="হোমপেজে দেখানোর রিলগুলো পরিচালনা করুন।" actions={
      <Button disabled={isLoading || isError || reels.length >= 30} onClick={() => setEditor({ original: null })}>
        <Plus className="mr-2 size-4" />রিল যোগ করুন
      </Button>
    }>
      {isLoading ? <p role="status">রিলস লোড হচ্ছে…</p> : isError ? <p role="alert">রিলস লোড করা যায়নি। পেজটি রিফ্রেশ করুন।</p>
        : reels.length ? <div className="grid gap-3 lg:grid-cols-2">
          {reels.map(reel => (
            <Card key={reel.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                  {reel.cover ? <img src={imageVariant(reel.cover, 384)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Clapperboard className="size-5" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">{reel.title}</h2>
                  <p className="truncate text-xs text-muted-foreground">{reelSources[reel.source].label}{reel.productSlug ? '' : ' · পণ্য বেছে নিন'}</p>
                </div>
                <Button variant="outline" size="icon" aria-label={`${reel.title} সম্পাদনা করুন`} onClick={() => setEditor({ original: reel })}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`${reel.title} সরান`} onClick={() => setRemoving(reel)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div> : <Card><CardContent className="p-6 text-sm text-muted-foreground">এখনো কোনো রিল যোগ করা হয়নি।</CardContent></Card>}
      <Dialog open={!!editor} onOpenChange={open => { if (!open && !saving) setEditor(null); }}>
        {editor && <ReelEditor original={editor.original} saving={saving} onClose={() => setEditor(null)}
          onSave={async next => { await persist(editor.original, next); setEditor(null); }} />}
      </Dialog>
      <AlertDialog open={!!removing} onOpenChange={open => { if (!open && !saving) setRemoving(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>রিলটি সরাবেন?</AlertDialogTitle>
            <AlertDialogDescription>{removing?.title} হোমপেজ থেকে সরানো হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>বাতিল</AlertDialogCancel>
            <Button variant="destructive" disabled={saving} onClick={async () => {
              if (!removing) return;
              try { await persist(removing, null); setRemoving(null); }
              catch { toast.error('রিলটি সরানো যায়নি। আবার চেষ্টা করুন।'); }
            }}>{saving ? 'সরানো হচ্ছে…' : 'রিল সরান'}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
