import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// HU5 — Favoritos
export const toggleFavorito = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ cancion_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from("favoritos").select("cancion_id")
      .eq("usuario_id", context.userId).eq("cancion_id", data.cancion_id).maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("favoritos").delete()
        .eq("usuario_id", context.userId).eq("cancion_id", data.cancion_id);
      if (error) throw new Error(error.message);
      return { favorito: false };
    }
    const { error } = await context.supabase.from("favoritos")
      .insert({ usuario_id: context.userId, cancion_id: data.cancion_id });
    if (error) throw new Error(error.message);
    return { favorito: true };
  });

export const listarFavoritos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("favoritos")
      .select("fecha, canciones(*, albumes(titulo, artistas(id, nombre)))")
      .eq("usuario_id", context.userId).order("fecha", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

// HU6 — Seguir artistas
export const toggleSeguir = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ artista_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from("seguidos").select("artista_id")
      .eq("usuario_id", context.userId).eq("artista_id", data.artista_id).maybeSingle();
    if (existing) {
      const { error } = await context.supabase.from("seguidos").delete()
        .eq("usuario_id", context.userId).eq("artista_id", data.artista_id);
      if (error) throw new Error(error.message);
      return { siguiendo: false };
    }
    const { error } = await context.supabase.from("seguidos")
      .insert({ usuario_id: context.userId, artista_id: data.artista_id });
    if (error) throw new Error(error.message);
    return { siguiendo: true };
  });

export const listarSeguidos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("seguidos")
      .select("fecha, artistas(*)")
      .eq("usuario_id", context.userId).order("fecha", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });
