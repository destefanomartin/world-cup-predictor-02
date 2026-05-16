import { BarChart3 } from "lucide-react";
import { Header } from "@/components/app/Header";
import { GroupStandings } from "@/components/app/GroupStandings";
import { useRecentMatches } from "@/hooks/useMatches";

const Tournament = () => {
  const { data: recent = [] } = useRecentMatches();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> Torneo en vivo
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Fase de Grupos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Posiciones en tiempo real del Mundial 2026.
          </p>
        </div>

        <GroupStandings />

        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold">Resultados recientes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.slice(0, 12).map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-gradient-card p-4"
                >
                  <div className="flex items-center gap-2 text-sm">
                    {m.home_flag && (
                      <img src={m.home_flag} alt="" className="h-5 w-5 object-contain" />
                    )}
                    <span className="font-medium">{m.home_team}</span>
                  </div>
                  <div className="mx-2 text-center">
                    <span className="font-display text-lg font-bold tabular-nums">
                      {m.home_score} – {m.away_score}
                    </span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {m.group_label ? `Grupo ${m.group_label}` : m.stage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{m.away_team}</span>
                    {m.away_flag && (
                      <img src={m.away_flag} alt="" className="h-5 w-5 object-contain" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          <p>PRODE 2026 · Hecho para amigos · Mundial 2026</p>
        </footer>
      </main>
    </div>
  );
};

export default Tournament;