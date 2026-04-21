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
          <h3 className="font-display text-xl font-bold">League Standings</h3>
          <p className="text-xs text-muted-foreground">{leagueName ?? "Select a league"} · {rows.length} players</p>
        </div>
      </div>
      {isLoading ? (
        <p className="p-5 text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">No standings yet — make your first prediction!</p>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((p, i) => {
            const rank = i + 1;
            const isYou = p.user_id === user?.id;
            const initials = p.display_name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={p.user_id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30 ${isYou ? "bg-primary/5" : ""}`}>
                <div className="flex w-10 items-center justify-center">
                  {rank === 1 ? (
                    <Crown className="h-5 w-5 text-accent" />
                  ) : (
                    <span className={`font-display text-lg font-bold ${rank <= 3 ? "text-foreground" : "text-muted-foreground"}`}>{rank}</span>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{initials || "?"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{p.display_name}</p>
                    {isYou && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">You</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{p.perfects} perfects</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold">{p.total_points}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};