import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-stadium.jpg";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/providers/AuthProvider";

export const Hero = ({ leagueId }: { leagueId: string | null }) => {
  const { user } = useAuth();
  // Traemos la tabla de posiciones de la liga actual
  const { data: leaderboard = [] } = useLeaderboard(leagueId);

  // Buscamos las estadísticas específicas del usuario logueado
  const myStats = leaderboard.find((p: any) => p.user_id === user?.id);
  
  // Calculamos el ranking, puntos y plenos reales
  const myRank = myStats ? leaderboard.findIndex((p: any) => p.user_id === user?.id) + 1 : "-";
  const myPoints = myStats ? myStats.total_points : 0;
  const myPerfects = myStats ? myStats.perfects : 0;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Estadio del Mundial 2026"
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
            Prode Oficial · Temporada Abierta
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Pronosticá cada partido.
            <span className="block bg-gradient-pitch bg-clip-text text-transparent">Ganale a tus amigos.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            La forma más divertida de vivir el Mundial 2026. Cargá tus pronósticos, pegale a los resultados exactos y subí en el ranking en vivo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-pitch text-primary-foreground shadow-glow hover:opacity-90">
              <a href="#predictions">Cargar Pronósticos</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/50 backdrop-blur">
              <Link to="/leagues"><Users className="mr-2 h-4 w-4" /> Invitar Amigos</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/40 pt-8">
            <Stat label="Tu Posición" value={myRank !== "-" ? `#${myRank}` : "-"} accent />
            <Stat label="Puntos Totales" value={myPoints.toString()} />
            <Stat label="Plenos" value={myPerfects.toString()} />
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="text-center">
    <p className={`font-display text-3xl font-bold md:text-4xl ${accent ? "bg-gradient-trophy bg-clip-text text-transparent" : "text-foreground"}`}>
      {value}
    </p>
    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);