import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export const useProfile = () => {
    const { user } = useAuth();
    return useQuery({
        enabled: !!user,
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user!.id)
                .single();
            if (error) throw error;
            return data;
        },
    });
};

export const useUpdateAvatar = () => {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            if (!user) throw new Error("Not authenticated");

            const ext = file.name.split(".").pop();
            const path = `${user.id}/avatar.${ext}`;

            // Subir al bucket (upsert)
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            // URL pública
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            // Agregar timestamp para evitar cache
            const url = `${data.publicUrl}?t=${Date.now()}`;

            // Guardar en profiles
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", user.id);
            if (updateError) throw updateError;

            return url;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
    });
};

export const useUpdateDisplayName = () => {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (display_name: string) => {
            if (!user) throw new Error("Not authenticated");
            const { error } = await supabase
                .from("profiles")
                .update({ display_name })
                .eq("id", user.id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
    });
};