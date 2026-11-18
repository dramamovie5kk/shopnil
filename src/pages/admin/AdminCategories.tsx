import { useState, useRef, useMemo, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { useCategories } from "@/hooks/useProducts";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  icon?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order?: number | null;
};

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories() as { data: Category[]; isLoading: boolean };
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    icon: "",
    image_url: "",
    parent_id: "" as string,
  });

  const sortByOrder = (list: Category[]) =>
    [...list].sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        a.name_bn.localeCompare(b.name_bn)
    );

  const mainCategories = useMemo(
    () => sortByOrder(categories.filter((c) => !c.parent_id)),
    [categories]
  );
  const subCategories = useMemo(
    () => (selectedMain ? sortByOrder(categories.filter((c) => c.parent_id === selectedMain)) : []),
    [categories, selectedMain]
  );
  const subSubCategories = useMemo(
    () => (selectedSub ? sortByOrder(categories.filter((c) => c.parent_id === selectedSub)) : []),
    [categories, selectedSub]
  );

  // Auto-select first main when loaded
  useEffect(() => {
    if (!selectedMain && mainCategories.length > 0) {
      setSelectedMain(mainCategories[0].id);
    }
  }, [mainCategories, selectedMain]);

  // Reset sub when main changes / sub no longer exists
  useEffect(() => {
    if (selectedSub && !subCategories.find((s) => s.id === selectedSub)) {
      setSelectedSub(null);
    }
  }, [subCategories, selectedSub]);

  const totalSubs = categories.filter((c) => c.parent_id).length;

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleOpenDialog = (category: Category | null, parentId: string = "") => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        name_bn: category.name_bn,
        icon: category.icon || "",
        image_url: category.image_url || "",
        parent_id: category.parent_id || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", name_bn: "", icon: "", image_url: "", parent_id: parentId });
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `categories/category-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await api.storage
        .from("products")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = api.storage.from("products").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("ছবি আপলোড হয়েছে");
    } catch {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // determine sort_order for new items
    let sort_order = editingCategory?.sort_order ?? 0;
    if (!editingCategory) {
      const siblings = categories.filter((c) => (c.parent_id || "") === (formData.parent_id || ""));
      sort_order = siblings.length;
    }

    const payload: any = {
      name: formData.name,
      name_bn: formData.name_bn,
      icon: formData.icon || null,
      image_url: formData.image_url || null,
      slug: editingCategory?.slug || generateSlug(formData.name),
      parent_id: formData.parent_id || null,
      sort_order,
    };

    try {
      if (editingCategory) {
        const { error } = await api
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast.success("ক্যাটাগরি আপডেট হয়েছে");
      } else {
        const { error } = await api.from("categories").insert(payload);
        if (error) throw error;
        toast.success("ক্যাটাগরি যোগ হয়েছে");
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const { count: productCount } = await api
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if (productCount && productCount > 0) {
      toast.error(`এই ক্যাটাগরিতে ${productCount}টি প্রোডাক্ট আছে।`);
      return;
    }
    const { count: subCount } = await api
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", categoryId);
    if (subCount && subCount > 0) {
      toast.error(`এই ক্যাটাগরিতে ${subCount}টি সাবক্যাটাগরি আছে।`);
      return;
    }
    const { error } = await api.from("categories").delete().eq("id", categoryId);
    if (error) {
      toast.error("ডিলিট ব্যর্থ: " + error.message);
    } else {
      toast.success("ডিলিট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  };

  const moveCategory = async (list: Category[], index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const a = list[index];
    const b = list[target];
    try {
      await api.from("categories").update({ sort_order: target }).eq("id", a.id);
      await api.from("categories").update({ sort_order: index }).eq("id", b.id);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) {
      toast.error("সাজানো যায়নি");
    }
  };

  const CategoryRow = ({
    category,
    index,
    list,
    isSelected,
    onSelect,
    showChevron,
  }: {
    category: Category;
    index: number;
    list: Category[];
    isSelected: boolean;
    onSelect: () => void;
    showChevron: boolean;
  }) => {
    const [hover, setHover] = useState(false);
    return (
      <div
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer border transition-colors",
          isSelected
            ? "bg-primary/10 border-primary/40"
            : "bg-card border-transparent hover:bg-secondary/50"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        <span className="text-[11px] text-muted-foreground w-7 shrink-0">#{index + 1}</span>

        <div className="w-8 h-8 rounded-md bg-secondary/50 overflow-hidden flex items-center justify-center shrink-0">
          {category.image_url ? (
            <img src={category.image_url} alt={category.name_bn} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base">{category.icon || "📦"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate leading-tight">{category.name_bn}</div>
          <div className="text-[11px] text-muted-foreground truncate">{category.name}</div>
        </div>

        {hover ? (
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => moveCategory(list, index, -1)}
              disabled={index === 0}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => moveCategory(list, index, 1)}
              disabled={index === list.length - 1}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => handleOpenDialog(category)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{category.name_bn}" ক্যাটাগরিটি মুছে ফেলা হবে।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(category.id)}>মুছুন</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          showChevron && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
    );
  };

  const Column = ({
    title,
    count,
    items,
    selectedId,
    onSelect,
    onAdd,
    addDisabled,
    emptyText,
    showChevron,
  }: {
    title: string;
    count: number;
    items: Category[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    addDisabled?: boolean;
    emptyText: string;
    showChevron: boolean;
  }) => (
    <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-primary" />
          {title}
          <Badge variant="secondary" className="text-[10px]">
            {count}
          </Badge>
        </CardTitle>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onAdd}
          disabled={addDisabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          items.map((cat, i) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              index={i}
              list={items}
              isSelected={selectedId === cat.id}
              onSelect={() => onSelect(cat.id)}
              showChevron={showChevron}
            />
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminGuard>
      <AdminLayout title="ক্যাটাগরি ম্যানেজমেন্ট">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-muted-foreground text-sm">
              মোট {mainCategories.length}টি ক্যাটাগরি, {totalSubs}টি সাবক্যাটাগরি
            </p>
            <Button onClick={() => handleOpenDialog(null)} className="bg-gradient-brand">
              <Plus className="h-4 w-4 mr-2" />
              নতুন ক্যাটাগরি
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Column
                title="মেইন ক্যাটাগরি"
                count={mainCategories.length}
                items={mainCategories}
                selectedId={selectedMain}
                onSelect={(id) => {
                  setSelectedMain(id);
                  setSelectedSub(null);
                }}
                onAdd={() => handleOpenDialog(null, "")}
                emptyText="কোনো ক্যাটাগরি নেই"
                showChevron
              />
              <Column
                title="সাব ক্যাটাগরি"
                count={subCategories.length}
                items={subCategories}
                selectedId={selectedSub}
                onSelect={(id) => setSelectedSub(id)}
                onAdd={() => selectedMain && handleOpenDialog(null, selectedMain)}
                addDisabled={!selectedMain}
                emptyText={selectedMain ? "কোনো সাব ক্যাটাগরি নেই" : "একটি মেইন সিলেক্ট করুন"}
                showChevron
              />
              <Column
                title="সাব-সাব ক্যাটাগরি"
                count={subSubCategories.length}
                items={subSubCategories}
                selectedId={null}
                onSelect={() => {}}
                onAdd={() => selectedSub && handleOpenDialog(null, selectedSub)}
                addDisabled={!selectedSub}
                emptyText={selectedSub ? "কোনো সাব-সাব ক্যাটাগরি নেই" : "একটি সাব সিলেক্ট করুন"}
                showChevron={false}
              />
            </div>
          )}
        </div>

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(() => {
                const parent = categories.find((c) => c.id === formData.parent_id);
                const level: "main" | "sub" | "subsub" = !formData.parent_id
                  ? "main"
                  : parent?.parent_id
                  ? "subsub"
                  : "sub";
                const setLevel = (lvl: "main" | "sub" | "subsub") => {
                  if (lvl === "main") setFormData({ ...formData, parent_id: "" });
                  else if (lvl === "sub") {
                    const first = mainCategories[0];
                    setFormData({ ...formData, parent_id: first?.id || "" });
                  } else {
                    // pick first available sub
                    const firstSub = categories.find((c) => c.parent_id && !c.parent_id.startsWith("none"));
                    setFormData({ ...formData, parent_id: firstSub?.id || "" });
                  }
                };
                const subsForLevel = level === "subsub"
                  ? categories.filter((c) => c.parent_id) // any sub
                  : [];
                return (
                  <>
                    <div className="space-y-2">
                      <Label>ক্যাটাগরি লেভেল</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { v: "main", label: "মেইন" },
                          { v: "sub", label: "সাব" },
                          { v: "subsub", label: "সাব-সাব" },
                        ].map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => setLevel(opt.v as any)}
                            className={cn(
                              "h-9 rounded-md border text-sm font-medium transition-colors",
                              level === opt.v
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input hover:bg-secondary"
                            )}
                          >
                            {opt.label} ক্যাটাগরি
                          </button>
                        ))}
                      </div>
                    </div>

                    {level === "sub" && (
                      <div className="space-y-2">
                        <Label>মেইন ক্যাটাগরি বাছাই করুন</Label>
                        <select
                          value={formData.parent_id}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          required
                        >
                          <option value="">— মেইন বাছাই করুন —</option>
                          {mainCategories
                            .filter((c) => c.id !== editingCategory?.id)
                            .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name_bn} ({cat.name})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {level === "subsub" && (
                      <div className="space-y-2">
                        <Label>সাব ক্যাটাগরি বাছাই করুন</Label>
                        <select
                          value={formData.parent_id}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          required
                        >
                          <option value="">— সাব বাছাই করুন —</option>
                          {subsForLevel
                            .filter((c) => c.id !== editingCategory?.id)
                            .map((cat) => {
                              const main = categories.find((m) => m.id === cat.parent_id);
                              return (
                                <option key={cat.id} value={cat.id}>
                                  {main ? `${main.name_bn} → ` : ""}{cat.name_bn}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="space-y-2">
                <Label>ক্যাটাগরি ছবি</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl border-2 border-dashed bg-secondary/30 flex items-center justify-center overflow-hidden">
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url} alt="cat" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5"
                          onClick={() => setFormData((p) => ({ ...p, image_url: "" }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      ছবি আপলোড
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>নাম (English)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Smart Watch"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>নাম (বাংলা)</Label>
                  <Input
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder="স্মার্ট ওয়াচ"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>আইকন (Emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="⌚ 👜 📦"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-gradient-brand" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? "আপডেট" : "যোগ করুন"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminCategories;
