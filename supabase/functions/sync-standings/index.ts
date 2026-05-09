// Supabase Edge Function: sync-standings
// Trae los standings de grupos del Mundial 2026 desde football-data.org
// y los guarda en public.standings.
//
// Deploy: supabase functions deploy sync-standings --no-verify-jwt
// Schedule: mismo cron que sync-matches (ej: "0 4 * * *")

// @ts-expect-error Deno runtime imports
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error Deno runtime imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const COMPETITION = "WC";
const API_BASE = "https://api.football-data.org/v4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // @ts-expect-error Deno
    const token = Deno.env.get("FOOTBALL_DATA_TOKEN");
    // @ts-expect-error Deno
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-expect-error Deno
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!token) throw new Error("FOOTBALL_DATA_TOKEN is not configured");

    const r = await fetch(
      `${API_BASE}/competitions/${COMPETITION}/standings`,
      { headers: { "X-Auth-Token": token } },
    );
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`football-data error [${r.status}]: ${body}`);
    }

    const data = await r.json();
    const supabase = createClient(supabaseUrl, serviceKey);

    const rows: object[] = [];

    for (const standing of data.standings ?? []) {
      // Solo fase de grupos (type === "TOTAL")
      if (standing.type !== "TOTAL") continue;

      const groupName = standing.group?.replace("GROUP_", "") ?? "?";

      for (const entry of standing.table ?? []) {
        rows.push({
          group_name:    groupName,
          position:      entry.position,
          team_id:       entry.team?.id ?? null,
          team_name:     entry.team?.name ?? "TBD",
          team_crest:    entry.team?.crest ?? null,
          played_games:  entry.playedGames ?? 0,
          won:           entry.won ?? 0,
          draw:          entry.draw ?? 0,
          lost:          entry.lost ?? 0,
          goals_for:     entry.goalsFor ?? 0,
          goals_against: entry.goalsAgainst ?? 0,
          points:        entry.points ?? 0,
          updated_at:    new Date().toISOString(),
        });
      }
    }

    const { error } = await supabase
      .from("standings")
      .upsert(rows, { onConflict: "group_name,team_name" });
    if (error) throw error;

    // También upsert teams para el autocompletado
    const teamRows = rows
      .filter((r: any) => r.team_id != null)
      .map((r: any) => ({
        id:        r.team_id,
        name:      r.team_name,
        crest:     r.team_crest,
        updated_at: new Date().toISOString(),
      }));

    if (teamRows.length > 0) {
      await supabase.from("teams").upsert(teamRows, { onConflict: "id" });
    }

    return new Response(
      JSON.stringify({ synced_standings: rows.length, synced_teams: teamRows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});