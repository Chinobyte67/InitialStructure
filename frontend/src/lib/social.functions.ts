import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "@/lib/api";

// HU5 — Favoritos
export const toggleFavorito = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ cancion_id: z.number().int(), usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const all = await api.favoritos.listar(data.usuario_id);
    const existing = (all ?? []).find((f: any) => f.cancion_id === data.cancion_id);
    if (existing) {
      await api.favoritos.eliminar(existing.id);
      return { favorito: false };
    }
    await api.favoritos.toggle({ usuario_id: data.usuario_id, cancion_id: data.cancion_id });
    return { favorito: true };
  });

export const listarFavoritos = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const favs = await api.favoritos.listar(data.usuario_id);
    const enriched = await Promise.all((favs ?? []).map(async (f: any) => {
      try {
        const c = await api.canciones.obtener(f.cancion_id);
        return { ...f, cancion: c };
      } catch {
        return { ...f, cancion: null };
      }
    }));
    return enriched;
  });

// HU6 — Seguir artistas
export const toggleSeguir = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ artista_id: z.number().int(), usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const all = await api.seguidores.listar(data.usuario_id);
    const existing = (all ?? []).find((s: any) => s.artista_id === data.artista_id);
    if (existing) {
      await api.seguidores.eliminar(existing.id);
      return { siguiendo: false };
    }
    await api.seguidores.toggle({ usuario_id: data.usuario_id, artista_id: data.artista_id });
    return { siguiendo: true };
  });

export const listarSeguidos = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ usuario_id: z.number().int() }).parse(i))
  .handler(async ({ data }) => {
    const segs = await api.seguidores.listar(data.usuario_id);
    const enriched = await Promise.all((segs ?? []).map(async (s: any) => {
      try {
        const a = await api.artistas.obtener(s.artista_id);
        return { ...s, artista: a };
      } catch {
        return { ...s, artista: null };
      }
    }));
    return enriched;
  });
