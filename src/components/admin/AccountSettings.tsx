import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { api } from "@/integrations/cloudflare/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AccountSettings = () => {
  const { user } = useAuth();
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 10) {
      toast.error("নতুন পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না");
      return;
    }

    setPasswordLoading(true);

    try {
      // Verify current password by re-signing in
      const { error: signInError } = await api.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("বর্তমান পাসওয়ার্ড ভুল");
        setPasswordLoading(false);
        return;
      }

      // Update password
      const { error } = await api.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message || "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে");
      } else {
        toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন");
    }

    setPasswordLoading(false);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast.error("নতুন ইমেইল দিন");
      return;
    }

    if (newEmail === user?.email) {
      toast.error("এটি আপনার বর্তমান ইমেইল");
      return;
    }

    setEmailLoading(true);

    const { error } = await api.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      toast.error(error.message || "ইমেইল পরিবর্তন করতে সমস্যা হয়েছে");
    } else {
      toast.success("ইমেইল আপডেট হয়েছে।");
      setNewEmail("");
    }

    setEmailLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Current Account
          </CardTitle>
          <CardDescription>আপনার বর্তমান অ্যাকাউন্ট তথ্য</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>আপনার পাসওয়ার্ড পরিবর্তন করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ১০ অক্ষর)"
                required
                minLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড আবার দিন"
                required
                minLength={10}
              />
            </div>

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Password Change
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email
          </CardTitle>
          <CardDescription>
            ইমেইল বদলানোর আগে আবার লগইন করুন। পরিবর্তন সঙ্গে সঙ্গে কার্যকর হবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
                required
              />
            </div>

            <Button type="submit" disabled={emailLoading}>
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Email Change
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
