import { ArrowDown, ArrowUp, Crown, Minus, Target } from "lucide-react";

interface Player {
  rank: number;
  prev: number;
  name: string;
  initials: string;
  points: number;
  perfects: number;
  isYou?: boolean;
}

const players: Player[] = [
  { rank: 1, prev: 2, name: "Marco Silva", initials: "MS", points: 312, perfects: 9 },
  { rank: 2, prev: 1, name: "Aisha Khan", initials: "AK", points: 298, perfects: 8 },
  { rank: 3, prev: 3, name: "John Doe", initials: "JD", points: 247, perfects: 6, isYou: true },
  { rank: 4, prev: 6, name: "Lucas Wong", initials: "LW", points: 231, perfects: 5 },
  { rank: 5, prev: 4, name: "Priya Nair", initials: "PN", points: 218, perfects: 5 },
  { rank: 6, prev: 5, name: "Tom Becker", initials: "TB", points: 201, perfects: 4 },
  { rank: 7, prev: 7, name: "Sara López", initials: "SL", points: 187, perfects: 3 },
  { rank: 8, prev: 9, name: "Yuki Tanaka", initials: "YT", points: 172, perfects: 3 },
];

const Movement = ({ rank, prev }: { rank: number; prev: number }) => {
  const diff = prev - rank;
  if (diff > 0) return <span className="flex items-center gap-0.5 text-xs text-success"><ArrowUp className="h-3 w-3" />{diff}</span>;
  if (diff < 0) return <span className="flex items-center gap-0.5 text-xs text-destructive"><ArrowDown className="h-3 w-3" />{Math.abs(diff)}</span>;
  return <span className="flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3" /></span>;
};

export const Leaderboard = () => {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card shadow-elegant">
      <div className="flex items-center justify-between border-b border-border/40 p-5">
        <div>
          <h3 className="font-display text-xl font-bold">League Standings</h3>
          <p className="text-xs text-muted-foreground">Friends of the Pitch · 12 players</p>
        </div>
        <div className="flex gap-1 rounded-full border border-border/60 bg-background/50 p-1 text-xs">
          <button className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">Overall</button>
          <button className="rounded-full px-3 py-1 font-medium text-muted-foreground">Round</button>
          <button className="rounded-full px-3 py-1 font-medium text-muted-foreground">Today</button>
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {players.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30 ${p.isYou ? "bg-primary/5" : ""}`}
          >
            <div className="flex w-10 items-center justify-center">
              {p.rank === 1 ? (
                <Crown className="h-5 w-5 text-accent" />
              ) : (
                <span className={`font-display text-lg font-bold ${p.rank <= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                  {p.rank}
                </span>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {p.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{p.name}</p>
                {p.isYou && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">You</span>}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Target className="h-3 w-3" />{p.perfects} perfects</span>
                <Movement rank={p.rank} prev={p.prev} />
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold">{p.points}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};