import { useState } from "react";
import { Award, Footprints, Shield, Star, Trophy, Medal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMyBonusBets, useSaveBonusBet } from "@/hooks/useBonusBets";
import type { BonusKind } from "@/lib/database.types";

const KINDS: { kind: BonusKind; label: string; icon: typeof Star }[] = [
  { kind: "top_scorer", label: "Top Scorer", icon: Star },
  { kind: "mvp", label: "Best Player (MVP)", icon: Award },
  { kind: "best_goalkeeper", label: "Best Goalkeeper", icon: Shield },
  { kind: "most_assists", label: "Most Assists", icon: Footprints },
  { kind: "champion", label: "Champion", icon: Trophy },
  { kind: "runner_up", label: "Runner-up", icon: Medal },
];

export const BonusBets = ({ leagueId }: { leagueId: string | null }) => {
  const { data: bets = [] } = useMyBonusBets(leagueId);
  const save = useSaveBonusBet(leagueId);
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const valueFor = (kind: BonusKind) =>
    drafts[kind] ?? bets.find((b) => b.kind === kind)?.pick ?? "";

  const handleSave = async (kind: BonusKind) => {
    const pick = valueFor(kind).trim();
    if (!pick) return;
    if (!leagueId) {
      toast({ title: "Pick a league first", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync({ kind, pick });
      toast({ title: "Bonus bet saved" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const filled = KINDS.filter((k) => bets.some((b) => b.kind === k.kind)).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold">Bonus Bets</h3>
          <p className="text-xs text-muted-foreground">Tournament-long predictions</p>
        </div>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">{filled} / {KINDS.length} set</span>
      </div>
      <div className="grid gap-3">
        {KINDS.map((k) => {
          const Icon = k.icon;
          const has = bets.some((b) => b.kind === k.kind);
          return (
            <div key={k.kind} className={`flex items-center gap-3 rounded-xl border p-3 ${has ? "border-border/60 bg-background/50" : "border-dashed border-border/60 bg-background/30"}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${has ? "bg-gradient-trophy shadow-trophy" : "bg-secondary"}`}>
                <Icon className={`h-5 w-5 ${has ? "text-accent-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <Input
                  value={valueFor(k.kind)}
                  onChange={(e) => setDrafts((d) => ({ ...d, [k.kind]: e.target.value }))}
                  placeholder="Your pick..."
                  className="h-8 border-0 bg-transparent px-0 text-sm font-semibold focus-visible:ring-0"
                />
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleSave(k.kind)} className="text-primary">Save</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};