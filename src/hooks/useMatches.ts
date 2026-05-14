import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

// Todos los partidos scheduled/live, sin límite de 50
export const useUpcomingMatches = () =>
  useQuery({
    queryKey: ["matches", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .in("status", ["scheduled", "live"])
        .order("kickoff_at", { ascending: true });
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
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

// CAMBIO: predicciones globales — ya no dependen de league_id
export const useMyPredictions = () => {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["predictions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
};

// CAMBIO: guardar sin league_id
export const useSavePrediction = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { match_id: string; home_score: number; away_score: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("predictions")
        .upsert(
          {
            user_id: user.id,
            match_id: input.match_id,
            home_score: input.home_score,
            away_score: input.away_score,
          } as never,
          { onConflict: "user_id,match_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["predictions", user?.id] }),
  });
};