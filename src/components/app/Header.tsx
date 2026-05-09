import { Link, useLocation } from "react-router-dom";
import { Trophy, BarChart3, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navLink = (to: string, label: string, Icon: typeof Trophy) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-display font-bold">Pitch Picks</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLink("/", "Predictions", Trophy)}
            {navLink("/tournament", "Tournament", BarChart3)}
            {navLink("/leagues", "Leagues", Users)}
          </nav>
        )}

        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:block">
              {user.email?.split("@")[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="h-8 gap-1.5 text-xs">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};