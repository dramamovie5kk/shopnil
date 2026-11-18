import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "moderator" | "user";

export const useStaffAccess = () => {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await api
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      // No role found - user is just a regular user
      if (!data) return null;

      return data.role as AppRole;
    },
    enabled: !!user,
  });

  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isStaff = isAdmin || isModerator;

  return {
    userRole,
    isAdmin,
    isModerator,
    isStaff,
    isLoading,
  };
};
