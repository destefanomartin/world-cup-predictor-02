import { useState } from "react";
import { Trophy, Plus, LogIn, Copy } from "lucide-react";
import { Header } from "@/components/app/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMyLeagues, useCreateLeague, useJoinLeague } from "@/hooks/useLeagues";

const Leagues = () => {
  const { data: leagues = [], isLoading } = useMyLeagues();
  const createLeague = useCreateLeague();
  const joinLeague = useJoinLeague();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const l: any = await createLeague.mutateAsync({ name });
      setName("");
      toast({ title: "League created", description: `Invite code: ${l?.invite_code ?? ""}` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinLeague.mutateAsync(code.trim().toUpperCase());
      setCode("");
      toast({ title: "Joined league" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Your Leagues</h1>
          <p className="text-sm text-muted-foreground">Create a private league or join one with an invite code.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={handleCreate} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Create a league</h2>
            </div>
            <div className="space-y-3">
              <Label htmlFor="league-name">League name</Label>
              <Input id="league-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="The Pitch Crew" />
              <Button type="submit" className="w-full" disabled={createLeague.isPending}>Create</Button>
            </div>
          </form>

          <form onSubmit={handleJoin} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center gap-2">
              <LogIn className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Join a league</h2>
            </div>
            <div className="space-y-3">
              <Label htmlFor="invite">Invite code</Label>
              <Input id="invite" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" className="uppercase tracking-widest" />
              <Button type="submit" variant="outline" className="w-full" disabled={joinLeague.isPending}>Join</Button>
            </div>
          </form>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold">Memberships</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : leagues.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't joined any leagues yet.</p>
          ) : (
            <div className="grid gap-3">
              {leagues.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-gradient-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{l.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(l.invite_code);
                      toast({ title: "Copied", description: l.invite_code });
                    }}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-mono"
                  >
                    {l.invite_code} <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leagues;