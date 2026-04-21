import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSavePrediction } from "@/hooks/useMatches";

export interface MatchRow {
  id: string;
  stage: string;
  group_label: string | null;
  kickoff_at: string;
  status: string;
  home_team: string;
  away_team: string;
  home_flag: string | null;
  away_flag: string | null;
  home_score: number | null;
  away_score: number | null;
}

const formatKickoff = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` · ${time}`;
};

const STAGE_LABEL: Record<string, string> = {
  group: "Group",
  round_of_32: "R32",
  round_of_16: "R16",
  quarter_final: "QF",
  semi_final: "SF",
  third_place: "3rd",
  final: "Final",
};

interface Props {
  match: MatchRow;
  leagueId: string | null;
  prediction?: { home_score: number; away_score: number; points_awarded: number | null; is_perfect: boolean | null } | null;
}

export const MatchCard = ({ match, leagueId, prediction }: Props) => {
  const locked = match.status !== "scheduled" || new Date(match.kickoff_at) <= new Date();
  const [home, setHome] = useState(prediction?.home_score?.toString() ?? "");
  const [away, setAway] = useState(prediction?.away_score?.toString() ?? "");
  useEffect(() => {
    setHome(prediction?.home_score?.toString() ?? "");
    setAway(prediction?.away_score?.toString() ?? "");
  }, [prediction?.home_score, prediction?.away_score]);
  const save = useSavePrediction(leagueId);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!leagueId) {
      toast({ title: "Pick a league first", description: "Create or join one to save predictions.", variant: "destructive" });
      return;
    }
    if (home === "" || away === "") return;
    try {
      await save.mutateAsync({
        match_id: match.id,
        home_score: Number(home),
        away_score: Number(away),
      });
      toast({ title: "Prediction saved" });
    } catch (err) {
      toast({ title: "Could not save", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant transition-all hover:border-primary/40 hover:shadow-glow">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium uppercase tracking-wider text-muted-foreground">
          {STAGE_LABEL[match.stage] ?? match.stage}{match.group_label && ` · ${match.group_label}`}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {locked ? <Lock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {formatKickoff(match.kickoff_at)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          {match.home_flag ? (
            <img src={match.home_flag} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <span className="text-3xl">🏳️</span>
          )}
          <span className="text-sm font-semibold">{match.home_team}</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="20"
            placeholder="-"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={locked}
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
            disabled={locked}
            className="h-12 w-12 rounded-xl border-border/60 bg-background/50 text-center font-display text-xl font-bold focus-visible:border-primary focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          {match.away_flag ? (
            <img src={match.away_flag} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <span className="text-3xl">🏳️</span>
          )}
          <span className="text-sm font-semibold">{match.away_team}</span>
        </div>
      </div>

      {!locked && (
        <Button
          onClick={handleSave}
          disabled={save.isPending || home === "" || away === ""}
          className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          {save.isPending ? "Saving..." : prediction ? "Update Prediction" : "Save Prediction"}
        </Button>
      )}
      {locked && match.home_score !== null && match.away_score !== null && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Final · {match.home_score} - {match.away_score}</span>
          {prediction?.points_awarded != null && (
            <span className={`font-semibold ${prediction.is_perfect ? "text-accent" : "text-primary"}`}>
              +{prediction.points_awarded} pts{prediction.is_perfect && " · perfect"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};