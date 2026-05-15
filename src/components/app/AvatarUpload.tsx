import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateAvatar, useUpdateDisplayName } from "@/hooks/useProfile";

export const AvatarUpload = () => {
    const { data: profile } = useProfile();
    const updateAvatar = useUpdateAvatar();
    const updateName = useUpdateDisplayName();
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameVal, setNameVal] = useState("");

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Max 2MB", variant: "destructive" });
            return;
        }
        try {
            await updateAvatar.mutateAsync(file);
            toast({ title: "Avatar updated" });
        } catch (err) {
            toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
        }
    };

    const handleNameSave = async () => {
        if (!nameVal.trim()) return;
        try {
            await updateName.mutateAsync(nameVal.trim());
            setEditingName(false);
            toast({ title: "Name updated" });
        } catch (err) {
            toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
                <button
                    onClick={() => inputRef.current?.click()}
                    className="group relative h-14 w-14 overflow-hidden rounded-full border-2 border-border/60 bg-secondary transition-all hover:border-primary/60"
                >
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                            {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {updateAvatar.isPending
                            ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                            : <Camera className="h-4 w-4 text-white" />}
                    </div>
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFile}
                    className="hidden"
                />
            </div>

            {/* Nombre */}
            <div className="min-w-0">
                {editingName ? (
                    <div className="flex items-center gap-2">
                        <input
                            autoFocus
                            value={nameVal}
                            onChange={(e) => setNameVal(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                            className="h-8 rounded-lg border border-border/60 bg-background px-2 text-sm font-semibold focus:outline-none focus:border-primary"
                        />
                        <button onClick={handleNameSave} className="text-xs text-primary font-semibold">Save</button>
                        <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={() => { setNameVal(profile?.display_name ?? ""); setEditingName(true); }}
                        className="text-left hover:text-primary transition-colors"
                    >
                        <p className="font-semibold text-sm">{profile?.display_name ?? "—"}</p>
                        <p className="text-[11px] text-muted-foreground">Click to edit name</p>
                    </button>
                )}
            </div>
        </div>
    );
};