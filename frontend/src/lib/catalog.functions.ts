import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// HU2 — Alta de artistas, álbumes y canciones (admin)
export const crearArtista = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      nombre: z.string().trim().min(1).max(120),
      pais: z.string().trim().min(1).max(80),
      genero_musical: z.string().trim().min(1).max(60),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("artistas").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const crearAlbum = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      titulo: z.string().trim().min(1).max(200),
      anio: z.number().int().min(1900).max(2100),
      artista_id: z.string().uuid(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("albumes").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const crearCancion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      titulo: z.string().trim().min(1).max(200),
      duracion_seg: z.number().int().positive().max(7200),
      album_id: z.string().uuid(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("canciones").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// Listados de catálogo
export const listarArtistas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("artistas").select("*").order("nombre");
    if (error) throw new Error(error.message);
    return data;
  });

export const obtenerArtista = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: artista, error } = await context.supabase
      .from("artistas").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!artista) throw new Error("Artista no encontrado");
    const { data: albumes } = await context.supabase
      .from("albumes").select("*").eq("artista_id", data.id).order("anio", { ascending: false });
    return { artista, albumes: albumes ?? [] };
  });

export const obtenerAlbum = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: album, error } = await context.supabase
      .from("albumes").select("*, artistas(*)").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!album) throw new Error("Album no encontrado");
    const { data: canciones } = await context.supabase
      .from("canciones").select("*").eq("album_id", data.id).order("created_at");
    return { album, canciones: canciones ?? [] };
  });

// HU8 — Búsqueda parcial case-insensitive en canciones, álbumes y artistas
export const buscar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ q: z.string().trim().min(1).max(120) }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const q = `%${data.q}%`;
    const [artistas, albumes, canciones] = await Promise.all([
      context.supabase.from("artistas").select("*").ilike("nombre", q).limit(20),
      context.supabase.from("albumes").select("*, artistas(nombre)").ilike("titulo", q).limit(20),
      context.supabase.from("canciones").select("*, albumes(titulo, artistas(nombre))").ilike("titulo", q).limit(40),
    ]);
    return {
      artistas: artistas.data ?? [],
      albumes: albumes.data ?? [],
      canciones: canciones.data ?? [],
    };
  });
