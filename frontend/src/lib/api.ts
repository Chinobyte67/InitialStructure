// Cliente HTTP del backend Python (FastAPI/Flask) que corre en localhost:8000.
// Las rutas siguen el contrato de las HUs (HU1..HU14). Sin auth por ahora.
//
// Para apuntar a otro host, definir VITE_API_URL en .env.local.

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

type Query = Record<string, string | number | boolean | undefined | null>;

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(path.replace(/^\//, ""), API_URL.endsWith("/") ? API_URL : API_URL + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  opts: { body?: unknown; query?: Query } = {}
): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  let parsed: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    let msg = res.statusText || `HTTP ${res.status}`;
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.detail === "string") msg = obj.detail;
      else if (typeof obj.message === "string") msg = obj.message;
    }
    throw new ApiError(res.status, msg, parsed);
  }
  return parsed as T;
}

const get = <T>(path: string, query?: Query) => request<T>("GET", path, { query });
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, { body });
const put = <T>(path: string, body?: unknown) => request<T>("PUT", path, { body });
const del = <T>(path: string, body?: unknown) =>
  request<T>("DELETE", path, body !== undefined ? { body } : {});

// =====================================================================
// Tipos (DTOs esperados desde el backend)
// =====================================================================
export type Plan = "free" | "premium" | "familiar";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  plan: Plan;
  fecha_registro: string;
}

export interface Artista {
  id: string;
  nombre: string;
  pais: string;
  genero_musical: string;
}

export interface Album {
  id: string;
  titulo: string;
  anio: number;
  artista_id: string;
  artista?: Artista;
}

export interface Cancion {
  id: string;
  titulo: string;
  duracion_seg: number;
  album_id: string;
  album?: Album;
}

export interface Playlist {
  id: string;
  nombre: string;
  usuario_id: string;
  es_publica: boolean;
  colaborativa: boolean;
  fecha_creacion: string;
}

export interface PlaylistDetalle extends Playlist {
  canciones: Cancion[];
  total_seg: number;
  colaboradores: string[];
}

export interface ResultadoBusqueda {
  artistas: Artista[];
  albumes: Album[];
  canciones: Cancion[];
}

export interface EstadisticaCancion {
  reproducciones: number;
  reproducciones_validas: number;
  porcentaje_promedio_escuchado: number;
}

export interface TopCancion {
  cancion: Cancion;
  reproducciones: number;
}

export interface WrappedAnual {
  anio: number;
  total_reproducciones: number;
  minutos_escuchados: number;
  top_canciones: TopCancion[];
  top_artistas: { artista: Artista; reproducciones: number }[];
  generos: { genero: string; reproducciones: number }[];
}

