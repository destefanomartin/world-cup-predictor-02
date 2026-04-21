import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export const generateInviteCode = () =>
  Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
  ).join("");

export const useMyLeagues = () => {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["leagues", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_members")
        .select("role, leagues:league_id(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({ ...row.leagues, role: row.role }));
    },
  });
};

export const useCreateLeague = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; max_members?: number }) => {
      const { data, error } = await supabase
        .from("leagues")
        .insert({
          name: input.name,
          max_members: input.max_members ?? 20,
          invite_code: generateInviteCode(),
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leagues"] }),
  });
};

export const useJoinLeague = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("join_league_by_code", { _code: code });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leagues"] }),
  });
};