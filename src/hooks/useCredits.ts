
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/UserService";

export const useCredits = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["credits", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const balance = await UserService.getCredits(user.id);
      return balance.credits;
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
