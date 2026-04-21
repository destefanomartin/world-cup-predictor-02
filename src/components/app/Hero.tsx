import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import heroImg from "@/assets/hero-stadium.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
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
            Private league · 12 friends · Season open
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Predict every match.
            <span className="block bg-gradient-pitch bg-clip-text text-transparent">Outsmart your friends.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            The most fun way to follow the FIFA World Cup 2026 with your crew. Score predictions, bonus bets, and a live leaderboard — all automated.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-gradient-pitch text-primary-foreground shadow-glow hover:opacity-90">
              Make Today's Picks
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 bg-card/50 backdrop-blur">
              <Users className="mr-2 h-4 w-4" /> Invite Friends
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/40 pt-8">
            <Stat label="Your rank" value="#3" accent />
            <Stat label="Total points" value="247" />
            <Stat label="Perfects" value="6" />
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