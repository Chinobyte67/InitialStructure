import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/lib/api";

// HU3 — Crear playlist
export const crearPlaylist = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      nombre: z.string().trim().min(1).max(120).optional(),
      es_publica: z.boolean().default(false).optional(),
      colaborativa: z.boolean().default(false).optional(),
      usuario_id: z.number().int().optional(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    if (!data || typeof data !== "object") throw new Error("Payload inválido al crear playlist");
    if (!data.nombre || String(data.nombre).trim().length === 0) throw new Error("Nombre de playlist requerido");
    if (data.usuario_id == null) throw new Error("Usuario no autenticado o usuario_id faltante");

    const payload = {
      nombre: String(data.nombre).trim(),
      es_publica: data.es_publica ? 1 : 0,
      colaborativa: data.colaborativa ? 1 : 0,
      usuario_id: data.usuario_id,
    };

    const row = await api.playlists.crear(payload);
    if (!row) throw new Error("Respuesta vacía del servidor al crear playlist");
    return row;
  });

export const renombrarPlaylist = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.number().int(), nombre: z.string().trim().min(1).max(120), usuario_id: z.number().int().optional() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.actualizar(data.id, { nombre: data.nombre }, data.usuario_id);
    return { ok: true };
  });

export const eliminarPlaylist = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.number().int(), usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.eliminar(data.id, data.usuario_id);
    return { ok: true };
  });

export const cambiarVisibilidad = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.number().int(), es_publica: z.boolean(), usuario_id: z.number().int().optional() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.actualizar(data.id, { es_publica: data.es_publica ? 1 : 0 }, data.usuario_id);
    return { ok: true };
  });

// HU11 — Colaborativas
export const cambiarColaborativa = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.number().int(), colaborativa: z.boolean(), usuario_id: z.number().int().optional() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.actualizar(data.id, { colaborativa: data.colaborativa ? 1 : 0 }, data.usuario_id);
    return { ok: true };
  });

export const agregarColaborador = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ playlist_id: z.number().int(), usuario_id: z.number().int(), usuario_dueno_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.addColaborador(data.playlist_id, { usuario_id: data.usuario_id, usuario_dueno_id: data.usuario_dueno_id });
    return { ok: true };
  });

export const quitarColaborador = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ playlist_id: z.number().int(), usuario_id: z.number().int(), usuario_dueno_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlists.removeColaborador(data.playlist_id, data.usuario_id, data.usuario_dueno_id);
    return { ok: true };
  });

// HU4 — Agregar/quitar canciones
export const agregarCancion = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ playlist_id: z.number().int(), cancion_id: z.number().int(), usuario_id: z.number().int().optional() }).parse(i))
  .handler(async ({ data }) => {
    await api.playlistCanciones.crear({ playlist_id: data.playlist_id, cancion_id: data.cancion_id }, data.usuario_id);
    return { ok: true };
  });

export const quitarCancion = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ playlist_id: z.number().int(), cancion_id: z.number().int(), usuario_id: z.number().int().optional() }).parse(i))
  .handler(async ({ data }) => {
    const result = await api.playlistCanciones.eliminarPorPlaylist(data.playlist_id, data.cancion_id, data.usuario_id);
    if (!result?.ok) {
      throw new Error("No se pudo eliminar la canción de la playlist");
    }
    return { ok: true };
  });

// Listar mis playlists + visibles
export const listarPlaylists = createServerFn({ method: "GET" })
  .handler(async () => {
    return (await api.playlists.listar()) ?? [];
  });

// HU10 — Detalle de playlist con duración total
export const obtenerPlaylist = createServerFn({ method: "GET" })
  .inputValidator((i) =>
    z
      .object({ id: z.union([z.number().int(), z.string().regex(/^[0-9]+$/)]) })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const playlistId = typeof data.id === "string" ? Number(data.id) : data.id;
    if (Number.isNaN(playlistId)) throw new Error("ID de playlist inválido");

    const pl = await api.playlists.obtener(playlistId);
    if (!pl) throw new Error("Playlist no encontrada");
    const tracks = await api.playlistCanciones.listarPorPlaylist(playlistId);
    const tracksWithCancion = await Promise.all((tracks ?? []).map(async (t: any) => {
      let cancion: any = null;
      let album: any = null;
      let artista: any = null;

      try {
        cancion = await api.canciones.obtener(t.cancion_id);
      } catch {
        cancion = null;
      }

      if (cancion) {
        try {
          album = await api.albumes.obtener(cancion.album_id);
        } catch {
          album = null;
        }
      }

      if (album) {
        try {
          artista = await api.artistas.obtener(album.artista_id);
        } catch {
          artista = null;
        }
      }

      return {
        ...t,
        canciones: {
          id: cancion?.id ?? t.cancion_id,
          titulo: cancion?.titulo ?? "Canción desconocida",
          duracion_seg: cancion?.duracion_seg ?? 0,
          albumes: {
            titulo: album?.titulo ?? "Álbum desconocido",
            artistas: {
              id: artista?.id ?? 0,
              nombre: artista?.nombre ?? "Artista desconocido",
              genero_musical: artista?.genero_musical ?? artista?.genero ?? "unknown",
            },
          },
        },
      };
    }));

    const total_seg = tracksWithCancion.reduce((acc: number, t: any) => acc + (t.canciones?.duracion_seg ?? 0), 0);
    const colaboradores = (pl as any).colaboradores ?? [];
    return { playlist: pl, tracks: tracksWithCancion, total_seg, colaboradores };
  });
