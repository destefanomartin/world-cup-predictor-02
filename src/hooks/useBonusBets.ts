import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import type { BonusKind } from "@/lib/database.types";

export const useMyBonusBets = (leagueId: string | null) => {
  const { user } = useAuth();
  return useQuery({
    enabled: !!leagueId && !!user,
    queryKey: ["bonus", leagueId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bonus_bets")
        .select("*")
        .eq("league_id", leagueId!)
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useSaveBonusBet = (leagueId: string | null) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { kind: BonusKind; pick: string }) => {
      if (!leagueId || !user) throw new Error("Missing league or user");
      const { error } = await supabase
        .from("bonus_bets")
        .upsert(
          { league_id: leagueId, user_id: user.id, kind: input.kind, pick: input.pick },
          { onConflict: "league_id,user_id,kind" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bonus", leagueId] }),
  });
};