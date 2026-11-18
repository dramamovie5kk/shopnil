import { useState, useEffect } from "react";
import { Plus, Loader2, Package, AlertTriangle, History, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface Product {
  id: string;
  name_bn: string;
  stock: number;
  low_stock_threshold: number;
  cost_price: number | null;
  price: number;
}

interface StockHistory {
  id: string;
  product_id: string;
  change_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes: string | null;
  created_at: string;
  products?: { name_bn: string };
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

const AdminInventory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState("alerts");

  // Stock adjustment dialog
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    product_id: "",
    change_type: "adjustment" as "purchase" | "sale" | "adjustment" | "return",
    quantity: "",
    notes: "",
  });

  // Supplier dialog
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: prodData } = await api
        .from("products")
        .select("id, name_bn, stock, low_stock_threshold, cost_price, price")
        .order("name_bn");

      if (prodData) {
        setProducts(prodData);
        // Filter low stock products
        const lowStock = prodData.filter(
          (p) => (p.stock || 0) <= (p.low_stock_threshold || 5)
        );
        setLowStockProducts(lowStock);
      }

      // Fetch stock history
      const { data: histData } = await api
        .from("stock_history")
        .select("*, products(name_bn)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (histData) setStockHistory(histData as StockHistory[]);

      // Fetch suppliers
      const { data: suppData } = await api
        .from("suppliers")
        .select("*")
        .order("name");

      if (suppData) setSuppliers(suppData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.product_id || !adjustForm.quantity) {
      toast.error("প্রোডাক্ট এবং পরিমাণ দিন");
      return;
    }

    setAdjusting(true);
    try {
      const product = products.find((p) => p.id === adjustForm.product_id);
      if (!product) throw new Error("Product not found");

      const quantityChange = parseInt(adjustForm.quantity);
      const previousStock = product.stock || 0;
      let newStock = previousStock;

      // Calculate new stock based on change type
      if (adjustForm.change_type === "purchase" || adjustForm.change_type === "return") {
        newStock = previousStock + Math.abs(quantityChange);
      } else if (adjustForm.change_type === "sale") {
        newStock = previousStock - Math.abs(quantityChange);
      } else {
        // Adjustment can be positive or negative
        newStock = previousStock + quantityChange;
      }

      if (newStock < 0) {
        toast.error("স্টক নেগেটিভ হতে পারে না");
        setAdjusting(false);
        return;
      }

      // Update product stock
      const { error: updateError } = await api
        .from("products")
        .update({ stock: newStock })
        .eq("id", adjustForm.product_id);

      if (updateError) throw updateError;

      // Create stock history entry
      const { error: histError } = await api.from("stock_history").insert({
        product_id: adjustForm.product_id,
        change_type: adjustForm.change_type,
        quantity_change: quantityChange,
        previous_stock: previousStock,
        new_stock: newStock,
        notes: adjustForm.notes || null,
        created_by: user?.id,
      });

      if (histError) throw histError;

      toast.success("স্টক আপডেট হয়েছে!");
      setAdjustDialogOpen(false);
      setAdjustForm({
        product_id: "",
        change_type: "adjustment",
        quantity: "",
        notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("স্টক আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setAdjusting(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) {
      toast.error("সাপ্লায়ারের নাম দিন");
      return;
    }

    setSavingSupplier(true);
    try {
      const { error } = await api.from("suppliers").insert({
        name: supplierForm.name,
        phone: supplierForm.phone || null,
        email: supplierForm.email || null,
        address: supplierForm.address || null,
      });

      if (error) throw error;

      toast.success("সাপ্লায়ার যোগ হয়েছে!");
      setSupplierDialogOpen(false);
      setSupplierForm({ name: "", phone: "", email: "", address: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("সাপ্লায়ার সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSavingSupplier(false);
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return { label: "ক্রয়", color: "bg-green-100 text-green-700" };
      case "sale":
        return { label: "বিক্রয়", color: "bg-blue-100 text-blue-700" };
      case "return":
        return { label: "রিটার্ন", color: "bg-yellow-100 text-yellow-700" };
      case "adjustment":
        return { label: "সমন্বয়", color: "bg-purple-100 text-purple-700" };
      default:
        return { label: type, color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="ইনভেন্টরি ম্যানেজমেন্ট">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট প্রোডাক্ট</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${lowStockProducts.length > 0 ? "border-l-red-500" : "border-l-green-500"}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">কম স্টক</p>
                    <p className={`text-2xl font-bold ${lowStockProducts.length > 0 ? "text-red-600" : "text-green-600"}`}>
                      {lowStockProducts.length}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${lowStockProducts.length > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                    <AlertTriangle className={`h-5 w-5 ${lowStockProducts.length > 0 ? "text-red-600" : "text-green-600"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">সাপ্লায়ার</p>
                    <p className="text-2xl font-bold">{suppliers.length}</p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-brand">
                  <Plus className="h-4 w-4 mr-2" />
                  স্টক সমন্বয়
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>স্টক সমন্বয় করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStockAdjustment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>প্রোডাক্ট *</Label>
                    <Select
                      value={adjustForm.product_id}
                      onValueChange={(v) => setAdjustForm({ ...adjustForm, product_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="প্রোডাক্ট বাছুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name_bn} (স্টক: {p.stock || 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>পরিবর্তনের ধরণ</Label>
                    <Select
                      value={adjustForm.change_type}
                      onValueChange={(v: any) => setAdjustForm({ ...adjustForm, change_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">ক্রয় (+)</SelectItem>
                        <SelectItem value="sale">বিক্রয় (-)</SelectItem>
                        <SelectItem value="return">রিটার্ন (+)</SelectItem>
                        <SelectItem value="adjustment">সমন্বয় (+/-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>পরিমাণ *</Label>
                    <Input
                      type="number"
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                      placeholder={adjustForm.change_type === "adjustment" ? "ধনাত্মক বা ঋণাত্মক" : "পরিমাণ"}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>নোট</Label>
                    <Textarea
                      value={adjustForm.notes}
                      onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                      placeholder="কারণ বা রেফারেন্স"
                      rows={2}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="bg-gradient-brand" disabled={adjusting}>
                      {adjusting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      সেভ করুন
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন সাপ্লায়ার
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন সাপ্লায়ার যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveSupplier} className="space-y-4">
                  <div className="space-y-2">
                    <Label>নাম *</Label>
                    <Input
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ফোন</Label>
                    <Input
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ইমেইল</Label>
                    <Input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ঠিকানা</Label>
                    <Textarea
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-gradient-brand" disabled={savingSupplier}>
                      {savingSupplier && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      সেভ করুন
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                কম স্টক
                {lowStockProducts.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {lowStockProducts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                সব প্রোডাক্ট
                <Badge variant="secondary" className="ml-1">
                  {products.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                হিস্ট্রি
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="gap-2">
                <Truck className="h-4 w-4" />
                সাপ্লায়ার
              </TabsTrigger>
            </TabsList>

            {/* All Products Tab */}
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>সব প্রোডাক্টের স্টক</CardTitle>
                  <CardDescription>
                    প্রতিটি প্রোডাক্টে কতগুলো স্টক আছে দেখুন
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      কোনো প্রোডাক্ট নেই
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>প্রোডাক্ট</TableHead>
                            <TableHead className="text-center">বর্তমান স্টক</TableHead>
                            <TableHead className="text-center">থ্রেশহোল্ড</TableHead>
                            <TableHead className="text-right">বিক্রয় মূল্য</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((p) => {
                            const isLowStock = (p.stock || 0) <= (p.low_stock_threshold || 5);
                            return (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.name_bn}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={isLowStock ? "destructive" : "secondary"}>
                                    {p.stock || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {p.low_stock_threshold || 5}
                                </TableCell>
                                <TableCell className="text-right font-medium text-primary">
                                  ৳{p.price}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setAdjustForm({ ...adjustForm, product_id: p.id, change_type: "adjustment" });
                                      setAdjustDialogOpen(true);
                                    }}
                                  >
                                    সমন্বয়
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>কম স্টক প্রোডাক্ট</CardTitle>
                  <CardDescription>
                    যেসব প্রোডাক্টের স্টক থ্রেশহোল্ডের নিচে
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : lowStockProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      ✅ সব প্রোডাক্টে পর্যাপ্ত স্টক আছে
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>প্রোডাক্ট</TableHead>
                            <TableHead className="text-center">বর্তমান স্টক</TableHead>
                            <TableHead className="text-center">থ্রেশহোল্ড</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowStockProducts.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.name_bn}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">{p.stock || 0}</Badge>
                              </TableCell>
                              <TableCell className="text-center text-muted-foreground">
                                {p.low_stock_threshold || 5}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setAdjustForm({ ...adjustForm, product_id: p.id, change_type: "purchase" });
                                    setAdjustDialogOpen(true);
                                  }}
                                >
                                  স্টক যোগ করুন
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>স্টক পরিবর্তনের ইতিহাস</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : stockHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      কোনো হিস্ট্রি নেই
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>তারিখ</TableHead>
                            <TableHead>প্রোডাক্ট</TableHead>
                            <TableHead>ধরণ</TableHead>
                            <TableHead className="text-center">পরিবর্তন</TableHead>
                            <TableHead className="text-center">নতুন স্টক</TableHead>
                            <TableHead>নোট</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockHistory.map((h) => {
                            const typeInfo = getChangeTypeLabel(h.change_type);
                            return (
                              <TableRow key={h.id}>
                                <TableCell className="whitespace-nowrap">
                                  {format(new Date(h.created_at), "dd MMM yyyy HH:mm", { locale: bn })}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {h.products?.name_bn || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                </TableCell>
                                <TableCell className={`text-center font-medium ${h.quantity_change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {h.quantity_change >= 0 ? "+" : ""}{h.quantity_change}
                                </TableCell>
                                <TableCell className="text-center">{h.new_stock}</TableCell>
                                <TableCell className="max-w-[150px] truncate text-muted-foreground">
                                  {h.notes || "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>সাপ্লায়ার তালিকা</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : suppliers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      কোনো সাপ্লায়ার নেই
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>নাম</TableHead>
                            <TableHead>ফোন</TableHead>
                            <TableHead>ইমেইল</TableHead>
                            <TableHead>ঠিকানা</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell>{s.phone || "-"}</TableCell>
                              <TableCell>{s.email || "-"}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {s.address || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminInventory;
