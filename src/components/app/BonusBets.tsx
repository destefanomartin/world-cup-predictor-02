import { useState, useRef, useEffect } from "react";
import { Award, Footprints, Shield, Star, Trophy, Medal, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMyBonusBets, useSaveBonusBet } from "@/hooks/useBonusBets";
import { useTeams } from "@/hooks/useTournament";
import type { BonusKind } from "@/lib/database.types";

// Solo campeón y subcampeón usan autocomplete de equipos.
// El resto (goleador, MVP, etc.) son texto libre como antes.
const KIND_USES_TEAM: Record<BonusKind, boolean> = {
  top_scorer: false,
  mvp: false,
  best_goalkeeper: false,
  most_assists: false,
  champion: true,
  runner_up: true,
};

const KINDS: { kind: BonusKind; label: string; icon: typeof Star; placeholder: string }[] = [
  { kind: "top_scorer",      label: "Top Scorer",        icon: Star,       placeholder: "Player name..." },
  { kind: "mvp",             label: "Best Player (MVP)", icon: Award,      placeholder: "Player name..." },
  { kind: "best_goalkeeper", label: "Best Goalkeeper",   icon: Shield,     placeholder: "Player name..." },
  { kind: "most_assists",    label: "Most Assists",       icon: Footprints, placeholder: "Player name..." },
  { kind: "champion",        label: "Champion",           icon: Trophy,     placeholder: "Country name..." },
  { kind: "runner_up",       label: "Runner-up",          icon: Medal,      placeholder: "Country name..." },
];

// ─── Autocomplete solo para equipos ────────────────────────────────────────
interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; sublabel?: string }[];
  placeholder?: string;
}

const AutocompleteInput = ({ value, onChange, options, placeholder }: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const filtered = query.trim().length < 1
    ? []
    : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  const handleSelect = (label: string) => {
    setQuery(label);
    onChange(label);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-8 w-full border-0 bg-transparent px-0 text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none"
        />
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[200px] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.label); }}
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent/20 transition-colors"
            >
              <span className="font-semibold">{opt.label}</span>
              {opt.sublabel && <span className="text-xs text-muted-foreground">{opt.sublabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ───────────────────────────────────────────────────
export const BonusBets = ({ leagueId }: { leagueId: string | null }) => {
  const { data: bets = [] } = useMyBonusBets(leagueId) as { data: Array<{ kind: BonusKind; pick: string }> };
  const save = useSaveBonusBet(leagueId);
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data: teams = [] } = useTeams();
  const teamOptions = teams.map((t: any) => ({ label: t.name, sublabel: t.tla ?? undefined }));

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
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
          {filled} / {KINDS.length} set
        </span>
      </div>
      <div className="grid gap-3">
        {KINDS.map((k) => {
          const Icon = k.icon;
          const has = bets.some((b) => b.kind === k.kind);
          const usesTeam = KIND_USES_TEAM[k.kind];

          return (
            <div
              key={k.kind}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                has ? "border-border/60 bg-background/50" : "border-dashed border-border/60 bg-background/30"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${has ? "bg-gradient-trophy shadow-trophy" : "bg-secondary"}`}>
                <Icon className={`h-5 w-5 ${has ? "text-accent-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">{k.label}</p>
                {usesTeam && teamOptions.length > 0 ? (
                  // Equipos: autocomplete
                  <AutocompleteInput
                    value={valueFor(k.kind)}
                    onChange={(val) => setDrafts((d) => ({ ...d, [k.kind]: val }))}
                    options={teamOptions}
                    placeholder={k.placeholder}
                  />
                ) : (
                  // Jugadores: input libre (igual que antes)
                  <Input
                    value={valueFor(k.kind)}
                    onChange={(e) => setDrafts((d) => ({ ...d, [k.kind]: e.target.value }))}
                    placeholder={k.placeholder}
                    className="h-8 border-0 bg-transparent px-0 text-sm font-semibold focus-visible:ring-0"
                  />
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleSave(k.kind)} className="text-primary shrink-0">
                Save
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};