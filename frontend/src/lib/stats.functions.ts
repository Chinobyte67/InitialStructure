
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/lib/api";

const VALID = 0.3;

// HU7 — Registrar reproducción
export const registrarReproduccion = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      usuario_id: z.number().int(),
      cancion_id: z.number().int(),
      segundos_escuchados: z.number().int().nonnegative().max(7200),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const c = await api.canciones.obtener(data.cancion_id);
    if (!c) throw new Error("Canción no encontrada");
    const seg = Math.min(data.segundos_escuchados, c.duracion_seg);
    await api.reproducciones.crear({ usuario_id: data.usuario_id, cancion_id: data.cancion_id, segundos_escuchados: seg });
    const valida = seg / c.duracion_seg >= VALID;
    return { ok: true, valida };
  });

// HU9 — Top canciones / artistas (del usuario)
export const topCanciones = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ limit: z.number().int().min(1).max(50).default(10), usuario_id: z.number().int() }).parse(i ?? {}))
  .handler(async ({ data }) => {
    const reps = await api.reproducciones.listar();
    const userReps = (reps ?? []).filter((r: any) => r.usuario_id === data.usuario_id);
    const counts = new Map<number, { plays: number; cancion: any }>();
    for (const r of userReps) {
      const cancion = await api.canciones.obtener(r.cancion_id);
      const dur = cancion?.duracion_seg;
      if (!dur || r.segundos_escuchados / dur < VALID) continue;
      const cur = counts.get(r.cancion_id);
      if (cur) cur.plays++;
      else counts.set(r.cancion_id, { plays: 1, cancion });
    }
    return [...counts.entries()]
      .map(([cancion_id, v]) => ({ cancion_id, ...v }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, data.limit);
  });

export const topArtistas = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ limit: z.number().int().min(1).max(50).default(10), usuario_id: z.number().int() }).parse(i ?? {}))
  .handler(async ({ data }) => {
    const reps = await api.reproducciones.listar();
    const userReps = (reps ?? []).filter((r: any) => r.usuario_id === data.usuario_id);
    const counts = new Map<number, { plays: number; artista: any }>();
    for (const r of userReps) {
      const cancion = await api.canciones.obtener(r.cancion_id).catch(() => null);
      if (!cancion) continue;
      const album = await api.albumes.obtener(cancion.album_id).catch(() => null);
      const artista = album ? await api.artistas.obtener(album.artista_id).catch(() => null) : null;
      const dur = cancion.duracion_seg;
      if (!artista || !dur || r.segundos_escuchados / dur < VALID) continue;
      const cur = counts.get(artista.id);
      if (cur) cur.plays++;
      else counts.set(artista.id, { plays: 1, artista });
    }
    return [...counts.values()].sort((a, b) => b.plays - a.plays).slice(0, data.limit);
  });

// HU12 — Recomendaciones por géneros
export const recomendaciones = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const reps = await api.reproducciones.listar();
    const userReps = (reps ?? []).filter((r: any) => r.usuario_id === data.usuario_id);
    const validas = [] as any[];
    const recientes = new Set<number>();
    for (const r of userReps) {
      const c = await api.canciones.obtener(r.cancion_id).catch(() => null);
      let artista: any = null;
      if (c) {
        const album = await api.albumes.obtener(c.album_id).catch(() => null);
        artista = album ? await api.artistas.obtener(album.artista_id).catch(() => null) : null;
      }
      if (c && r.segundos_escuchados / c.duracion_seg >= VALID) validas.push({ ...r, cancion: c, artista });
      if (Date.now() - new Date(r.fecha).getTime() < 30 * 86400000) recientes.add(r.cancion_id);
    }
    if (validas.length < 5) {
      const all = await api.canciones.listarAll();
      return (all ?? []).filter((c: any) => !recientes.has(c.id)).slice(0, 10);
    }
    const generoCount = new Map<string, number>();
    for (const r of validas) {
      const artista = r.artista ?? null;
      const g = artista?.genero_musical || artista?.genero || null;
      if (g) generoCount.set(g, (generoCount.get(g) ?? 0) + 1);
    }
    const topG = [...generoCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
    const candidates = (await api.canciones.listarAll()) ?? [];
    const filtered: any[] = [];
    for (const c of candidates) {
      if (recientes.has(c.id)) continue;
      const album = await api.albumes.obtener(c.album_id).catch(() => null);
      const artista = album ? await api.artistas.obtener(album.artista_id).catch(() => null) : null;
      const genero = artista?.genero_musical || artista?.genero || null;
      if (genero && topG.includes(genero)) {
        filtered.push(c);
        if (filtered.length >= 10) break;
      }
    }
    return filtered;
  });

