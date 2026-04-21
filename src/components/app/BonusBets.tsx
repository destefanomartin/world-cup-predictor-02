import { Award, Footprints, Shield, Star } from "lucide-react";

const bets = [
  { icon: Star, label: "Top Scorer", pick: "Kylian Mbappé", points: "+50 pts", locked: true },
  { icon: Award, label: "Best Player (MVP)", pick: "Jude Bellingham", points: "+50 pts", locked: true },
  { icon: Shield, label: "Best Goalkeeper", pick: "Not picked", points: "+30 pts", locked: false },
  { icon: Footprints, label: "Most Assists", pick: "Pedri González", points: "+30 pts", locked: true },
];

export const BonusBets = () => {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold">Bonus Bets</h3>
          <p className="text-xs text-muted-foreground">Tournament-long predictions</p>
        </div>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">3 / 4 set</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {bets.map((b) => {
          const Icon = b.icon;
          const empty = !b.locked;
          return (
            <div
              key={b.label}
              className={`group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-primary/40 ${
                empty ? "border-dashed border-border/60 bg-background/30" : "border-border/60 bg-background/50"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${empty ? "bg-secondary" : "bg-gradient-trophy shadow-trophy"}`}>
                <Icon className={`h-5 w-5 ${empty ? "text-muted-foreground" : "text-accent-foreground"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.label}</p>
                <p className={`truncate font-semibold ${empty ? "text-muted-foreground" : ""}`}>{b.pick}</p>
              </div>
              <span className="text-xs font-semibold text-primary">{b.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};