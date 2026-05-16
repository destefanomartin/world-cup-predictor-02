import { Crown, Target } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/providers/AuthProvider";

export const Leaderboard = ({ leagueId, leagueName }: { leagueId: string | null; leagueName?: string }) => {
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useLeaderboard(leagueId);

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card shadow-elegant">
      <div className="flex items-center justify-between border-b border-border/40 p-5">
        <div>
          <h3 className="font-display text-xl font-bold">Tabla de posiciones</h3>
          <p className="text-xs text-muted-foreground">{leagueName ?? "Seleccioná una liga"} · {rows.length} jugadores</p>
        </div>
      </div>

      {isLoading ? (
        <p className="p-5 text-sm text-muted-foreground">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">Todavía no hay posiciones — ¡hacé tu primera predicción!</p>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((p, i) => {
            const rank = i + 1;
            const isYou = p.user_id === user?.id;
            const initials = p.display_name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

            return (
              <div
                key={p.user_id}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30 ${isYou ? "bg-primary/5" : ""}`}
              >
                {/* Rank */}
                <div className="flex w-8 items-center justify-center shrink-0">
                  {rank === 1
                    ? <Crown className="h-5 w-5 text-accent" />
                    : <span className={`font-display text-lg font-bold ${rank <= 3 ? "text-foreground" : "text-muted-foreground"}`}>{rank}</span>}
                </div>

                {/* Avatar */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary border border-border/40 flex items-center justify-center text-sm font-semibold">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.display_name} className="h-full w-full object-cover" />
                    : initials || "?"}
                </div>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.display_name}</p>
                    {isYou && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary shrink-0">Vos</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{p.perfects} plenos</span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <p className="font-display text-lg font-bold">{p.total_points}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">puntos</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};