import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSalesPages, useDeleteSalesPage } from "@/hooks/useSalesPages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, Copy, Eye, Palette } from "lucide-react";
import { SalesPage } from "@/types/salesPage";
import SimplifiedSalesPageEditor from "@/components/admin/SimplifiedSalesPageEditor";
import { toast } from "sonner";
import { getTemplate } from "@/lib/salesPageTemplates";

const AdminSalesPages = () => {
  const { data: salesPages, isLoading } = useSalesPages();
  const deleteMutation = useDeleteSalesPage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SalesPage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const handleEdit = (page: SalesPage) => { setSelectedPage(page); setEditorOpen(true); };
  const handleCreate = () => { setSelectedPage(null); setEditorOpen(true); };
  const handleDelete = (id: string) => { setPageToDelete(id); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (pageToDelete) deleteMutation.mutate(pageToDelete); setDeleteDialogOpen(false); setPageToDelete(null); };

  const getPublicUrl = (slug: string) => `${window.location.origin}/lp/${slug}`;

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(getPublicUrl(slug));
    toast.success("Public link copied!");
  };

  const previewPage = (slug: string) => window.open(`/lp/${slug}`, "_blank");

  return (
    <AdminLayout title="Sales Pages">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><p className="text-muted-foreground">Manage your sales/landing pages</p><Link to="/admin/settings" className="text-sm text-primary underline">হোমপেজের মোড বদলাতে সাইট সেটিংসে যান</Link></div>
          <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" />New Sales Page</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Sales Pages</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{salesPages?.length || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Pages</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">{salesPages?.filter((p) => p.is_active).length || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Inactive Pages</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-gray-400">{salesPages?.filter((p) => !p.is_active).length || 0}</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : salesPages && salesPages.length > 0 ? (
                  salesPages.map((page) => {
                    const template = getTemplate(page.template_id || 'elegant-dark');
                    return (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/lp/{page.slug}</code></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${template.primary_color}, ${template.accent_color})` }} />
                          <span className="text-sm">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {page.products ? (
                          <span className="text-sm">{page.products.name_bn || page.products.name}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not selected</span>
                        )}
                      </TableCell>
                      <TableCell>৳{page.products?.price || page.offer_price || 0}</TableCell>
                      <TableCell>
                        <Badge variant={page.is_active ? "default" : "secondary"}>
                          {page.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => previewPage(page.slug)} title="Preview"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => copyLink(page.slug)} title="Copy Link"><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" asChild title="Public Link"><a href={`/lp/${page.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(page)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sales pages. Create a new one.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <SimplifiedSalesPageEditor open={editorOpen} onOpenChange={setEditorOpen} salesPage={selectedPage} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sales page?</AlertDialogTitle>
            <AlertDialogDescription>This sales page will be permanently deleted. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminSalesPages;
