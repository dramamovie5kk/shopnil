import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface AdminGuardProps {
  children: ReactNode;
  /** If true, only admins can access. Otherwise, both admins and moderators can access */
  adminOnly?: boolean;
}

const AdminGuard = ({ children, adminOnly = false }: AdminGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, isLoading: staffLoading } = useStaffAccess();

  if (authLoading || staffLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For admin-only pages, check admin role
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // For staff pages, allow both admins and moderators
  if (!adminOnly && !isAdmin && !isModerator) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
