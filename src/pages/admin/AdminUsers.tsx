import { useState } from "react";
import { Search, UserPlus, Shield, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/admin/AdminGuard";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

type AppRole = "admin" | "moderator" | "user";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: AppRole;
  created_at: string;
}

const roleLabels: Record<AppRole, { label: string; color: string }> = {
  admin: { label: "অ্যাডমিন", color: "bg-red-500" },
  moderator: { label: "মডারেটর", color: "bg-blue-500" },
  user: { label: "ইউজার", color: "bg-gray-500" },
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ALL users from profiles, then get their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      // Get all profiles (staff can view all profiles now)
      const { data: profiles, error: profilesError } = await api
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await api
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data - show ALL users, with their role if they have one
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name || null,
          phone: profile.phone || null,
          email: null, // Email is in auth.users, we can't access it directly
          role: (userRole?.role as AppRole) || "user",
          created_at: profile.created_at,
        };
      });

      return usersWithRoles;
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.phone || "").includes(searchQuery) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error("ইমেইল দিন");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, we need to find the user by email via profiles or user lookup
      // Since we can't directly query auth.users, we'll need the user_id
      // For now, let's assume the admin inputs the user_id directly
      
      // Check if this might be a user_id (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      let userId = newUserEmail.trim();
      
      if (!uuidRegex.test(userId)) {
        toast.error("সঠিক User ID দিন (UUID ফরম্যাটে)");
        setIsSubmitting(false);
        return;
      }

      // Check if user already has a role
      const { data: existingRole } = await api
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await api
          .from("user_roles")
          .update({ role: newUserRole })
          .eq("user_id", userId);

        if (error) throw error;
        toast.success("ইউজার রোল আপডেট হয়েছে");
      } else {
        // Insert new role
        const { error } = await api
          .from("user_roles")
          .insert({ user_id: userId, role: newUserRole });

        if (error) throw error;
        toast.success("ইউজার রোল যোগ হয়েছে");
      }

      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsAddDialogOpen(false);
      setNewUserEmail("");
      setNewUserRole("moderator");
    } catch (error: any) {
      toast.error(error.message || "রোল যোগ করতে ব্যর্থ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    try {
      // Check if user already has a role entry
      const { data: existingRole } = await api
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await api
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role entry
        const { error } = await api
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast.success("রোল আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error: any) {
      toast.error(error.message || "রোল আপডেট ব্যর্থ");
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await api
        .from("user_roles")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;
      toast.success("ইউজার রোল মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || "রোল ডিলিট ব্যর্থ");
    }
  };

  return (
    <AdminGuard adminOnly>
      <AdminLayout title="ইউজার ম্যানেজমেন্ট">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ইউজার খুঁজুন (নাম, ফোন, ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="রোল ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল রোল</SelectItem>
                  <SelectItem value="admin">অ্যাডমিন</SelectItem>
                  <SelectItem value="moderator">মডারেটর</SelectItem>
                  <SelectItem value="user">ইউজার</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                রোল যোগ করুন
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  মোট অ্যাডমিন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {users.filter((u) => u.role === "admin").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  মোট মডারেটর
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {users.filter((u) => u.role === "moderator").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  মোট রোল অ্যাসাইন্ড
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ইউজার</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>ফোন</TableHead>
                        <TableHead>রোল</TableHead>
                        <TableHead>যোগ হয়েছে</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">কোনো ইউজার নেই</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => {
                          const roleInfo = roleLabels[user.role];
                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                    {user.role === "admin" ? (
                                      <Shield className="h-5 w-5 text-red-500" />
                                    ) : user.role === "moderator" ? (
                                      <Shield className="h-5 w-5 text-blue-500" />
                                    ) : (
                                      <User className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {user.full_name || "নাম নেই"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {user.user_id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>{user.phone || "-"}</TableCell>
                              <TableCell>
                                <Select
                                  value={user.role}
                                  onValueChange={(value: AppRole) =>
                                    handleUpdateRole(user.user_id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <Badge className={`${roleInfo.color} text-white`}>
                                      {roleInfo.label}
                                    </Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">অ্যাডমিন</SelectItem>
                                    <SelectItem value="moderator">মডারেটর</SelectItem>
                                    <SelectItem value="user">ইউজার</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString("bn-BD")}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Role Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ইউজার রোল যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>User ID (UUID)</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    ইউজারের UUID দিন। এটি প্রোফাইল বা অর্ডার থেকে পাওয়া যাবে।
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>রোল</Label>
                  <Select value={newUserRole} onValueChange={(v: AppRole) => setNewUserRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">অ্যাডমিন</SelectItem>
                      <SelectItem value="moderator">মডারেটর</SelectItem>
                      <SelectItem value="user">ইউজার</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button onClick={handleAddUser} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  যোগ করুন
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>রোল মুছে ফেলবেন?</AlertDialogTitle>
                <AlertDialogDescription>
                  এই ইউজারের {selectedUser?.full_name || "ইউজার"} রোল মুছে ফেলা হবে।
                  তিনি আর অ্যাডমিন প্যানেলে অ্যাক্সেস পাবেন না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteRole}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  মুছে ফেলুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminUsers;
