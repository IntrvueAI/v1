
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCredits = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["credits", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("credits_balance")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load credits:", error);
        throw error;
      }

      return data?.credits ?? 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  return {
    credits: query.data ?? 0,
    refetchCredits: query.refetch,
    ...query,
  };
};
