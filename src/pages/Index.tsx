import { Header } from "@/components/app/Header";
import { Hero } from "@/components/app/Hero";
import { MatchCard, type Match } from "@/components/app/MatchCard";
import { Leaderboard } from "@/components/app/Leaderboard";
import { BonusBets } from "@/components/app/BonusBets";
import { CalendarDays, Flame } from "lucide-react";

const upcoming: Match[] = [
  { id: "1", home: { name: "USA", flag: "🇺🇸" }, away: { name: "Mexico", flag: "🇲🇽" }, kickoff: "Today · 20:00", stage: "Group A", group: "MD 1" },
  { id: "2", home: { name: "Argentina", flag: "🇦🇷" }, away: { name: "Brazil", flag: "🇧🇷" }, kickoff: "Tomorrow · 18:30", stage: "Group C", group: "MD 1", prediction: { home: 2, away: 1 } },
  { id: "3", home: { name: "France", flag: "🇫🇷" }, away: { name: "Germany", flag: "🇩🇪" }, kickoff: "Jun 14 · 21:00", stage: "Group D", group: "MD 1" },
];

const recent: Match[] = [
  { id: "4", home: { name: "Spain", flag: "🇪🇸" }, away: { name: "Italy", flag: "🇮🇹" }, kickoff: "Yesterday", stage: "Group B", group: "MD 1", locked: true, result: { home: 2, away: 1 }, prediction: { home: 2, away: 1 } },
  { id: "5", home: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, away: { name: "Portugal", flag: "🇵🇹" }, kickoff: "Yesterday", stage: "Group F", group: "MD 1", locked: true, result: { home: 1, away: 1 }, prediction: { home: 2, away: 1 } },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main>
        <Hero />

        <section id="predictions" className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Flame className="h-3.5 w-3.5" /> Live Now
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Upcoming Matches</h2>
              <p className="mt-1 text-sm text-muted-foreground">Lock in your predictions before kickoff.</p>
            </div>
            <a href="#" className="hidden text-sm font-medium text-primary hover:underline md:inline">See full schedule →</a>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>

        <section id="dashboard" className="container grid gap-8 pb-16 lg:grid-cols-[1.4fr_1fr]">
          <div id="leaderboard">
            <Leaderboard />
          </div>
          <div className="space-y-6">
            <div id="bonus">
              <BonusBets />
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-bold">Yesterday's Results</h3>
              </div>
              <div className="space-y-3">
                {recent.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-background/40 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{m.home.flag}</span>
                      <span className="font-medium">{m.home.name}</span>
                      <span className="font-display font-bold text-foreground">{m.result?.home} - {m.result?.away}</span>
                      <span className="font-medium">{m.away.name}</span>
                      <span>{m.away.flag}</span>
                    </div>
                    <span className={`text-xs font-semibold ${m.result?.home === m.prediction?.home && m.result?.away === m.prediction?.away ? "text-accent" : "text-muted-foreground"}`}>
                      {m.result?.home === m.prediction?.home && m.result?.away === m.prediction?.away ? "+5 perfect" : "+0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          <p>Pitch Picks · Built for friends · World Cup 2026</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
