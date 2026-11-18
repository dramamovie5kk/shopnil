import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { usePages, useCreatePage, useUpdatePage, useDeletePage, PageData } from "@/hooks/usePages";

const AdminPages = () => {
  const { data: pages = [], isLoading } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    is_published: true,
  });

  const resetForm = () => {
    setFormData({ title: "", slug: "", content: "", meta_description: "", is_published: true });
    setEditingPage(null);
  };

  const openCreateDialog = () => { resetForm(); setDialogOpen(true); };

  const openEditDialog = (page: PageData) => {
    setEditingPage(page);
    setFormData({ title: page.title, slug: page.slug, content: page.content, meta_description: page.meta_description || "", is_published: page.is_published });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title, slug: editingPage ? prev.slug : generateSlug(title) }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) return;
    if (editingPage) { await updatePage.mutateAsync({ id: editingPage.id, ...formData }); }
    else { await createPage.mutateAsync(formData); }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Page Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Create and manage pages like About Us, Terms & Conditions, Refund Policy etc.
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : pages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pages yet. Create a new page.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{page.title}</h3>
                          <Badge variant={page.is_published ? "default" : "secondary"}>
                            {page.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Link →</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updatePage.mutate({ id: page.id, is_published: !page.is_published })}>
                        {page.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(page)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete page?</AlertDialogTitle>
                            <AlertDialogDescription>"{page.title}" will be permanently deleted.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePage.mutate(page.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. About Us" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="about-us" />
                    <p className="text-xs text-muted-foreground">URL: /{formData.slug}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description (SEO)</Label>
                  <Input value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Shown in search engines..." maxLength={160} />
                </div>
                <div className="space-y-2">
                  <Label>Page Content (HTML supported)</Label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write page content... HTML tags are supported" rows={15} className="font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">HTML tags supported: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt; etc.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                  <Label>Published</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={createPage.isPending || updatePage.isPending}>
                  {createPage.isPending || updatePage.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminPages;
