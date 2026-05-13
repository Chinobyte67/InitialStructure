import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VALID = 0.3;

// HU7 — Registrar reproducción
export const registrarReproduccion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      cancion_id: z.string().uuid(),
      segundos_escuchados: z.number().int().nonnegative().max(7200),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { data: c, error: ce } = await context.supabase
      .from("canciones").select("duracion_seg").eq("id", data.cancion_id).maybeSingle();
    if (ce) throw new Error(ce.message);
    if (!c) throw new Error("Canción no encontrada");
    const seg = Math.min(data.segundos_escuchados, c.duracion_seg);
    const { error } = await context.supabase.from("reproducciones").insert({
      usuario_id: context.userId,
      cancion_id: data.cancion_id,
      segundos_escuchados: seg,
    });
    if (error) throw new Error(error.message);
    const valida = seg / c.duracion_seg >= VALID;
    return { ok: true, valida };
  });

// HU9 — Top canciones / artistas (del usuario)
export const topCanciones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ limit: z.number().int().min(1).max(50).default(10) }).parse(i ?? {}))
  .handler(async ({ data, context }) => {
    const { data: reps } = await context.supabase
      .from("reproducciones").select("cancion_id, segundos_escuchados, canciones(duracion_seg, titulo, albumes(titulo, artistas(id, nombre)))")
      .eq("usuario_id", context.userId);
    const counts = new Map<string, { plays: number; cancion: any }>();
    for (const r of reps ?? []) {
      const dur = (r as any).canciones?.duracion_seg;
      if (!dur || r.segundos_escuchados / dur < VALID) continue;
      const cur = counts.get(r.cancion_id);
      if (cur) cur.plays++;
      else counts.set(r.cancion_id, { plays: 1, cancion: (r as any).canciones });
    }
    return [...counts.entries()]
      .map(([cancion_id, v]) => ({ cancion_id, ...v }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, data.limit);
  });

export const topArtistas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ limit: z.number().int().min(1).max(50).default(10) }).parse(i ?? {}))
  .handler(async ({ data, context }) => {
    const { data: reps } = await context.supabase
      .from("reproducciones").select("segundos_escuchados, canciones(duracion_seg, albumes(artistas(id, nombre, genero_musical)))")
      .eq("usuario_id", context.userId);
    const counts = new Map<string, { plays: number; artista: any }>();
    for (const r of reps ?? []) {
      const a = (r as any).canciones?.albumes?.artistas;
      const dur = (r as any).canciones?.duracion_seg;
      if (!a || !dur || r.segundos_escuchados / dur < VALID) continue;
      const cur = counts.get(a.id);
      if (cur) cur.plays++;
      else counts.set(a.id, { plays: 1, artista: a });
    }
    return [...counts.values()].sort((a, b) => b.plays - a.plays).slice(0, data.limit);
  });

// HU12 — Recomendaciones por géneros
export const recomendaciones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: reps } = await context.supabase
      .from("reproducciones").select("cancion_id, fecha, segundos_escuchados, canciones(duracion_seg, albumes(artistas(genero_musical)))")
      .eq("usuario_id", context.userId);
    const validas = (reps ?? []).filter((r: any) =>
      r.canciones && r.segundos_escuchados / r.canciones.duracion_seg >= VALID
    );
    const recientes = new Set(
      (reps ?? []).filter((r: any) => Date.now() - new Date(r.fecha).getTime() < 30 * 86400000)
        .map((r: any) => r.cancion_id)
    );
    if (validas.length < 5) {
      const { data } = await context.supabase
        .from("canciones").select("*, albumes(titulo, artistas(id, nombre, genero_musical))").limit(20);
      return (data ?? []).filter((c: any) => !recientes.has(c.id)).slice(0, 10);
    }
    const generoCount = new Map<string, number>();
    for (const r of validas) {
      const g = (r as any).canciones?.albumes?.artistas?.genero_musical;
      if (g) generoCount.set(g, (generoCount.get(g) ?? 0) + 1);
    }
    const topG = [...generoCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
    const { data } = await context.supabase
      .from("canciones")
      .select("*, albumes!inner(titulo, artistas!inner(id, nombre, genero_musical))")
      .in("albumes.artistas.genero_musical", topG)
      .limit(40);
    return (data ?? []).filter((c: any) => !recientes.has(c.id)).slice(0, 10);
  });

// HU13 — Wrapped por año
export const wrappedAnio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ anio: z.number().int().min(2000).max(2100) }).parse(i))
  .handler(async ({ data, context }) => {
    const start = new Date(data.anio, 0, 1).toISOString();
    const end = new Date(data.anio + 1, 0, 1).toISOString();
    const { data: reps } = await context.supabase
      .from("reproducciones")
      .select("cancion_id, segundos_escuchados, canciones(duracion_seg, titulo, albumes(titulo, artistas(id, nombre, genero_musical)))")
      .eq("usuario_id", context.userId)
      .gte("fecha", start).lt("fecha", end);
    if (!reps || reps.length === 0) {
      throw new Error("404: Sin reproducciones en " + data.anio);
    }
    const validas = reps.filter((r: any) => r.canciones && r.segundos_escuchados / r.canciones.duracion_seg >= VALID);
    const minutos = Math.floor(reps.reduce((a, r) => a + r.segundos_escuchados, 0) / 60);
    const cancMap = new Map<string, { plays: number; data: any }>();
    const artMap = new Map<string, { plays: number; data: any }>();
    const genMap = new Map<string, number>();
    for (const r of validas as any[]) {
      const cur = cancMap.get(r.cancion_id);
      if (cur) cur.plays++;
      else cancMap.set(r.cancion_id, { plays: 1, data: r.canciones });
      const a = r.canciones?.albumes?.artistas;
      if (a) {
        const ca = artMap.get(a.id);
        if (ca) ca.plays++;
        else artMap.set(a.id, { plays: 1, data: a });
        genMap.set(a.genero_musical, (genMap.get(a.genero_musical) ?? 0) + 1);
      }
    }
    return {
      anio: data.anio,
      minutos_totales: minutos,
      canciones_distintas: cancMap.size,
      top_canciones: [...cancMap.entries()].sort((a, b) => b[1].plays - a[1].plays).slice(0, 5),
      top_artistas: [...artMap.values()].sort((a, b) => b.plays - a.plays).slice(0, 5),
      top_generos: [...genMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genero, plays]) => ({ genero, plays })),
    };
  });

// HU14 — Estadísticas por canción
export const estadisticasCancion = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      id: z.string().uuid(),
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const { data: c } = await context.supabase
      .from("canciones").select("id, titulo, duracion_seg").eq("id", data.id).maybeSingle();
    if (!c) throw new Error("Canción no encontrada");
    let q = context.supabase.from("reproducciones").select("segundos_escuchados, fecha").eq("cancion_id", data.id);
    if (data.desde) q = q.gte("fecha", data.desde);
    if (data.hasta) q = q.lte("fecha", data.hasta);
    const { data: reps, error } = await q;
    if (error) throw new Error(error.message);
    if (!reps || reps.length === 0) {
      return { cancion: c, reproducciones: 0, validas: 0, porcentaje_promedio: 0 };
    }
    const validas = reps.filter((r) => r.segundos_escuchados / c.duracion_seg >= VALID).length;
    const pct = reps.reduce((a, r) => a + (r.segundos_escuchados / c.duracion_seg), 0) / reps.length * 100;
    return { cancion: c, reproducciones: reps.length, validas, porcentaje_promedio: Number(pct.toFixed(2)) };
  });
