import { Trophy, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-pitch shadow-glow">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-none">Pitch Picks</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">World Cup 2026</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#dashboard" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">Dashboard</a>
          <a href="#predictions" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">Predictions</a>
          <a href="#leaderboard" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">Leaderboard</a>
          <a href="#bonus" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">Bonus Bets</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold md:flex">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};