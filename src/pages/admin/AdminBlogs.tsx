import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdminBlogs, useBlogMutations, uploadBlogImage, type BlogPost, type BlogSection, type BlogSectionType, type SectionStyle } from "@/hooks/useBlogs";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Upload, Image, Video, Type, ShoppingBag, MousePointer, GripVertical, Images, Palette, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const SECTION_TYPES: { type: BlogSectionType; label: string; icon: any }[] = [
  { type: "text", label: "টেক্সট", icon: Type },
  { type: "image", label: "ইমেজ", icon: Image },
  { type: "gallery", label: "গ্যালারি", icon: Images },
  { type: "video", label: "ভিডিও", icon: Video },
  { type: "product", label: "প্রোডাক্ট", icon: ShoppingBag },
  { type: "button", label: "বাটন", icon: MousePointer },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px"];
const BORDER_RADIUS = ["0px", "4px", "8px", "12px", "16px", "20px", "24px", "999px"];
const PADDING_OPTIONS = ["4px 8px", "8px 16px", "10px 20px", "12px 24px", "16px 32px", "20px 40px"];
const TEXT_ALIGNS = ["left", "center", "right"];

// Style editor component for each section
const StyleEditor = ({ style, onChange, type }: { style: SectionStyle; onChange: (s: SectionStyle) => void; type: BlogSectionType }) => {
  const update = (key: keyof SectionStyle, value: string) => onChange({ ...style, [key]: value });

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1">
          <Palette className="h-3.5 w-3.5" />
          <span>স্টাইল সেটিংস</span>
          <ChevronDown className="h-3 w-3 ml-auto" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg text-xs">
          {/* Common styles */}
          {(type === "text" || type === "button") && (
            <>
              <div>
                <Label className="text-xs">টেক্সট কালার</Label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={style.color || "#000000"} onChange={(e) => update("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={style.color || ""} onChange={(e) => update("color", e.target.value)} placeholder="#000" className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">ব্যাকগ্রাউন্ড কালার</Label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={style.backgroundColor || "#ffffff"} onChange={(e) => update("backgroundColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={style.backgroundColor || ""} onChange={(e) => update("backgroundColor", e.target.value)} placeholder="transparent" className="h-8 text-xs" />
                </div>
              </div>
            </>
          )}

          {type === "text" && (
            <>
              <div>
                <Label className="text-xs">ফন্ট সাইজ</Label>
                <Select value={style.fontSize || ""} onValueChange={(v) => update("fontSize", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">টেক্সট অ্যালাইন</Label>
                <Select value={style.textAlign || ""} onValueChange={(v) => update("textAlign", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {TEXT_ALIGNS.map((a) => <SelectItem key={a} value={a}>{a === "left" ? "বামে" : a === "center" ? "মাঝে" : "ডানে"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">প্যাডিং</Label>
                <Select value={style.padding || ""} onValueChange={(v) => update("padding", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {PADDING_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">বর্ডার রেডিয়াস</Label>
                <Select value={style.borderRadius || ""} onValueChange={(v) => update("borderRadius", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {BORDER_RADIUS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "button" && (
            <>
              <div>
                <Label className="text-xs">বাটন কালার</Label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={style.buttonBgColor || "#7c3aed"} onChange={(e) => update("buttonBgColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={style.buttonBgColor || ""} onChange={(e) => update("buttonBgColor", e.target.value)} placeholder="#7c3aed" className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">বাটন টেক্সট কালার</Label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={style.buttonColor || "#ffffff"} onChange={(e) => update("buttonColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={style.buttonColor || ""} onChange={(e) => update("buttonColor", e.target.value)} placeholder="#fff" className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">বর্ডার কালার</Label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={style.buttonBorderColor || "#7c3aed"} onChange={(e) => update("buttonBorderColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={style.buttonBorderColor || ""} onChange={(e) => update("buttonBorderColor", e.target.value)} placeholder="transparent" className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">বর্ডার উইডথ</Label>
                <Select value={style.buttonBorderWidth || ""} onValueChange={(v) => update("buttonBorderWidth", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {["0px", "1px", "2px", "3px", "4px"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">বাটন রেডিয়াস</Label>
                <Select value={style.buttonBorderRadius || ""} onValueChange={(v) => update("buttonBorderRadius", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {BORDER_RADIUS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">বাটন ফন্ট সাইজ</Label>
                <Select value={style.buttonFontSize || ""} onValueChange={(v) => update("buttonFontSize", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">বাটন প্যাডিং</Label>
                <Select value={style.buttonPadding || ""} onValueChange={(v) => update("buttonPadding", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {PADDING_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(type === "image" || type === "gallery") && (
            <>
              <div>
                <Label className="text-xs">ইমেজ রেডিয়াস</Label>
                <Select value={style.imageRadius || ""} onValueChange={(v) => update("imageRadius", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                  <SelectContent>
                    {BORDER_RADIUS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {type === "image" && (
                <div>
                  <Label className="text-xs">সর্বোচ্চ উচ্চতা</Label>
                  <Select value={style.maxHeight || ""} onValueChange={(v) => update("maxHeight", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ডিফল্ট" /></SelectTrigger>
                    <SelectContent>
                      {["200px", "300px", "400px", "500px", "600px", "none"].map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const AdminBlogs = () => {
  const { data: blogs, isLoading } = useAdminBlogs();
  const { data: products } = useProducts();
  const { createBlog, updateBlog, deleteBlog } = useBlogMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const featuredImageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    title_bn: "",
    slug: "",
    featured_image: "",
    is_published: false,
    sections: [] as BlogSection[],
  });

  const resetForm = () => {
    setForm({ title: "", title_bn: "", slug: "", featured_image: "", is_published: false, sections: [] });
    setEditingBlog(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      title_bn: blog.title_bn || "",
      slug: blog.slug,
      featured_image: blog.featured_image || "",
      is_published: blog.is_published,
      sections: blog.sections || [],
    });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "") || `blog-${Date.now()}`;

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      return await uploadBlogImage(file);
    } finally {
      setUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleImageUpload(file);
      setForm((f) => ({ ...f, featured_image: url }));
      toast.success("ইমেজ আপলোড হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "আপলোড ব্যর্থ");
    }
  };

  const addSection = (type: BlogSectionType) => {
    const newSection: BlogSection = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      style: {},
    };
    setForm((f) => ({ ...f, sections: [...f.sections, newSection] }));
  };

  const updateSection = (id: string, updates: Partial<BlogSection>) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const updateSectionStyle = (id: string, style: SectionStyle) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) => (s.id === id ? { ...s, style } : s)),
    }));
  };

  const removeSection = (id: string) => {
    setForm((f) => ({ ...f, sections: f.sections.filter((s) => s.id !== id) }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...form.sections];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newSections.length) return;
    [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
    setForm((f) => ({ ...f, sections: newSections }));
  };

  const handleSectionImageUpload = async (sectionId: string, file: File) => {
    try {
      const url = await handleImageUpload(file);
      updateSection(sectionId, { image_url: url });
      toast.success("ইমেজ আপলোড হয়েছে");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGalleryImageUpload = async (sectionId: string, files: FileList) => {
    const section = form.sections.find((s) => s.id === sectionId);
    const existing = section?.images || [];
    try {
      setUploading(true);
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadBlogImage(file);
        urls.push(url);
      }
      updateSection(sectionId, { images: [...existing, ...urls] });
      toast.success(`${urls.length}টি ইমেজ আপলোড হয়েছে`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title && !form.title_bn) {
      toast.error("টাইটেল দিন");
      return;
    }
    const slug = form.slug || generateSlug(form.title || form.title_bn);
    const payload: any = {
      title: form.title || form.title_bn,
      title_bn: form.title_bn,
      slug,
      featured_image: form.featured_image || null,
      is_published: form.is_published,
      sections: form.sections,
    };

    try {
      if (editingBlog) {
        await updateBlog.mutateAsync({ id: editingBlog.id, ...payload });
        toast.success("ব্লগ আপডেট হয়েছে");
      } else {
        await createBlog.mutateAsync(payload);
        toast.success("ব্লগ তৈরি হয়েছে");
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "ত্রুটি হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      await deleteBlog.mutateAsync(id);
      toast.success("ব্লগ ডিলিট হয়েছে");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderSectionEditor = (section: BlogSection, index: number) => {
    const sectionStyle = section.style || {};
    return (
      <Card key={section.id} className="relative">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {SECTION_TYPES.find((t) => t.type === section.type)?.label || section.type}
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(index, "up")} disabled={index === 0}>↑</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSection(index, "down")} disabled={index === form.sections.length - 1}>↓</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSection(section.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {section.type === "text" && (
            <>
              <Input placeholder="শিরোনাম (ঐচ্ছিক)" value={section.heading || ""} onChange={(e) => updateSection(section.id, { heading: e.target.value })} />
              <Textarea placeholder="টেক্সট লিখুন (HTML সাপোর্টেড)..." rows={4} value={section.content || ""} onChange={(e) => updateSection(section.id, { content: e.target.value })} />
            </>
          )}

          {section.type === "image" && (
            <div className="space-y-2">
              {section.image_url && (
                <img
                  src={section.image_url}
                  alt=""
                  className="w-full max-h-48 object-cover"
                  style={{ borderRadius: sectionStyle.imageRadius || "8px", maxHeight: sectionStyle.maxHeight || "192px" }}
                />
              )}
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleSectionImageUpload(section.id, e.target.files[0])} disabled={uploading} />
              <p className="text-[11px] text-muted-foreground">রিকমেন্ডেড: 1200×600px (2:1 ratio)</p>
              <Input placeholder="অথবা ইমেজ URL দিন" value={section.image_url || ""} onChange={(e) => updateSection(section.id, { image_url: e.target.value })} />
            </div>
          )}

          {section.type === "gallery" && (
            <div className="space-y-2">
              {section.images && section.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {section.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover" style={{ borderRadius: sectionStyle.imageRadius || "8px" }} />
                      <button
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => updateSection(section.id, { images: section.images?.filter((_, idx) => idx !== i) })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleGalleryImageUpload(section.id, e.target.files)} disabled={uploading} />
              <p className="text-[11px] text-muted-foreground">রিকমেন্ডেড: 600×600px (1:1 ratio) • একাধিক ছবি সিলেক্ট করতে পারবেন</p>
            </div>
          )}

          {section.type === "video" && (
            <Input placeholder="YouTube URL" value={section.video_url || ""} onChange={(e) => updateSection(section.id, { video_url: e.target.value })} />
          )}

          {section.type === "product" && (
            <Select value={section.product_id || ""} onValueChange={(v) => updateSection(section.id, { product_id: v === "none" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="প্রোডাক্ট সিলেক্ট করুন" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">কোনো প্রোডাক্ট নেই</SelectItem>
                {products?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name_bn || p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {section.type === "button" && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="বাটন টেক্সট" value={section.button_text || ""} onChange={(e) => updateSection(section.id, { button_text: e.target.value })} />
              <Input placeholder="বাটন লিংক" value={section.button_link || ""} onChange={(e) => updateSection(section.id, { button_link: e.target.value })} />
            </div>
          )}

          {/* Style Editor - for text, button, image, gallery */}
          {["text", "button", "image", "gallery"].includes(section.type) && (
            <StyleEditor
              style={sectionStyle}
              onChange={(s) => updateSectionStyle(section.id, s)}
              type={section.type}
            />
          )}

          {/* Live Preview */}
          {section.type === "button" && section.button_text && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
              <button
                style={{
                  backgroundColor: sectionStyle.buttonBgColor || "hsl(var(--primary))",
                  color: sectionStyle.buttonColor || "#ffffff",
                  border: `${sectionStyle.buttonBorderWidth || "0px"} solid ${sectionStyle.buttonBorderColor || "transparent"}`,
                  borderRadius: sectionStyle.buttonBorderRadius || "8px",
                  fontSize: sectionStyle.buttonFontSize || "16px",
                  padding: sectionStyle.buttonPadding || "10px 20px",
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                  cursor: "pointer",
                }}
              >
                {section.button_text}
              </button>
            </div>
          )}

          {section.type === "text" && section.content && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
              <div
                style={{
                  color: sectionStyle.color || undefined,
                  backgroundColor: sectionStyle.backgroundColor || undefined,
                  fontSize: sectionStyle.fontSize || undefined,
                  textAlign: (sectionStyle.textAlign as any) || undefined,
                  padding: sectionStyle.padding || undefined,
                  borderRadius: sectionStyle.borderRadius || undefined,
                  fontFamily: "'Baloo Da Digits', 'Hind Siliguri', sans-serif",
                }}
                dangerouslySetInnerHTML={{ __html: section.content.slice(0, 200) }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminGuard>
      <AdminLayout title="ব্লগ পোস্ট">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">মোট {blogs?.length || 0}টি পোস্ট</p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            নতুন পোস্ট
          </Button>
        </div>

        {isLoading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <div className="grid gap-4">
            {blogs?.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {blog.featured_image && (
                    <img src={blog.featured_image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{blog.title_bn || blog.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(blog.created_at), "dd/MM/yyyy")} •{" "}
                      {blog.is_published ? (
                        <span className="text-primary">প্রকাশিত</span>
                      ) : (
                        <span className="text-muted-foreground">ড্রাফট</span>
                      )}
                      {" • "}{(blog.sections || []).length}টি সেকশন
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(blog)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(blog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {blogs?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">কোনো ব্লগ পোস্ট নেই</p>
            )}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "ব্লগ এডিট" : "নতুন ব্লগ পোস্ট"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>টাইটেল (English)</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })} />
                </div>
                <div>
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input value={form.title_bn} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>

              {/* Featured Image */}
              <div>
                <Label>ফিচার ইমেজ</Label>
                {form.featured_image && (
                  <div className="relative mb-2">
                    <img src={form.featured_image} alt="" className="w-full max-h-48 object-cover rounded-lg" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setForm({ ...form, featured_image: "" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input ref={featuredImageRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                  <Button variant="outline" onClick={() => featuredImageRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "আপলোড হচ্ছে..." : "ইমেজ আপলোড"}
                  </Button>
                  <Input placeholder="অথবা URL দিন" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className="flex-1" />
                </div>
                <p className="text-[11px] text-muted-foreground">রিকমেন্ডেড: 1200×630px (OG image size)</p>
              </div>

              {/* Dynamic Sections */}
              <div>
                <Label className="mb-2 block">সেকশন সমূহ</Label>
                <div className="space-y-3">
                  {form.sections.map((section, index) => renderSectionEditor(section, index))}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {SECTION_TYPES.map((st) => (
                    <Button key={st.type} variant="outline" size="sm" onClick={() => addSection(st.type)}>
                      <st.icon className="h-4 w-4 mr-1" />
                      {st.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>প্রকাশ করুন</Label>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={createBlog.isPending || updateBlog.isPending || uploading}>
                {editingBlog ? "আপডেট করুন" : "পোস্ট করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminBlogs;
