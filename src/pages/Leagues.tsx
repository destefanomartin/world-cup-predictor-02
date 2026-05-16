import { useRef, useState } from "react";
import { Plus, LogIn, Copy, Camera } from "lucide-react";
import { Header } from "@/components/app/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMyLeagues, useCreateLeague, useJoinLeague } from "@/hooks/useLeagues";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";

const DEFAULT_EMOJIS = ["⚽", "🏆", "🌍", "🎯", "🔥", "⭐"];

const LeagueAvatar = ({ imageUrl, name }: { imageUrl?: string | null; name: string }) => {
  const emoji = DEFAULT_EMOJIS[name.charCodeAt(0) % DEFAULT_EMOJIS.length];
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-primary/15">
      {imageUrl
        ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        : <span className="text-xl">{emoji}</span>}
    </div>
  );
};

const Leagues = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: leagues = [], isLoading } = useMyLeagues();
  const createLeague = useCreateLeague();
  const joinLeague = useJoinLeague();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const newImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const handleNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Máximo 2MB", variant: "destructive" }); return; }
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const uploadLeagueImage = async (leagueId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${leagueId}/cover.${ext}`;
    const { error } = await supabase.storage.from("leagues").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("leagues").getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const l: any = await createLeague.mutateAsync({ name });
      if (newImageFile && l?.id) {
        const url = await uploadLeagueImage(l.id, newImageFile);
        if (url) {
          await supabase.from("leagues").update({ image_url: url }).eq("id", l.id);
          qc.invalidateQueries({ queryKey: ["leagues", user?.id] });
        }
      }
      setName(""); setNewImageFile(null); setNewImagePreview(null);
      toast({ title: "Liga creada", description: `Código: ${l?.invite_code ?? ""}` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinLeague.mutateAsync(code.trim().toUpperCase());
      setCode("");
      toast({ title: "Te uniste a la liga" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLeagueId) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Máximo 2MB", variant: "destructive" }); return; }
    setUploadingFor(editingLeagueId);
    const url = await uploadLeagueImage(editingLeagueId, file);
    if (url) {
      await supabase.from("leagues").update({ image_url: url }).eq("id", editingLeagueId);
      qc.invalidateQueries({ queryKey: ["leagues", user?.id] });
      toast({ title: "Foto actualizada" });
    }
    setUploadingFor(null);
    setEditingLeagueId(null);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Tus ligas</h1>
          <p className="text-sm text-muted-foreground">Creá una liga privada o unite con un código.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Crear liga */}
          <form onSubmit={handleCreate} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Crear liga</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => newImageRef.current?.click()}
                  className="group relative h-16 w-16 overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-secondary transition-all hover:border-primary/60 flex items-center justify-center">
                  {newImagePreview
                    ? <img src={newImagePreview} alt="" className="h-full w-full object-cover" />
                    : <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
                  {newImagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  {newImagePreview ? "Click para cambiar" : "Foto opcional"}
                </p>
                <input ref={newImageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleNewImage} className="hidden" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="league-name">Nombre de la liga</Label>
                <Input id="league-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Los pibes del trabajo" />
              </div>
              <Button type="submit" className="w-full" disabled={createLeague.isPending}>
                {createLeague.isPending ? "Creando..." : "Crear liga"}
              </Button>
            </div>
          </form>

          {/* Unirse */}
          <form onSubmit={handleJoin} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center gap-2">
              <LogIn className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Unirse a una liga</h2>
            </div>
            <div className="space-y-3">
              <Label htmlFor="invite">Código de invitación</Label>
              <Input id="invite" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" className="uppercase tracking-widest" />
              <Button type="submit" variant="outline" className="w-full" disabled={joinLeague.isPending}>
                {joinLeague.isPending ? "Uniéndose..." : "Unirse"}
              </Button>
            </div>
          </form>
        </div>

        {/* Lista */}
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold">Mis ligas</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : leagues.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no te uniste a ninguna liga.</p>
          ) : (
            <div className="grid gap-3">
              {leagues.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-gradient-card p-4">
                  <div className="flex items-center gap-3">
                    <button type="button" title="Cambiar foto"
                      onClick={() => { setEditingLeagueId(l.id); editImageRef.current?.click(); }}
                      className="group relative">
                      <LeagueAvatar imageUrl={l.image_url} name={l.name} />
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {uploadingFor === l.id
                          ? <span className="text-[9px] text-white">...</span>
                          : <Camera className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </button>
                    <div>
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {l.role === "admin" ? "Admin" : "Miembro"}
                      </p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => { navigator.clipboard.writeText(l.invite_code); toast({ title: "Copiado", description: l.invite_code }); }}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-mono">
                    {l.invite_code} <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <input ref={editImageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleEditImage} className="hidden" />
      </main>
    </div>
  );
};

export default Leagues;