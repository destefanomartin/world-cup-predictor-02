import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [ready, setReady] = useState(false);

    // Supabase redirige con tokens en el hash. onAuthStateChange detecta
    // el evento PASSWORD_RECOVERY y establece la sesión automáticamente.
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") setReady(true);
        });
        // Si ya hay sesión activa por el link (algunos clientes la setean antes)
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password });
        setSubmitting(false);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "¡Contraseña actualizada!" });
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-background bg-gradient-hero font-sans text-foreground">
            <div className="container flex min-h-screen items-center justify-center py-12">
                <div className="w-full max-w-md rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-elegant">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <h1 className="font-display text-2xl font-bold">Nueva contraseña</h1>
                        <p className="text-sm text-muted-foreground">Elegí una nueva contraseña para tu cuenta</p>
                    </div>

                    {!ready ? (
                        <p className="text-center text-sm text-muted-foreground">Verificando link...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva contraseña</Label>
                                <Input id="new-password" type="password" required minLength={6}
                                    value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                                <Input id="confirm-password" type="password" required minLength={6}
                                    value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Guardando..." : "Guardar nueva contraseña"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;