// HU13 — Wrapped por año
export const wrappedAnio = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ anio: z.number().int().min(2000).max(2100), usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const start = new Date(data.anio, 0, 1).toISOString();
    const end = new Date(data.anio + 1, 0, 1).toISOString();
    const reps = await api.reproducciones.listar();
    const userReps = (reps ?? []).filter((r: any) => r.usuario_id === data.usuario_id && new Date(r.fecha) >= new Date(start) && new Date(r.fecha) < new Date(end));
    if (!userReps || userReps.length === 0) {
      throw new Error("404: Sin reproducciones en " + data.anio);
    }
    const validas: any[] = [];
    let totalSeconds = 0;
    const cancMap = new Map<number, { plays: number; data: any }>();
    const artMap = new Map<number, { plays: number; data: any }>();
    const genMap = new Map<string, number>();
    for (const r of userReps) {
      const c = await api.canciones.obtener(r.cancion_id).catch(() => null);
      if (!c) continue;
      totalSeconds += r.segundos_escuchados;
      if (r.segundos_escuchados / c.duracion_seg >= VALID) {
        validas.push({ ...r, cancion: c });
        const cur = cancMap.get(r.cancion_id);
        if (cur) cur.plays++;
        else cancMap.set(r.cancion_id, { plays: 1, data: c });
        // artista: need to fetch album -> artista
        const album = await api.albumes.obtener(c.album_id).catch(() => null);
        const artista = album ? await api.artistas.obtener(album.artista_id).catch(() => null) : null;
        if (artista) {
          const ca = artMap.get(artista.id);
          if (ca) ca.plays++;
          else artMap.set(artista.id, { plays: 1, data: artista });
          genMap.set(artista.genero || artista.genero_musical || 'unknown', (genMap.get(artista.genero || artista.genero_musical || 'unknown') ?? 0) + 1);
        }
      }
    }
    const minutos = Math.floor(totalSeconds / 60);
    return {
      anio: data.anio,
      minutos_totales: minutos,
      canciones_distintas: cancMap.size,
      top_canciones: [...cancMap.entries()]
        .sort((a, b) => b[1].plays - a[1].plays)
        .slice(0, 5)
        .map(([cancion_id, value]) => ({
          cancion_id,
          plays: value.plays,
          cancion: value.data,
        })),
      top_artistas: [...artMap.values()]
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 5)
        .map((value) => ({
          plays: value.plays,
          artista: value.data,
        })),
      top_generos: [...genMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genero, plays]) => ({ genero, plays })),
    };
  });

// HU14 — Estadísticas por canción
export const estadisticasCancion = createServerFn({ method: "GET" })
  .inputValidator((i) =>
    z.object({
      id: z.number().int(),
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const c = await api.canciones.obtener(data.id);
    if (!c) throw new Error("Canción no encontrada");
    const reps = await api.reproducciones.listar();
    let filtered = (reps ?? []).filter((r: any) => r.cancion_id === data.id);
    if (data.desde) filtered = filtered.filter((r: any) => new Date(r.fecha) >= new Date(String(data.desde)));
    if (data.hasta) filtered = filtered.filter((r: any) => new Date(r.fecha) <= new Date(String(data.hasta)));

    if (!filtered || filtered.length === 0) return { cancion: c, reproducciones: 0, validas: 0, porcentaje_promedio: 0 };
    const validas = filtered.filter((r: any) => r.segundos_escuchados / c.duracion_seg >= VALID).length;
    const pct = filtered.reduce((a: number, r: any) => a + (r.segundos_escuchados / c.duracion_seg), 0) / filtered.length * 100;
    return { cancion: c, reproducciones: filtered.length, validas, porcentaje_promedio: Number(pct.toFixed(2)) };
  });