// =====================================================================
// Endpoints — un método por HU
// =====================================================================
export const api = {
  // HU1 — Registro / consulta de usuarios
  usuarios: {
    crear: (data: { email: string; nombre: string; plan: Plan; password?: string }) =>
      post<Usuario>("/usuarios", data),
    obtener: (id: string) => get<Usuario>(`/usuarios/${id}`),
    listar: () => get<Usuario[]>("/usuarios"),
  },

  // HU2 — Catálogo (alta admin)
  artistas: {
    listar: () => get<Artista[]>("/artistas"),
    obtener: (id: string) => get<Artista & { albumes: Album[] }>(`/artistas/${id}`),
    crear: (data: Omit<Artista, "id">) => post<Artista>("/artistas", data),
  },
  albumes: {
    listar: (query?: { artista_id?: string }) => get<Album[]>("/albumes", query),
    obtener: (id: string) => get<Album & { canciones: Cancion[] }>(`/albumes/${id}`),
    crear: (data: Omit<Album, "id" | "artista">) => post<Album>("/albumes", data),
  },
  canciones: {
    listar: (query?: { album_id?: string }) => get<Cancion[]>("/canciones", query),
    obtener: (id: string) => get<Cancion>(`/canciones/${id}`),
    crear: (data: Omit<Cancion, "id" | "album">) => post<Cancion>("/canciones", data),
    // HU14 — estadísticas por canción
    estadisticas: (id: string, query?: { desde?: string; hasta?: string }) =>
      get<EstadisticaCancion>(`/canciones/${id}/estadisticas`, query),
  },

  // HU3, HU4, HU10, HU11 — Playlists
  playlists: {
    listar: (query?: { usuario_id?: string; publicas?: boolean }) =>
      get<Playlist[]>("/playlists", query),
    obtener: (id: string) => get<PlaylistDetalle>(`/playlists/${id}`),
    crear: (data: { nombre: string; usuario_id: string; es_publica?: boolean; colaborativa?: boolean }) =>
      post<Playlist>("/playlists", data),
    actualizar: (id: string, data: Partial<Pick<Playlist, "nombre" | "es_publica" | "colaborativa">>) =>
      put<Playlist>(`/playlists/${id}`, data),
    eliminar: (id: string) => del<{ ok: true }>(`/playlists/${id}`),
    agregarCancion: (id: string, cancion_id: string) =>
      post<{ ok: true }>(`/playlists/${id}/canciones`, { cancion_id }),
    quitarCancion: (id: string, cancion_id: string) =>
      del<{ ok: true }>(`/playlists/${id}/canciones/${cancion_id}`),
    // HU11 — colaboradores
    agregarColaborador: (id: string, usuario_id: string) =>
      post<{ ok: true }>(`/playlists/${id}/colaboradores`, { usuario_id }),
    quitarColaborador: (id: string, usuario_id: string) =>
      del<{ ok: true }>(`/playlists/${id}/colaboradores/${usuario_id}`),
  },

  // HU5 — Favoritos
  favoritos: {
    listar: (usuario_id: string) => get<Cancion[]>(`/usuarios/${usuario_id}/favoritos`),
    agregar: (usuario_id: string, cancion_id: string) =>
      post<{ ok: true }>(`/usuarios/${usuario_id}/favoritos`, { cancion_id }),
    quitar: (usuario_id: string, cancion_id: string) =>
      del<{ ok: true }>(`/usuarios/${usuario_id}/favoritos/${cancion_id}`),
  },

  // HU6 — Seguir artistas
  seguidos: {
    listar: (usuario_id: string) => get<Artista[]>(`/usuarios/${usuario_id}/seguidos`),
    seguir: (usuario_id: string, artista_id: string) =>
      post<{ ok: true }>(`/usuarios/${usuario_id}/seguidos`, { artista_id }),
    dejarDeSeguir: (usuario_id: string, artista_id: string) =>
      del<{ ok: true }>(`/usuarios/${usuario_id}/seguidos/${artista_id}`),
  },

  // HU7 — Reproducciones (regla de validez 30%)
  reproducciones: {
    registrar: (data: {
      usuario_id: string;
      cancion_id: string;
      segundos_escuchados: number;
      fecha?: string;
    }) => post<{ id: string; valida: boolean }>("/reproducciones", data),
  },

  // HU8 — Búsqueda parcial case-insensitive
  buscar: (q: string) => get<ResultadoBusqueda>("/buscar", { q }),

  // HU9 — Top canciones por usuario
  top: {
    canciones: (usuario_id: string, query?: { limit?: number; desde?: string; hasta?: string }) =>
      get<TopCancion[]>(`/usuarios/${usuario_id}/top-canciones`, query),
  },

  // HU12 — Recomendaciones por género
  recomendaciones: (usuario_id: string, query?: { limit?: number }) =>
    get<Cancion[]>(`/usuarios/${usuario_id}/recomendaciones`, query),

  // HU13 — Wrapped anual
  wrapped: (usuario_id: string, anio: number) =>
    get<WrappedAnual>(`/usuarios/${usuario_id}/wrapped/${anio}`),
};

export { ApiError };
