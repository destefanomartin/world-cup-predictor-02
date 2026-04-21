// Supabase Edge Function: sync-matches
// Pulls FIFA World Cup 2026 fixtures + results from football-data.org and
// upserts them into public.matches.
//
// Env required (set via `supabase secrets set ...`):
//   FOOTBALL_DATA_TOKEN   – API token from https://www.football-data.org/client/register
//   SUPABASE_URL          – auto-injected
//   SUPABASE_SERVICE_ROLE_KEY – auto-injected
//
// Schedule daily after matches finish (e.g. cron `0 4 * * *` UTC).
// Deploy: supabase functions deploy sync-matches --no-verify-jwt

// @ts-expect-error Deno runtime imports
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error Deno runtime imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// football-data.org competition code for FIFA World Cup
const COMPETITION = "WC";
const API_BASE = "https://api.football-data.org/v4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: { name: string; tla?: string; crest?: string };
  awayTeam: { name: string; tla?: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
};

const STAGE_MAP: Record<string, string> = {
  GROUP_STAGE: "group",
  LAST_16: "round_of_16",
  ROUND_OF_32: "round_of_32",
  QUARTER_FINALS: "quarter_final",
  SEMI_FINALS: "semi_final",
  THIRD_PLACE: "third_place",
  FINAL: "final",
};
const STATUS_MAP: Record<string, string> = {
  SCHEDULED: "scheduled",
  TIMED: "scheduled",
  IN_PLAY: "live",
  PAUSED: "live",
  FINISHED: "finished",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
  SUSPENDED: "postponed",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // @ts-expect-error Deno
    const token = Deno.env.get("FOOTBALL_DATA_TOKEN");
    // @ts-expect-error Deno
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-expect-error Deno
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!token) throw new Error("FOOTBALL_DATA_TOKEN is not configured");

    const r = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches`, {
      headers: { "X-Auth-Token": token },
    });
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`football-data error [${r.status}]: ${body}`);
    }
    const data = (await r.json()) as { matches: FdMatch[] };

    const supabase = createClient(supabaseUrl, serviceKey);
    const rows = data.matches.map((m) => ({
      external_id: String(m.id),
      stage: STAGE_MAP[m.stage] ?? "group",
      group_label: m.group ? m.group.replace("GROUP_", "") : null,
      matchday: m.matchday,
      kickoff_at: m.utcDate,
      status: STATUS_MAP[m.status] ?? "scheduled",
      home_team: m.homeTeam?.name ?? "TBD",
      away_team: m.awayTeam?.name ?? "TBD",
      home_flag: m.homeTeam?.crest ?? null,
      away_flag: m.awayTeam?.crest ?? null,
      home_score: m.score?.fullTime?.home,
      away_score: m.score?.fullTime?.away,
    }));

    const { error } = await supabase
      .from("matches")
      .upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    // Trigger scoring for any newly-finished matches
    const { data: finished } = await supabase
      .from("matches")
      .select("id")
      .eq("status", "finished");
    for (const m of finished ?? []) {
      await supabase.rpc("score_match", { _match_id: m.id });
    }

    return new Response(
      JSON.stringify({ synced: rows.length, scored: finished?.length ?? 0 }),
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