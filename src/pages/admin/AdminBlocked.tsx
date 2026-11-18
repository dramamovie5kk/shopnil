import { useState } from "react";
import { Plus, Search, Trash2, Loader2, Ban, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useBlockedUsers } from "@/hooks/useAdmin";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const AdminBlocked = () => {
  const { data: blockedUsers = [], isLoading } = useBlockedUsers();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    ip_address: "",
    reason: "",
    block_type: "permanent",
    blocked_until: "",
  });

  const filteredUsers = blockedUsers.filter(
    (u: any) =>
      u.phone?.includes(searchQuery) ||
      u.ip_address?.includes(searchQuery) ||
      u.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone && !formData.ip_address) {
      toast.error("ফোন বা IP অন্তত একটি দিতে হবে");
      return;
    }

    setSaving(true);

    const blockData = {
      phone: formData.phone || null,
      ip_address: formData.ip_address || null,
      reason: formData.reason || null,
      block_type: formData.block_type,
      blocked_until: formData.block_type === "temporary" && formData.blocked_until
        ? new Date(formData.blocked_until).toISOString()
        : null,
      blocked_by: user?.id,
    };

    const { error } = await api.from("blocked_users").insert(blockData);

    if (error) {
      if (error.code === "CONFLICT") {
        toast.error("এই ফোন/IP ইতিমধ্যে ব্লক করা আছে");
      } else {
        toast.error("ব্লক করতে ব্যর্থ");
      }
    } else {
      toast.success("সফলভাবে ব্লক করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      setDialogOpen(false);
      setFormData({
        phone: "",
        ip_address: "",
        reason: "",
        block_type: "permanent",
        blocked_until: "",
      });
    }

    setSaving(false);
  };

  const handleUnblock = async (id: string) => {
    const { error } = await api.from("blocked_users").delete().eq("id", id);

    if (error) {
      toast.error("আনব্লক করতে ব্যর্থ");
    } else {
      toast.success("আনব্লক করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="ব্লক তালিকা">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ফোন বা IP দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-destructive hover:bg-destructive/90">
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ব্লক
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন ব্লক যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ফোন নম্বর</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IP অ্যাড্রেস</Label>
                    <Input
                      value={formData.ip_address}
                      onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>কারণ</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="ব্লক করার কারণ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ব্লক টাইপ</Label>
                    <Select
                      value={formData.block_type}
                      onValueChange={(value) => setFormData({ ...formData, block_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            স্থায়ী ব্লক
                          </div>
                        </SelectItem>
                        <SelectItem value="temporary">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            সাময়িক ব্লক
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.block_type === "temporary" && (
                    <div className="space-y-2">
                      <Label>ব্লক শেষ হওয়ার তারিখ</Label>
                      <Input
                        type="datetime-local"
                        value={formData.blocked_until}
                        onChange={(e) => setFormData({ ...formData, blocked_until: e.target.value })}
                      />
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" className="bg-destructive" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      ব্লক করুন
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Blocked Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">কোনো ব্লকড ইউজার নেই</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ফোন</TableHead>
                        <TableHead>IP অ্যাড্রেস</TableHead>
                        <TableHead>কারণ</TableHead>
                        <TableHead>টাইপ</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((blocked: any) => (
                        <TableRow key={blocked.id}>
                          <TableCell className="font-mono">
                            {blocked.phone || "-"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {blocked.ip_address || "-"}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {blocked.reason || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={blocked.block_type === "permanent" ? "destructive" : "secondary"}
                            >
                              {blocked.block_type === "permanent" ? (
                                <>
                                  <Shield className="h-3 w-3 mr-1" />
                                  স্থায়ী
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  সাময়িক
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(blocked.created_at).toLocaleDateString("bn-BD")}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  আনব্লক
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>আনব্লক করতে চান?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    এই ইউজারকে আনব্লক করলে সে আবার অর্ডার করতে পারবে।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUnblock(blocked.id)}>
                                    আনব্লক
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminBlocked;
