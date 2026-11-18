import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/cloudflare/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await api
        .rpc("has_role", { _user_id: user.id, _role: "admin" });
      
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user,
  });

  return { isAdmin, isLoading };
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      monthStart.setHours(0, 0, 0, 0);

      const { data, error } = await api.rpc("admin_stats", {
        today: todayStart.toISOString(), week: weekStart.toISOString(), month: monthStart.toISOString(),
      });
      if (error) throw error;
      return data as {
        totalOrders: number; totalProducts: number; pendingOrders: number; blockedUsers: number;
        todayRevenue: number; weekRevenue: number; monthRevenue: number;
        todayOrders: number; weekOrders: number; monthOrders: number;
      };
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const { data, error } = await api
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const { data, error } = await api
        .from("products")
        .select("*, categories(*)")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useBlockedUsers = () => {
  return useQuery({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      const { data, error } = await api
        .from("blocked_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAbandonedCarts = () => {
  return useQuery({
    queryKey: ["abandonedCarts"],
    queryFn: async () => {
      const { data, error } = await api
        .from("abandoned_carts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
