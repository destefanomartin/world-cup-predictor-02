import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Flame, BarChart3, Filter } from "lucide-react";
import { Header } from "@/components/app/Header";
import { Hero } from "@/components/app/Hero";
import { MatchCard } from "@/components/app/MatchCard";
import { Leaderboard } from "@/components/app/Leaderboard";
import { BonusBets } from "@/components/app/BonusBets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMyLeagues } from "@/hooks/useLeagues";
import { useUpcomingMatches, useRecentMatches, useMyPredictions } from "@/hooks/useMatches";

const STAGE_LABELS: Record<string, string> = {
  group:        "Fase de Grupos",
  round_of_32:  "Ronda de 32",
  round_of_16:  "Octavos de Final",
  quarter_final:"Cuartos de Final",
  semi_final:   "Semifinales",
  third_place:  "Tercer Puesto",
  final:        "Final",
};

// Orden de instancias para los tabs
const STAGE_ORDER = [
  "group", "round_of_32", "round_of_16",
  "quarter_final", "semi_final", "third_place", "final",
];

const Index = () => {
  const { data: leagues = [] } = useMyLeagues();
  const [leagueId, setLeagueId] = useState<string | null>(null);
  useEffect(() => {
    if (!leagueId && leagues[0]) setLeagueId(leagues[0].id);
  }, [leagues, leagueId]);

  const currentLeague = leagues.find((l: any) => l.id === leagueId);
  const { data: upcoming = [] } = useUpcomingMatches();
  const { data: recent = [] } = useRecentMatches();

  // CAMBIO: predicciones globales, sin leagueId
  const { data: predictions = [] } = useMyPredictions();
  const predByMatch = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of predictions) map.set(p.match_id, p);
    return map;
  }, [predictions]);

  // ── Filtros ──────────────────────────────────────────────────────────────
  // Instancias que existen en los partidos actuales
  const availableStages = useMemo(() => {
    const set = new Set(upcoming.map((m: any) => m.stage));
    return STAGE_ORDER.filter((s) => set.has(s));
  }, [upcoming]);

  const [activeStage, setActiveStage] = useState<string>("group");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  // Cuando cambien los partidos, asegurar que el stage activo sea válido
  useEffect(() => {
    if (availableStages.length > 0 && !availableStages.includes(activeStage)) {
      setActiveStage(availableStages[0]);
    }
  }, [availableStages, activeStage]);

  // Grupos disponibles para el stage seleccionado
  const availableGroups = useMemo(() => {
    if (activeStage !== "group") return [];
    const groups = upcoming
      .filter((m: any) => m.stage === "group" && m.group_label)
      .map((m: any) => m.group_label as string);
    return Array.from(new Set(groups)).sort();
  }, [upcoming, activeStage]);

  // Partidos filtrados
  const filteredMatches = useMemo(() => {
    return upcoming.filter((m: any) => {
      if (m.stage !== activeStage) return false;
      if (activeStage === "group" && activeGroup !== "all") {
        return m.group_label === activeGroup;
      }
      return true;
    });
  }, [upcoming, activeStage, activeGroup]);

  // Conteo de predicciones hechas en la vista actual
  const predictedCount = filteredMatches.filter((m: any) => predByMatch.has(m.id)).length;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main>
        <Hero leagueId={leagueId ?? ''} />

        {/* Selector de liga (solo afecta leaderboard y bonus bets) */}
        {leagues.length > 1 && (
          <div className="container -mt-8 mb-4 flex items-center justify-end gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">League:</span>
            <Select value={leagueId ?? undefined} onValueChange={(v) => setLeagueId(v)}>
              <SelectTrigger className="w-56 bg-card/50">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((l: any) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {leagues.length === 0 && (
          <div className="container">
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <h2 className="font-display text-xl font-bold">Join or create your first league</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You need a league to track your score. Your predictions are saved globally —
                they'll count in every league you join.
              </p>
              <Button asChild className="mt-4"><Link to="/leagues">Manage leagues</Link></Button>
            </div>
          </div>
        )}

        {/* ── Sección de partidos con filtros ── */}
        <section id="predictions" className="container py-16">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Flame className="h-3.5 w-3.5" /> Upcoming
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Your Predictions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredMatches.length > 0
                  ? <>{predictedCount} of {filteredMatches.length} predicted</>
                  : "No matches in this view"}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="hidden md:flex gap-2 shrink-0">
              <Link to="/tournament">
                <BarChart3 className="h-4 w-4" /> Group Standings
              </Link>
            </Button>
          </div>

          {/* ── Filtros de instancia (tabs) ── */}
          {availableStages.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {availableStages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => { setActiveStage(stage); setActiveGroup("all"); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    activeStage === stage
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {STAGE_LABELS[stage] ?? stage}
                </button>
              ))}
            </div>
          )}

          {/* ── Filtro de grupo (solo en fase de grupos) ── */}
          {activeStage === "group" && availableGroups.length > 1 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" /> Grupo:
              </span>
              <button
                onClick={() => setActiveGroup("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  activeGroup === "all"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Todos
              </button>
              {availableGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    activeGroup === g
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* ── Grilla de partidos ── */}
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No hay partidos aún — corré la edge function <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">sync-matches</code> para poblar el calendario.
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">No hay partidos en este filtro.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((m: any) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  prediction={predByMatch.get(m.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Dashboard: leaderboard + bonus + resultados ── */}
        <section id="dashboard" className="container grid gap-8 pb-16 lg:grid-cols-[1.4fr_1fr]">
          <div id="leaderboard">
            <Leaderboard leagueId={leagueId} leagueName={currentLeague?.name} />
          </div>
          <div className="space-y-6">
            <div id="bonus">
              <BonusBets leagueId={leagueId} />
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-bold">Recent Results</h3>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No finished matches yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((m: any) => {
                    const p = predByMatch.get(m.id);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl bg-background/40 p-3 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                          <span className="font-medium truncate max-w-[80px]">{m.home_team}</span>
                          <span className="font-display font-bold text-foreground shrink-0">
                            {m.home_score} - {m.away_score}
                          </span>
                          <span className="font-medium truncate max-w-[80px]">{m.away_team}</span>
                        </div>
                        {p && (
                          <span className={`text-xs font-semibold shrink-0 ml-2 ${p.is_perfect ? "text-accent" : "text-muted-foreground"}`}>
                            {p.is_perfect ? "⭐" : `${p.home_score}–${p.away_score}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          <p>Pitch Picks · Built for friends · World Cup 2026</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;