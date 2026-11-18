import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePages, useCreatePage, useUpdatePage } from "@/hooks/usePages";
import { footerPageSlug, type FooterLink } from "@/lib/footerLinks";
export type { FooterLink } from "@/lib/footerLinks";

interface Props {
  quickLinks: FooterLink[]; customerServiceLinks: FooterLink[];
  onQuickLinksChange: (links: FooterLink[]) => void;
  onCustomerServiceChange: (links: FooterLink[]) => void;
}
const FooterManager = ({ quickLinks, customerServiceLinks, onQuickLinksChange, onCustomerServiceChange }: Props) => {
  const { data: pages = [] } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const [editor, setEditor] = useState<{ id?: string; title: string; slug: string; content: string; published: boolean } | null>(null);
  const openContent = (link: FooterLink) => {
    const slug = footerPageSlug(link.url);
    if (!slug) return;
    const page = pages.find(p => p.slug === slug);
    setEditor({ id: page?.id, title: page?.title || link.label, slug, content: page?.content || '', published: page?.is_published ?? true });
  };
  const save = async () => {
    if (!editor || !editor.title.trim()) return;
    const data = { title: editor.title, slug: editor.slug, content: editor.content, is_published: editor.published };
    try {
      if (editor.id) await updatePage.mutateAsync({ id: editor.id, ...data });
      else await createPage.mutateAsync(data);
      setEditor(null);
    } catch { /* Mutations show the error and keep the editor open. */ }
  };
  return <>
    <div className="grid lg:grid-cols-2 gap-6">
      {[{ title: 'প্রধান মেনু', links: quickLinks, change: onQuickLinksChange }, { title: 'সেবা ও নীতিমালা', links: customerServiceLinks, change: onCustomerServiceChange }].map(group => (
        <section key={group.title} className="space-y-3 min-w-0">
          <h3 className="font-semibold">{group.title}</h3>
          {group.links.map((link, index) => {
            const update = (field: 'label' | 'url', value: string) => group.change(group.links.map(l => l.id === link.id ? { ...l, [field]: value } : l));
            const move = (offset: number) => { const next = [...group.links]; const target = index + offset; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; group.change(next); };
            return <div key={link.id} className="border border-border rounded-md p-3 space-y-2">
              <Label htmlFor={`footer-label-${group.title}-${link.id}`}>মেনুর নাম</Label>
              <Input id={`footer-label-${group.title}-${link.id}`} value={link.label} onChange={e => update('label', e.target.value)} />
              <Label htmlFor={`footer-url-${group.title}-${link.id}`}>লিঙ্ক</Label>
              <Input id={`footer-url-${group.title}-${link.id}`} value={link.url} placeholder="/about অথবা https://…" onChange={e => update('url', e.target.value)} />
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={!footerPageSlug(link.url) || !link.label.trim()} onClick={() => openContent(link)}><FilePenLine />পেজের কন্টেন্ট</Button>
                <Button variant="ghost" size="icon" aria-label="উপরে সরান" disabled={index === 0} onClick={() => move(-1)}><ArrowUp /></Button>
                <Button variant="ghost" size="icon" aria-label="নিচে সরান" disabled={index === group.links.length - 1} onClick={() => move(1)}><ArrowDown /></Button>
                <Button variant="ghost" size="icon" className="text-destructive ml-auto" aria-label={`মুছুন ${link.label}`} onClick={() => group.change(group.links.filter(l => l.id !== link.id))}><Trash2 /></Button>
              </div>
            </div>;
          })}
          <Button variant="outline" onClick={() => group.change([...group.links, { id: crypto.randomUUID(), label: '', url: '' }])}><Plus />নতুন মেনু লিঙ্ক</Button>
        </section>
      ))}
    </div>
    <Dialog open={!!editor} onOpenChange={open => { if (!open) setEditor(null); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>মেনু পেজের কন্টেন্ট</DialogTitle></DialogHeader>
        {editor && <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="footer-page-title">পেজের শিরোনাম</Label><Input id="footer-page-title" value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} /></div>
          <p className="text-sm text-muted-foreground">/{editor.slug}</p>
          <div className="space-y-2"><Label htmlFor="footer-page-content">পেজের লেখা / HTML</Label><Textarea id="footer-page-content" rows={12} value={editor.content} onChange={e => setEditor({ ...editor, content: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch id="footer-page-published" checked={editor.published} onCheckedChange={v => setEditor({ ...editor, published: v })} /><Label htmlFor="footer-page-published">প্রকাশিত</Label></div>
          <Button disabled={!editor.title.trim() || createPage.isPending || updatePage.isPending} onClick={save}>{createPage.isPending || updatePage.isPending ? 'সেভ হচ্ছে…' : 'পেজ সেভ করুন'}</Button>
        </div>}
      </DialogContent>
    </Dialog>
  </>;
};
export default FooterManager;
