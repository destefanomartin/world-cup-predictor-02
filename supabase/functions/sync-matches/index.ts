// Supabase Edge Function: sync-matches
// Pulls FIFA World Cup 2026 fixtures + results from football-data.org and
// upserts them into public.matches.
//
// CAMBIO: se itera por stage para traer los 104 partidos completos
// (la API tiene un límite de 50 por request en el free tier).
//
// Env required:
//   FOOTBALL_DATA_TOKEN   – API token from https://www.football-data.org/client/register
//   SUPABASE_URL          – auto-injected
//   SUPABASE_SERVICE_ROLE_KEY – auto-injected

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

// Stages a traer. La fase de grupos se divide en matchdays para no superar el límite de 50.
// football-data.org acepta ?matchday=N para GROUP_STAGE (3 jornadas × ~24 partidos c/u).
const STAGE_REQUESTS = [
  { stage: "GROUP_STAGE", matchday: 1 },
  { stage: "GROUP_STAGE", matchday: 2 },
  { stage: "GROUP_STAGE", matchday: 3 },
  { stage: "ROUND_OF_32" },
  { stage: "ROUND_OF_16" },
  { stage: "QUARTER_FINALS" },
  { stage: "SEMI_FINALS" },
  { stage: "THIRD_PLACE" },
  { stage: "FINAL" },
];

// Delay para no exceder el rate limit de 10 req/min del free tier
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    const supabase = createClient(supabaseUrl, serviceKey);
    const allMatches: FdMatch[] = [];

    for (const req of STAGE_REQUESTS) {
      const params = new URLSearchParams({ stage: req.stage });
      if ("matchday" in req && req.matchday) params.set("matchday", String(req.matchday));

      const r = await fetch(
        `${API_BASE}/competitions/${COMPETITION}/matches?${params}`,
        { headers: { "X-Auth-Token": token } },
      );

      if (!r.ok) {
        const body = await r.text();
        console.error(`football-data error for ${req.stage}: [${r.status}] ${body}`);
        // Continuar con los demás stages aunque uno falle
        await sleep(6200);
        continue;
      }

      const data = (await r.json()) as { matches: FdMatch[] };
      allMatches.push(...data.matches);

      // Respetar rate limit: 10 req/min → esperar 6.2s entre llamadas
      await sleep(6200);
    }

    // Deduplicar por id (por si un partido aparece en más de un request)
    const uniqueMatches = Array.from(
      new Map(allMatches.map((m) => [m.id, m])).values()
    );

    const rows = uniqueMatches.map((m) => ({
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

    // Scoring para partidos terminados
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