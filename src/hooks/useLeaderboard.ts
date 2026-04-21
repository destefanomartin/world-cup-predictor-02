import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useLeaderboard = (leagueId: string | null) =>
  useQuery({
    enabled: !!leagueId,
    queryKey: ["leaderboard", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("league_id", leagueId!)
        .order("total_points", { ascending: false })
        .order("perfects", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });