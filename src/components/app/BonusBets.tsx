import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMyBonusBets, useSaveBonusBet } from "@/hooks/useBonusBets";
import { useTeams } from "@/hooks/useTournament";
import type { BonusKind } from "@/lib/database.types";

const KIND_CONFIG: Record<BonusKind, { label: string; emoji: string; placeholder: string; useTeam: boolean }> = {
  top_scorer: { label: "Goleador", emoji: "⚽", placeholder: "Nombre del jugador...", useTeam: false },
  mvp: { label: "Mejor Jugador (MVP)", emoji: "🏆", placeholder: "Nombre del jugador...", useTeam: false },
  best_goalkeeper: { label: "Mejor Arquero", emoji: "🧤", placeholder: "Nombre del jugador...", useTeam: false },
  most_assists: { label: "Más Asistencias", emoji: "🎯", placeholder: "Nombre del jugador...", useTeam: false },
  champion: { label: "Campeón", emoji: "🥇", placeholder: "Nombre del país...", useTeam: true },
  runner_up: { label: "Subcampeón", emoji: "🥈", placeholder: "Nombre del país...", useTeam: true },
};

const KINDS = Object.keys(KIND_CONFIG) as BonusKind[];

const TeamInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
  const { data: teams = [] } = useTeams();
  const [open, setOpen] = useState(false);
  const filtered = value.length > 0
    ? teams.filter((t: any) => t.name.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];
  return (
    <div className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="h-8 border-0 bg-transparent px-0 text-sm font-semibold focus-visible:ring-0"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {filtered.map((t: any) => (
            <button key={t.id} onMouseDown={() => { onChange(t.name); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/20">
              {t.crest && <img src={t.crest} alt="" className="h-4 w-4 object-contain" />}
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const BonusBets = ({ leagueId }: { leagueId: string | null }) => {
  const { data: bets = [] } = useMyBonusBets(leagueId);
  const save = useSaveBonusBet(leagueId);
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const valueFor = (kind: BonusKind) =>
    drafts[kind] ?? bets.find((b) => b.kind === kind)?.pick ?? "";

  const handleSave = async (kind: BonusKind) => {
    const pick = valueFor(kind).trim();
    if (!pick || !leagueId) {
      toast({ title: leagueId ? "Predicción vacía" : "Primero seleccioná una liga", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync({ kind, pick });
      toast({ title: "¡Guardado!" });
    } catch (err) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    }
  };

  const filled = KINDS.filter((k) => bets.some((b) => b.kind === k)).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold">Apuestas Extra</h3>
          <p className="text-xs text-muted-foreground">Predicciones para todo el torneo</p>
        </div>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
          {filled} / {KINDS.length} completadas
        </span>
      </div>
      <div className="grid gap-3">
        {KINDS.map((kind) => {
          const cfg = KIND_CONFIG[kind];
          const has = bets.some((b) => b.kind === kind);
          return (
            <div key={kind} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${has ? "border-border/60 bg-background/50" : "border-dashed border-border/60 bg-background/30"
              }`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl ${has ? "bg-gradient-trophy shadow-trophy" : "bg-secondary"
                }`}>
                {cfg.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">{cfg.label}</p>
                {cfg.useTeam ? (
                  <TeamInput value={valueFor(kind)} onChange={(v) => setDrafts((d) => ({ ...d, [kind]: v }))} placeholder={cfg.placeholder} />
                ) : (
                  <Input value={valueFor(kind)} onChange={(e) => setDrafts((d) => ({ ...d, [kind]: e.target.value }))}
                    placeholder={cfg.placeholder} className="h-8 border-0 bg-transparent px-0 text-sm font-semibold focus-visible:ring-0" />
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleSave(kind)} className="text-primary shrink-0">Guardar</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};