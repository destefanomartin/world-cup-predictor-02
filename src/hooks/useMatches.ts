import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export const useUpcomingMatches = () =>
  useQuery({
    queryKey: ["matches", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .in("status", ["scheduled", "live"])
        .order("kickoff_at", { ascending: true })
      if (error) throw error;
      return data ?? [];
    },
  });

export const useRecentMatches = () =>
  useQuery({
    queryKey: ["matches", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "finished")
        .order("kickoff_at", { ascending: false })
      if (error) throw error;
      return data ?? [];
    },
  });

export const useMyPredictions = (leagueId: string | null) => {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user && !!leagueId,
    queryKey: ["predictions", leagueId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("league_id", leagueId!)
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useSavePrediction = (leagueId: string | null) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { match_id: string; home_score: number; away_score: number }) => {
      if (!leagueId || !user) throw new Error("Missing league or user");
      const { error } = await supabase
        .from("predictions")
        .upsert(
          {
            league_id: leagueId,
            user_id: user.id,
            match_id: input.match_id,
            home_score: input.home_score,
            away_score: input.away_score,
          } as never,
          { onConflict: "league_id,user_id,match_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["predictions", leagueId] }),
  });
};