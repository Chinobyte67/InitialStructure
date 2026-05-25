import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/lib/api";

// HU2 — Alta de artistas, álbumes y canciones (admin)
export const crearArtista = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      nombre: z.string().trim().min(1).max(120),
      pais: z.string().trim().min(1).max(80),
      genero: z.string().trim().min(1).max(60),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const payload = { nombre: data.nombre, pais: data.pais, genero: data.genero };
    const row = await api.artistas.crear(payload);
    return row;
  });

export const crearAlbum = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      titulo: z.string().trim().min(1).max(200),
      anio: z.number().int().min(1900).max(2100),
      artista_id: z.number().int(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const row = await api.albumes.crear({ titulo: data.titulo, anio: data.anio, artista_id: data.artista_id });
    return row;
  });

export const crearCancion = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      titulo: z.string().trim().min(1).max(200),
      duracion_seg: z.number().int().positive().max(7200),
      album_id: z.number().int(),
      url_audio: z.string().trim().url().optional(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const row = await api.canciones.crear({
      titulo: data.titulo,
      duracion_seg: data.duracion_seg,
      album_id: data.album_id,
      url_audio: data.url_audio,
    });
    return row;
  });

// Listados de catálogo
export const listarArtistas = createServerFn({ method: "GET" })
  .handler(async () => {
    return await api.artistas.listar();
  });

export const obtenerArtista = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const artista = await api.artistas.obtener(data.id);
    if (!artista) throw new Error("Artista no encontrado");
    const albumes = await api.albumes.listar({ artista_id: data.id });
    return { artista, albumes: albumes ?? [] };
  });

export const obtenerAlbum = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const album = await api.albumes.obtener(data.id);
    if (!album) throw new Error("Album no encontrado");
    const canciones = await api.canciones.listar({ album_id: data.id });
    return { album, canciones: canciones ?? [] };
  });

// HU8 — Búsqueda parcial case-insensitive en canciones, álbumes y artistas
export const buscar = createServerFn({ method: "GET" })
  .inputValidator((i) =>
    z.object({ q: z.string().trim().min(1).max(120) }).parse(i)
  )
  .handler(async ({ data }) => {
    const resp = await api.buscar.buscar(data.q);
    return resp ?? { artistas: [], albumes: [], canciones: [] };
  });
