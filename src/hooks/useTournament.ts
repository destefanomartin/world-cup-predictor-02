import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useStandings = () =>
  useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standings")
        .select("*")
        .order("group_name", { ascending: true })
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useTeams = () =>
  useQuery({
    queryKey: ["teams"],
    staleTime: 1000 * 60 * 60, // 1 hora — los equipos no cambian
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, short_name, tla, crest")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const usePlayers = () =>
  useQuery({
    queryKey: ["players"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, team_name, nationality")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });