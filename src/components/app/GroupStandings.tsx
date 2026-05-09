import { useStandings } from "@/hooks/useTournament";

interface StandingRow {
  group_name: string;
  position: number;
  team_name: string;
  team_crest: string | null;
  played_games: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

const GroupTable = ({ group, rows }: { group: string; rows: StandingRow[] }) => (
  <div className="rounded-2xl border border-border/60 bg-gradient-card shadow-elegant overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
        {group}
      </span>
      <span className="font-display font-semibold text-sm">Group {group}</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30">
            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-muted-foreground w-6">#</th>
            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-muted-foreground">Team</th>
            <th className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">PJ</th>
            <th className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">G</th>
            <th className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">E</th>
            <th className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">P</th>
            <th className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">GD</th>
            <th className="px-3 py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const gd = row.goals_for - row.goals_against;
            const advances = i < 2; // top 2 pasan directamente
            const thirdPlace = i === 2; // el 3ro puede clasificar

            return (
              <tr
                key={row.team_name}
                className={`border-b border-border/20 last:border-0 transition-colors hover:bg-background/40 ${
                  advances ? "bg-primary/5" : thirdPlace ? "bg-accent/5" : ""
                }`}
              >
                <td className="px-3 py-2.5 text-muted-foreground font-medium text-center">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs ${
                      advances
                        ? "bg-primary/20 text-primary font-bold"
                        : thirdPlace
                        ? "bg-accent/20 text-accent font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.position}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {row.team_crest ? (
                      <img src={row.team_crest} alt="" className="h-5 w-5 object-contain shrink-0" />
                    ) : (
                      <span className="text-base">🏳️</span>
                    )}
                    <span className="font-medium truncate max-w-[120px]">{row.team_name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{row.played_games}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{row.won}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{row.draw}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{row.lost}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-2.5 text-center font-bold text-foreground">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export const GroupStandings = () => {
  const { data: standings = [], isLoading } = useStandings();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-secondary/50" />
        ))}
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No standings yet. Run the{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">sync-standings</code>{" "}
          edge function to populate group tables.
        </p>
      </div>
    );
  }

  // Agrupar por group_name
  const byGroup = standings.reduce<Record<string, StandingRow[]>>((acc, row: StandingRow) => {
    if (!acc[row.group_name]) acc[row.group_name] = [];
    acc[row.group_name].push(row);
    return acc;
  }, {});

  const groups = Object.keys(byGroup).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/20" />
          Classifica directamente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/20" />
          Posible clasificación (mejor 3ro)
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <GroupTable key={g} group={g} rows={byGroup[g]} />
        ))}
      </div>
    </div>
  );
};