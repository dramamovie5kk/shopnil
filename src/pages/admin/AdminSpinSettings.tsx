import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CourierRatioChecker from "@/components/admin/CourierRatioChecker";
import { api } from "@/integrations/cloudflare/client";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Search, RotateCw, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface SpinOffer {
  id: string;
  offer_text: string;
  discount_type: string;
  discount_value: number;
  color: string;
  text_color: string;
  probability: number;
  is_active: boolean;
  sort_order: number;
  icon: string;
}

interface SpinEntry {
  id: string;
  customer_name: string;
  customer_phone: string;
  offer_text: string | null;
  coupon_code: string;
  discount_type: string;
  discount_value: number;
  is_used: boolean;
  status: string;
  created_at: string;
}

const SPIN_STATUS_OPTIONS = [
  { value: "pending", label: "পেন্ডিং", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "called", label: "কল করা হয়েছে", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "fake_spinner", label: "ফেক স্পিনার", color: "bg-red-100 text-red-800 border-red-300" },
  { value: "real_customer", label: "রিয়াল কাস্টমার", color: "bg-green-100 text-green-800 border-green-300" },
];

const AdminSpinSettings = () => {
  const queryClient = useQueryClient();
  const { getSetting, bulkUpdateSettings, isUpdating, isLoading } = useSiteSettings();
  const { isAdmin } = useStaffAccess();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [editingOffers, setEditingOffers] = useState<SpinOffer[]>([]);
  const [spinEnabled, setSpinEnabled] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState("25");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load settings from DB only when settings data changes
  const spinEnabledFromDb = getSetting("spin_enabled", "false") === "true";
  const delayFromDb = getSetting("spin_delay_seconds", "25");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!settingsLoaded && !isLoading) {
      setSpinEnabled(spinEnabledFromDb);
      setDelaySeconds(delayFromDb);
      setSettingsLoaded(true);
    }
  }, [spinEnabledFromDb, delayFromDb, isLoading, settingsLoaded]);

  // Fetch offers
  const { data: offers = [] } = useQuery({
    queryKey: ["spin-offers-admin"],
    queryFn: async () => {
      const { data, error } = await api
        .from("spin_offers")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SpinOffer[];
    },
  });

  // Fetch entries
  const { data: entries = [] } = useQuery({
    queryKey: ["spin-entries"],
    queryFn: async () => {
      const { data, error } = await api
        .from("spin_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SpinEntry[];
    },
  });

  useEffect(() => {
    if (offers.length > 0 && editingOffers.length === 0) {
      setEditingOffers(offers);
    }
  }, [offers, editingOffers.length]);

  // Save settings
  const handleSaveSettings = async () => {
    try {
      await bulkUpdateSettings({
        spin_enabled: spinEnabled ? "true" : "false",
        spin_delay_seconds: delaySeconds,
      });
      setSettingsLoaded(false);
      toast.success("সেটিংস সেভ হয়েছে");
    } catch {
      toast.error("সেভ করতে সমস্যা হয়েছে");
    }
  };

  // Save offers
  const saveOffersMutation = useMutation({
    mutationFn: async (offersToSave: SpinOffer[]) => {
      for (const offer of offersToSave) {
        if (offer.id.startsWith("new-")) {
          const { id, ...rest } = offer;
          const { error } = await api.from("spin_offers").insert(rest);
          if (error) throw error;
        } else {
          const { error } = await api
            .from("spin_offers")
            .update({
              offer_text: offer.offer_text,
              discount_type: offer.discount_type,
              discount_value: offer.discount_value,
              color: offer.color,
              text_color: offer.text_color,
              probability: offer.probability,
              is_active: offer.is_active,
              sort_order: offer.sort_order,
              icon: offer.icon,
            })
            .eq("id", offer.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spin-offers-admin"] });
      setEditingOffers([]);
      toast.success("অফার সেভ হয়েছে");
    },
    onError: () => toast.error("সেভ করতে সমস্যা হয়েছে"),
  });

  const handleAddOffer = () => {
    setEditingOffers((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        offer_text: "",
        discount_type: "fixed",
        discount_value: 0,
        color: prev.length % 2 === 0 ? "#0d6e3f" : "#15803d",
        text_color: "#ffffff",
        probability: 1,
        is_active: true,
        sort_order: prev.length,
        icon: "🎁",
      },
    ]);
  };

  const handleDeleteOffer = async (id: string) => {
    if (id.startsWith("new-")) {
      setEditingOffers((prev) => prev.filter((o) => o.id !== id));
      return;
    }
    const { error } = await api.from("spin_offers").delete().eq("id", id);
    if (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
      return;
    }
    setEditingOffers((prev) => prev.filter((o) => o.id !== id));
    queryClient.invalidateQueries({ queryKey: ["spin-offers-admin"] });
    toast.success("অফার ডিলিট হয়েছে");
  };

  const updateOffer = (index: number, field: keyof SpinOffer, value: any) => {
    setEditingOffers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (filter === "used" && !e.is_used) return false;
    if (filter === "unused" && e.is_used) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.customer_name.toLowerCase().includes(q) ||
        e.customer_phone.includes(q) ||
        e.coupon_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
    }
  };

  // Bulk delete (admin only)
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await api.from("spin_entries").delete().in("id", ids);
    if (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে");
      return;
    }
    setSelectedIds(new Set());
    queryClient.invalidateQueries({ queryKey: ["spin-entries"] });
    toast.success(`${ids.length}টি এন্ট্রি ডিলিট হয়েছে`);
  };

  // Update status
  const handleStatusChange = async (entryId: string, newStatus: string) => {
    const { error } = await api
      .from("spin_entries")
      .update({ status: newStatus })
      .eq("id", entryId);
    if (error) {
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["spin-entries"] });
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
  };

  return (
    <AdminGuard>
      <AdminLayout title={isAdmin ? "স্পিন সেটিংস" : "স্পিন এন্ট্রি"}>
        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entries">এন্ট্রি সমূহ ({entries.length})</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">সেটিংস</TabsTrigger>}
          </TabsList>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="নাম, ফোন বা কুপন দিয়ে সার্চ করুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="used">ব্যবহৃত</SelectItem>
                  <SelectItem value="unused">অব্যবহৃত</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <span className="text-sm font-medium">{selectedIds.size}টি সিলেক্টেড</span>
                {isAdmin && (
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    ডিলিট করুন
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  বাতিল
                </Button>
              </div>
            )}

            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                   <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredEntries.length > 0 && selectedIds.size === filteredEntries.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>ফ্রড চেকার</TableHead>
                    <TableHead>কুপন কোড</TableHead>
                    <TableHead>অফার</TableHead>
                    <TableHead>ছাড়</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>কুপন</TableHead>
                    <TableHead>তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        কোনো এন্ট্রি নেই
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} data-state={selectedIds.has(entry.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(entry.id)}
                            onCheckedChange={() => toggleSelect(entry.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{entry.customer_name}</TableCell>
                        <TableCell>{entry.customer_phone}</TableCell>
                        <TableCell>
                          <CourierRatioChecker 
                            phone={entry.customer_phone} 
                            orderId={entry.id}
                            cachedData={null}
                          />
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-0.5 rounded text-xs font-bold">
                            {entry.coupon_code}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm">{entry.offer_text || "-"}</TableCell>
                        <TableCell>
                          {entry.discount_type === "percentage"
                            ? `${entry.discount_value}%`
                            : `৳${entry.discount_value}`}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.status || "pending"}
                            onValueChange={(v) => handleStatusChange(entry.id, v)}
                          >
                            <SelectTrigger className={`w-[160px] text-xs h-8 ${SPIN_STATUS_OPTIONS.find(s => s.value === (entry.status || "pending"))?.color || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SPIN_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.is_used ? "secondary" : "default"}>
                            {entry.is_used ? "ব্যবহৃত" : "অব্যবহৃত"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString("bn-BD")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সাধারণ সেটিংস</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">স্পিন ফিচার</Label>
                    <p className="text-sm text-muted-foreground">ওয়েবসাইটে স্পিন হুইল চালু/বন্ধ করুন</p>
                  </div>
                  <Switch checked={spinEnabled} onCheckedChange={setSpinEnabled} />
                </div>
                <div className="space-y-2">
                  <Label>পপআপ দেখানোর ডিলে (সেকেন্ড)</Label>
                  <Input
                    type="number"
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(e.target.value)}
                    className="w-32"
                    min={5}
                    max={300}
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  সেটিংস সেভ করুন
                </Button>
              </CardContent>
            </Card>

            {/* Offers Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">অফার ম্যানেজমেন্ট</CardTitle>
                <Button size="sm" onClick={handleAddOffer}>
                  <Plus className="h-4 w-4 mr-1" />
                  অফার যোগ করুন
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingOffers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className="border rounded-lg p-4 space-y-3"
                    style={{ borderLeftColor: offer.color, borderLeftWidth: 4 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">অফার টেক্সট</Label>
                        <Input
                          value={offer.offer_text}
                          onChange={(e) => updateOffer(index, "offer_text", e.target.value)}
                          placeholder="যেমন: ৫০ টাকা ছাড়"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ডিসকাউন্ট টাইপ</Label>
                        <Select
                          value={offer.discount_type}
                          onValueChange={(v) => updateOffer(index, "discount_type", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem>
                            <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                            <SelectItem value="free_shipping">ফ্রি শিপিং</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">পরিমাণ</Label>
                        <Input
                          type="number"
                          value={offer.discount_value}
                          onChange={(e) => updateOffer(index, "discount_value", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">সম্ভাবনা (Weight)</Label>
                        <Input
                          type="number"
                          value={offer.probability}
                          onChange={(e) => updateOffer(index, "probability", parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">আইকন (Emoji)</Label>
                        <Input
                          value={offer.icon || "🎁"}
                          onChange={(e) => updateOffer(index, "icon", e.target.value)}
                          placeholder="🎁"
                          className="text-xl"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">রঙ</Label>
                        <input
                          type="color"
                          value={offer.color}
                          onChange={(e) => updateOffer(index, "color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={offer.is_active}
                          onCheckedChange={(v) => updateOffer(index, "is_active", v)}
                        />
                        <Label className="text-xs">{offer.is_active ? "চালু" : "বন্ধ"}</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="ml-auto text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={() => saveOffersMutation.mutate(editingOffers)}
                  disabled={saveOffersMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  সব অফার সেভ করুন
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminSpinSettings;
