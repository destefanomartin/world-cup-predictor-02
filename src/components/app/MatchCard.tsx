import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface Match {
  id: string;
  home: { name: string; flag: string };
  away: { name: string; flag: string };
  kickoff: string;
  group?: string;
  stage: string;
  locked?: boolean;
  result?: { home: number; away: number };
  prediction?: { home: number; away: number };
}

export const MatchCard = ({ match }: { match: Match }) => {
  const [home, setHome] = useState(match.prediction?.home?.toString() ?? "");
  const [away, setAway] = useState(match.prediction?.away?.toString() ?? "");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant transition-all hover:border-primary/40 hover:shadow-glow">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium uppercase tracking-wider text-muted-foreground">
          {match.stage}{match.group && ` · ${match.group}`}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {match.locked ? <Lock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {match.kickoff}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">{match.home.flag}</span>
          <span className="text-sm font-semibold">{match.home.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="20"
            placeholder="-"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={match.locked}
            className="h-12 w-12 rounded-xl border-border/60 bg-background/50 text-center font-display text-xl font-bold focus-visible:border-primary focus-visible:ring-primary"
          />
          <span className="font-display text-xl font-bold text-muted-foreground">:</span>
          <Input
            type="number"
            min="0"
            max="20"
            placeholder="-"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={match.locked}
            className="h-12 w-12 rounded-xl border-border/60 bg-background/50 text-center font-display text-xl font-bold focus-visible:border-primary focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">{match.away.flag}</span>
          <span className="text-sm font-semibold">{match.away.name}</span>
        </div>
      </div>

      {!match.locked && (
        <Button size="sm" className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
          Save Prediction
        </Button>
      )}
      {match.locked && match.result && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Final · {match.result.home} - {match.result.away}</span>
          <span className="font-semibold text-primary">+5 pts</span>
        </div>
      )}
    </div>
  );
};