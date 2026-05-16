import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Trophy, Camera } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Avatar en registro
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Máximo 2MB", variant: "destructive" }); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
    else navigate("/");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(email, password, displayName);
    if (error) {
      setSubmitting(false);
      toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
      return;
    }
    if (avatarFile) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      const uid = signInData.user?.id;
      if (uid) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${uid}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", uid);
        }
        setSubmitting(false);
        navigate("/");
        return;
      }
    }
    setSubmitting(false);
    toast({ title: "¡Cuenta creada!", description: "Revisá tu email para confirmar y luego iniciá sesión." });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Error al enviar", description: error.message, variant: "destructive" }); return; }
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-hero font-sans text-foreground">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-elegant">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold">PRODE 2026</h1>
            <p className="text-sm text-muted-foreground">Predecí el Mundial con tus amigos</p>
          </div>

          {/* ── Forgot password ── */}
          {showForgot ? (
            <div className="space-y-4">
              <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-xs text-muted-foreground hover:text-foreground">← Volver al inicio de sesión</button>
              <h2 className="font-display text-lg font-bold">Restablecer contraseña</h2>
              {forgotSent ? (
                <p className="text-sm text-muted-foreground">Revisá tu email — te enviamos un link para restablecer tu contraseña.</p>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input id="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar link"}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                  <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true); }} className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                  <div className="flex flex-col items-center gap-2 py-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-border/60 bg-secondary transition-all hover:border-primary/60">
                      {avatarPreview
                        ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center"><Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" /></div>}
                      {avatarPreview && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </button>
                    <p className="text-[11px] text-muted-foreground">{avatarPreview ? "Clic para cambiar" : "Agregar foto de perfil (opcional)"}</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de usuario</Label>
                    <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Correo electrónico</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Contraseña</Label>
                    <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;