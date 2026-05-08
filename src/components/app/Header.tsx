import { Trophy, Bell, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export const Header = () => {
  const { user, signOut } = useAuth();
  const initials = (user?.user_metadata?.display_name || user?.email || "")
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("");

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Actualizamos la URL para que quede lindo sin recargar
      window.history.pushState(null, "", `#${id}`);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-pitch shadow-glow">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-none">Pitch Picks</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mundial 2026</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#dashboard" onClick={(e) => scrollTo(e, 'dashboard')} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary cursor-pointer">Inicio</a>
          <a href="#predictions" onClick={(e) => scrollTo(e, 'predictions')} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary cursor-pointer">Pronósticos</a>
          <a href="#leaderboard" onClick={(e) => scrollTo(e, 'leaderboard')} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary cursor-pointer">Ranking</a>
          <Link to="/leagues" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary cursor-pointer">Mis Ligas</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link to="/leagues" aria-label="Ligas"><Users className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>
          {user && (
            <>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold md:flex">
                {initials || "P"}
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Cerrar sesión">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};