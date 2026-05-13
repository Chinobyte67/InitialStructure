import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// HU3 — Crear playlist
export const crearPlaylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      nombre: z.string().trim().min(1).max(120),
      es_publica: z.boolean().default(false),
      colaborativa: z.boolean().default(false),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    // Validar nombre único por usuario
    const { data: dupe } = await context.supabase
      .from("playlists").select("id").eq("usuario_id", context.userId).ilike("nombre", data.nombre).maybeSingle();
    if (dupe) throw new Error("Ya tenés una playlist con ese nombre");
    const { data: row, error } = await context.supabase
      .from("playlists")
      .insert({ ...data, usuario_id: context.userId })
      .select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const renombrarPlaylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), nombre: z.string().trim().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: dupe } = await context.supabase
      .from("playlists").select("id").eq("usuario_id", context.userId)
      .ilike("nombre", data.nombre).neq("id", data.id).maybeSingle();
    if (dupe) throw new Error("Ya tenés otra playlist con ese nombre");
    const { error } = await context.supabase.from("playlists")
      .update({ nombre: data.nombre }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const eliminarPlaylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cambiarVisibilidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), es_publica: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlists")
      .update({ es_publica: data.es_publica }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// HU11 — Colaborativas
export const cambiarColaborativa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), colaborativa: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlists")
      .update({ colaborativa: data.colaborativa }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const agregarColaborador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ playlist_id: z.string().uuid(), usuario_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlist_colaboradores")
      .insert({ playlist_id: data.playlist_id, usuario_id: data.usuario_id });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const quitarColaborador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ playlist_id: z.string().uuid(), usuario_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlist_colaboradores")
      .delete().eq("playlist_id", data.playlist_id).eq("usuario_id", data.usuario_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// HU4 — Agregar/quitar canciones
export const agregarCancion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ playlist_id: z.string().uuid(), cancion_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: dupe } = await context.supabase
      .from("playlist_canciones").select("cancion_id")
      .eq("playlist_id", data.playlist_id).eq("cancion_id", data.cancion_id).maybeSingle();
    if (dupe) throw new Error("Esa canción ya está en la playlist");
    const { count } = await context.supabase.from("playlist_canciones")
      .select("*", { count: "exact", head: true }).eq("playlist_id", data.playlist_id);
    const { error } = await context.supabase.from("playlist_canciones").insert({
      playlist_id: data.playlist_id,
      cancion_id: data.cancion_id,
      orden: (count ?? 0) + 1,
      agregada_por: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const quitarCancion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ playlist_id: z.string().uuid(), cancion_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("playlist_canciones").delete()
      .eq("playlist_id", data.playlist_id).eq("cancion_id", data.cancion_id);
    if (error) throw new Error(error.message);
    // Reordenar
    const { data: rest } = await context.supabase.from("playlist_canciones")
      .select("cancion_id, orden").eq("playlist_id", data.playlist_id).order("orden");
    if (rest) {
      for (let i = 0; i < rest.length; i++) {
        if (rest[i].orden !== i + 1) {
          await context.supabase.from("playlist_canciones")
            .update({ orden: i + 1 })
            .eq("playlist_id", data.playlist_id)
            .eq("cancion_id", rest[i].cancion_id);
        }
      }
    }
    return { ok: true };
  });

// Listar mis playlists + visibles
export const listarPlaylists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("playlists").select("*").order("fecha_creacion", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

// HU10 — Detalle de playlist con duración total
export const obtenerPlaylist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: pl, error } = await context.supabase
      .from("playlists").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!pl) throw new Error("Playlist no encontrada");
    const { data: tracks } = await context.supabase
      .from("playlist_canciones")
      .select("orden, fecha_agregada, canciones(*, albumes(titulo, artistas(id, nombre)))")
      .eq("playlist_id", data.id).order("orden");
    const total_seg = (tracks ?? []).reduce(
      (acc, t: any) => acc + (t.canciones?.duracion_seg ?? 0), 0
    );
    const { data: colabs } = await context.supabase
      .from("playlist_colaboradores").select("usuario_id").eq("playlist_id", data.id);
    return { playlist: pl, tracks: tracks ?? [], total_seg, colaboradores: (colabs ?? []).map(c => c.usuario_id) };
  });
