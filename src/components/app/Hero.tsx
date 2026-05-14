import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImg from "@/assets/hero-stadium.jpg";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/providers/AuthProvider";

interface HeroProps {
  leagueId: string | null;
  leagues: { id: string; name: string }[];
  onLeagueChange: (id: string) => void;
}

export const Hero = ({ leagueId, leagues, onLeagueChange }: HeroProps) => {
  const { user } = useAuth();
  const { data: rows = [] } = useLeaderboard(leagueId);

  const myRow    = rows.find((r) => r.user_id === user?.id);
  const myRank   = myRow ? rows.indexOf(myRow) + 1 : null;
  const rank     = myRank != null ? `#${myRank}` : "–";
  const points   = myRow?.total_points != null ? String(myRow.total_points) : "0";
  const perfects = myRow?.perfects     != null ? String(myRow.perfects)     : "0";

  return (
    <section
      className="relative"
      // SIN overflow-hidden para que el Select dropdown no quede cortado.
      // El recorte visual del fondo lo maneja el pseudo-elemento de abajo.
    >
      {/* Fondo — posición absoluta, no afecta al dropdown */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroImg}
          alt="World Cup 2026 stadium at golden hour"
          width={1920}
          height={1024}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Private league · {rows.length} players · Season open
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Predict every match.
            <span className="block bg-gradient-pitch bg-clip-text text-transparent">
              Outsmart your friends.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            The most fun way to follow the FIFA World Cup 2026 with your crew.
            Score predictions, bonus bets, and a live leaderboard — all automated.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-gradient-pitch text-primary-foreground shadow-glow hover:opacity-90"
              onClick={() => document.getElementById("predictions")?.scrollIntoView({ behavior: "smooth" })}
            >
              Make Today's Picks
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/60 bg-card/50 backdrop-blur"
              onClick={() => document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Users className="mr-2 h-4 w-4" /> See Leaderboard
            </Button>
          </div>

          {/* Stats + selector de liga */}
          <div className="mt-12 border-t border-border/40 pt-8">
            {/* Selector de liga — solo si hay más de una */}
            {leagues.length > 1 && (
              <div className="mb-6 flex items-center justify-center gap-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Liga:</span>
                {/* z-50 y position relative para que el dropdown se renderice por encima de todo */}
                <div className="relative z-50">
                  <Select value={leagueId ?? undefined} onValueChange={onLeagueChange}>
                    <SelectTrigger className="w-48 bg-card/60 backdrop-blur border-border/60 text-sm">
                      <SelectValue placeholder="Seleccioná una liga" />
                    </SelectTrigger>
                    <SelectContent
                      // portal=true por defecto en shadcn, lo dejamos así para que
                      // se monte fuera del DOM del Hero y evite el overflow-hidden
                      position="popper"
                      sideOffset={6}
                    >
                      {leagues.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              <Stat label="Tu posición"    value={rank}     accent />
              <Stat label="Puntos totales" value={points}   />
              <Stat label="Plenos"         value={perfects} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="text-center">
    <p
      className={`font-display text-3xl font-bold md:text-4xl ${
        accent ? "bg-gradient-trophy bg-clip-text text-transparent" : "text-foreground"
      }`}
    >
      {value}
    </p>
    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);