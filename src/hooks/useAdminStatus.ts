import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminStatus = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      console.log('Checking admin status for user:', user.email);
      
      const { data, error } = await supabase.rpc('is_current_user_admin');
      
      if (error) {
        console.error("Failed to check admin status:", error);
        return false;
      }
      
      console.log('Admin status result:', data);
      return data as boolean;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isAdmin: query.data ?? false,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};