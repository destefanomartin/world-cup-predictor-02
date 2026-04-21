import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Flame } from "lucide-react";
import { Header } from "@/components/app/Header";
import { Hero } from "@/components/app/Hero";
import { MatchCard } from "@/components/app/MatchCard";
import { Leaderboard } from "@/components/app/Leaderboard";
import { BonusBets } from "@/components/app/BonusBets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMyLeagues } from "@/hooks/useLeagues";
import { useUpcomingMatches, useRecentMatches, useMyPredictions } from "@/hooks/useMatches";

const Index = () => {
  const { data: leagues = [] } = useMyLeagues();
  const [leagueId, setLeagueId] = useState<string | null>(null);
  useEffect(() => {
    if (!leagueId && leagues[0]) setLeagueId(leagues[0].id);
  }, [leagues, leagueId]);

  const currentLeague = leagues.find((l: any) => l.id === leagueId);
  const { data: upcoming = [] } = useUpcomingMatches();
  const { data: recent = [] } = useRecentMatches();
  const { data: predictions = [] } = useMyPredictions(leagueId);

  const predByMatch = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of predictions) map.set(p.match_id, p);
    return map;
  }, [predictions]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main>
        <Hero />

        {leagues.length > 1 && (
          <div className="container -mt-8 mb-4 flex items-center justify-end gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">League:</span>
            <Select value={leagueId ?? undefined} onValueChange={(v) => setLeagueId(v)}>
              <SelectTrigger className="w-56 bg-card/50"><SelectValue placeholder="Select league" /></SelectTrigger>
              <SelectContent>
                {leagues.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {leagues.length === 0 && (
          <div className="container">
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <h2 className="font-display text-xl font-bold">Join or create your first league</h2>
              <p className="mt-1 text-sm text-muted-foreground">You need a league to start saving predictions.</p>
              <Button asChild className="mt-4"><Link to="/leagues">Manage leagues</Link></Button>
            </div>
          </div>
        )}

        <section id="predictions" className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Flame className="h-3.5 w-3.5" /> Live Now
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Upcoming Matches</h2>
              <p className="mt-1 text-sm text-muted-foreground">Lock in your predictions before kickoff.</p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming matches yet — run the sync-matches edge function to populate the schedule.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((m: any) => (
                <MatchCard key={m.id} match={m} leagueId={leagueId} prediction={predByMatch.get(m.id)} />
              ))}
            </div>
          )}
        </section>

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
                      <div key={m.id} className="flex items-center justify-between rounded-xl bg-background/40 p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.home_team}</span>
                          <span className="font-display font-bold text-foreground">{m.home_score} - {m.away_score}</span>
                          <span className="font-medium">{m.away_team}</span>
                        </div>
                        <span className={`text-xs font-semibold ${p?.is_perfect ? "text-accent" : "text-muted-foreground"}`}>
                          {p?.points_awarded != null ? `+${p.points_awarded}${p.is_perfect ? " perfect" : ""}` : "—"}
                        </span>
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
