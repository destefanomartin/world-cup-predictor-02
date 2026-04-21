// Supabase Edge Function: score-bonus
// Recomputes points for all bonus_bets whose kind has a row in bonus_results.
// Call after the admin sets the correct picks (top scorer, MVP, etc.).
//
// Deploy: supabase functions deploy score-bonus

// @ts-expect-error Deno runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // @ts-expect-error Deno
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-expect-error Deno
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: results } = await supabase.from("bonus_results").select("kind");
    for (const r of results ?? []) {
      await supabase.rpc("score_bonus", { _kind: r.kind });
    }
    return new Response(JSON.stringify({ resolved: results?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});