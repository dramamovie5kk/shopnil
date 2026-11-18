import { useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Upload, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import ProductVariationEditor from "@/components/admin/ProductVariationEditor";
import GalleryImageUploader from "@/components/admin/GalleryImageUploader";
import { useAdminProducts } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useProducts";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const AdminProducts = () => {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const { getSetting } = useSiteSettings();
  const defaultInsideDhaka = getSetting("default_shipping_inside_dhaka", "60");
  const defaultOutsideDhaka = getSetting("default_shipping_outside_dhaka", "120");
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    description: "",
    description_bn: "",
    short_description_bn: "",
    price: "",
    original_price: "",
    category_id: "",
    stock: "",
    is_featured: false,
    is_new: false,
    image_url: "",
    video_url: "",
    images: [] as string[],
    review_images: [] as string[],
    // Shipping fields
    shipping_inside_dhaka: "",
    shipping_outside_dhaka: "",
    free_shipping: false,
  });

  const filteredProducts = products
    .filter(
      (p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_bn.includes(searchQuery)
    )
    .sort(
      (a: any, b: any) => {
        const diff =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (diff !== 0) return diff;
        // Stable tiebreaker so edited products don't jump around when
        // multiple rows share the same created_at timestamp.
        return b.id.localeCompare(a.id);
      }
    );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p: any) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await api
        .from("products")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length}টি প্রোডাক্ট ডিলিট হয়েছে`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setIsDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        name_bn: product.name_bn,
        description: product.description || "",
        description_bn: product.description_bn || "",
        short_description_bn: product.short_description_bn || "",
        price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : "",
        category_id: product.category_id || "",
        stock: String(product.stock),
        is_featured: product.is_featured,
        is_new: product.is_new,
        image_url: product.image_url || "",
        video_url: product.video_url || "",
        images: product.images || [],
        review_images: (product as any).review_images || [],
        shipping_inside_dhaka: product.shipping_inside_dhaka ? String(product.shipping_inside_dhaka) : "",
        shipping_outside_dhaka: product.shipping_outside_dhaka ? String(product.shipping_outside_dhaka) : "",
        free_shipping: product.free_shipping || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        name_bn: "",
        description: "",
        description_bn: "",
        short_description_bn: "",
        price: "",
        original_price: "",
        category_id: "",
        stock: "",
        is_featured: false,
        is_new: false,
        image_url: "",
        video_url: "",
        images: [],
        review_images: [],
        shipping_inside_dhaka: "",
        shipping_outside_dhaka: "",
        free_shipping: false,
      });
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await api.storage
      .from("products")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("ইমেজ আপলোড ব্যর্থ হয়েছে");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = api.storage
      .from("products")
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
    toast.success("ইমেজ আপলোড হয়েছে");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name: formData.name,
      name_bn: formData.name_bn,
      description: formData.description || null,
      description_bn: formData.description_bn || null,
      short_description_bn: formData.short_description_bn || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category_id: formData.category_id || null,
      stock: parseInt(formData.stock) || 0,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      images: formData.images.length > 0 ? formData.images : null,
      review_images: formData.review_images,
      slug: editingProduct?.slug || generateSlug(formData.name),
      shipping_inside_dhaka: formData.shipping_inside_dhaka ? parseFloat(formData.shipping_inside_dhaka) : null,
      shipping_outside_dhaka: formData.shipping_outside_dhaka ? parseFloat(formData.shipping_outside_dhaka) : null,
      free_shipping: formData.free_shipping,
    };

    try {
      if (editingProduct) {
        const { error } = await api
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast.success("প্রোডাক্ট আপডেট হয়েছে");
      } else {
        const { error } = await api.from("products").insert(productData);

        if (error) throw error;
        toast.success("প্রোডাক্ট যোগ হয়েছে");
      }

      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const { error } = await api.from("products").delete().eq("id", productId);

    if (error) {
      toast.error("ডিলিট ব্যর্থ হয়েছে");
    } else {
      toast.success("প্রোডাক্ট ডিলিট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="প্রোডাক্ট ম্যানেজমেন্ট">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  ডিলিট ({selectedIds.length})
                </Button>
              )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="bg-gradient-brand">
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন প্রোডাক্ট
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যোগ করুন"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>নাম (English)</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>নাম (বাংলা)</Label>
                      <Input
                        value={formData.name_bn}
                        onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ছবি</Label>
                    <div className="flex gap-4 items-center">
                      {formData.image_url && (
                        <div className="relative">
                          <img
                            src={formData.image_url}
                            alt="Product"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-secondary"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          ছবি আপলোড করুন
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <GalleryImageUploader
                    images={formData.images}
                    onChange={(images) => setFormData({ ...formData, images })}
                    maxImages={10}
                  />

                  {/* Customer Review/Feedback Images */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">কাস্টমার ফিডব্যাক ইমেজ (রিভিউ গ্যালারি)</Label>
                    <p className="text-xs text-muted-foreground">এই ছবিগুলো প্রোডাক্ট পেজে রিলেটেড প্রোডাক্টের আগে দেখানো হবে</p>
                    <GalleryImageUploader
                      images={formData.review_images}
                      onChange={(review_images) => setFormData({ ...formData, review_images })}
                      maxImages={20}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>দাম (৳)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>পূর্বের দাম (৳)</Label>
                      <Input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>স্টক</Label>
                      <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ক্যাটাগরি</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ক্যাটাগরি বাছুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name_bn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>সংক্ষিপ্ত বিবরণ (Short Description)</Label>
                    <Textarea
                      placeholder="প্রোডাক্ট টাইটেলের পর দেখাবে (২-৩ লাইন)"
                      value={formData.short_description_bn}
                      onChange={(e) => setFormData({ ...formData, short_description_bn: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>বিস্তারিত বিবরণ (Full Description)</Label>
                    <Textarea
                      placeholder="Description সেকশনে দেখাবে"
                      value={formData.description_bn}
                      onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ইউটিউব ভিডিও লিঙ্ক</Label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      YouTube ভিডিও URL দিন (যেমন: https://www.youtube.com/watch?v=xxxxx)
                    </p>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_featured: checked })
                        }
                      />
                      <Label>ফিচার্ড</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_new}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_new: checked })
                        }
                      />
                      <Label>নতুন</Label>
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <Separator className="my-4" />
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">শিপিং সেটিংস</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Switch
                      checked={formData.free_shipping}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, free_shipping: checked })
                      }
                    />
                    <Label>ফ্রি শিপিং</Label>
                    {formData.free_shipping && (
                      <Badge variant="secondary" className="ml-2">ফ্রি ডেলিভারি</Badge>
                    )}
                  </div>

                  {!formData.free_shipping && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ঢাকার ভিতরে শিপিং (৳)</Label>
                        <Input
                          type="number"
                          placeholder={`ডিফল্ট ${defaultInsideDhaka}৳ ব্যবহার করতে ফাঁকা রাখুন`}
                          value={formData.shipping_inside_dhaka}
                          onChange={(e) => setFormData({ ...formData, shipping_inside_dhaka: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          ফাঁকা রাখলে ডিফল্ট {defaultInsideDhaka}৳ ব্যবহার হবে
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>ঢাকার বাহিরে শিপিং (৳)</Label>
                        <Input
                          type="number"
                          placeholder={`ডিফল্ট ${defaultOutsideDhaka}৳ ব্যবহার করতে ফাঁকা রাখুন`}
                          value={formData.shipping_outside_dhaka}
                          onChange={(e) => setFormData({ ...formData, shipping_outside_dhaka: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          ফাঁকা রাখলে ডিফল্ট {defaultOutsideDhaka}৳ ব্যবহার হবে
                        </p>
                      </div>
                    </div>
                  )}

                   {/* Variation Editor - Only for existing products */}
                   {editingProduct && (
                     <>
                       <Separator className="my-4" />
                       <ProductVariationEditor
                         productId={editingProduct.id}
                         basePrice={parseFloat(formData.price) || 0}
                       />
                     </>
                   )}
 
                  <DialogFooter>
                    <Button type="submit" className="bg-gradient-brand" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingProduct ? "আপডেট করুন" : "যোগ করুন"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Checkbox
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  সব সিলেক্ট করুন ({filteredProducts.length}টি)
                </span>
              </div>
              
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className={selectedIds.includes(product.id) ? "ring-2 ring-primary" : ""}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectOne(product.id, !!checked)}
                      />
                      <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name_bn}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.categories?.name_bn || "No Category"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-bold text-primary text-sm">৳{product.price}</span>
                          <span className="text-xs text-muted-foreground">
                            Stock: {product.stock}
                          </span>
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">ফিচার্ড</Badge>
                          )}
                          {product.is_new && (
                            <Badge className="bg-primary text-[10px] px-1.5 py-0">নতুন</Badge>
                          )}
                          {product.has_variations && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">ভেরিয়েশন</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        এডিট
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                            <AlertDialogDescription>
                              এই প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলা হবে।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>
                              মুছুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bulk Delete Confirmation Dialog */}
          <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>বাল্ক ডিলিট করতে চান?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedIds.length}টি প্রোডাক্ট ডিলিট করলে আর ফেরত আনা যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  ডিলিট করুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminProducts;
