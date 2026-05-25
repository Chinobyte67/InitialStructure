// Cliente HTTP del backend Python (FastAPI/Flask) que corre en localhost:8000.
// Las rutas siguen el contrato de las HUs (HU1..HU14). Sin auth por ahora.
//
// Para apuntar a otro host, definir VITE_API_URL en .env.local.

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

type Query = Record<string, string | number | boolean | undefined | null>;

export class ApiError extends Error {
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

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.error === "string") {
      throw new ApiError(res.status, obj.error, parsed);
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
const post = <T>(path: string, body?: unknown, query?: Query) => request<T>("POST", path, { body, query });
const put = <T>(path: string, body?: unknown, query?: Query) => request<T>("PUT", path, { body, query });
const del = <T>(path: string, bodyOrQuery?: unknown | Query) => {
  if (bodyOrQuery && typeof bodyOrQuery === "object" && !Array.isArray(bodyOrQuery)) {
    // Heuristic: caller passes a query object if no body is intended
    return request<T>("DELETE", path, { query: bodyOrQuery as Query });
  }
  return request<T>("DELETE", path, bodyOrQuery !== undefined ? { body: bodyOrQuery } : {});
};

// =====================================================================
// Tipos (DTOs del backend FastAPI)
// =====================================================================
export interface UserResponse {
  id: number;
  email: string;
  age: number;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Artista {
  id: number;
  nombre: string;
  pais: string;
  genero: string;
  genero_musical: string;
}

type RawArtista = Omit<Artista, "genero_musical">;

function normalizeArtista(artista: RawArtista): Artista {
  return {
    ...artista,
    genero_musical: artista.genero,
  };
}

export interface Album {
  id: number;
  titulo: string;
  anio: number;
  artista_id: number;
}

export interface Cancion {
  id: number;
  titulo: string;
  duracion_seg: number;
  album_id: number;
  /** URL del audio (Cloudinary). Puede ser null si la canción aún no tiene archivo. */
  url_audio?: string | null;
}

export interface Playlist {
  id: number;
  nombre: string;
  usuario_id: number;
  fecha_creacion: string;
  es_publica: number;
  colaborativa: number;
  colaboradores?: number[];
}

export interface Reproduccion {
  id: number;
  usuario_id: number;
  cancion_id: number;
  fecha: string;
  segundos_escuchados: number;
}

// =====================================================================
// Endpoints — adaptados al backend FastAPI actual
// =====================================================================
export const api = {
  // Autenticación
  auth: {
    login: (data: { email: string; password: string }) =>
      post<Token>("/auth/login", data),
  },

  // Usuarios
  usuarios: {
    crear: (data: { email: string; password: string; age: number }) =>
      post<UserResponse>("/users", data),
    obtener: (id: number) => get<UserResponse>(`/users/${id}`),
    listar: () => get<UserResponse[]>("/users"),
    actualizar: (id: number, data: Partial<{ email: string; age: number }>) =>
      put<UserResponse>(`/users/${id}`, data),
    eliminar: (id: number) => del<{ ok: true }>(`/users/${id}`),
  },

  // Artistas (si están implementados)
  artistas: {
    listar: async () => {
      const artistas = await get<RawArtista[]>("/artistas");
      return artistas.map(normalizeArtista);
    },
    obtener: async (id: number) => {
      const artista = await get<RawArtista>(`/artistas/${id}`);
      return normalizeArtista(artista);
    },
    crear: async (data: Omit<RawArtista, "id">) => {
      const artista = await post<RawArtista>("/artistas", data);
      return normalizeArtista(artista);
    },
  },

  // Álbumes
  albumes: {
    listar: (query?: { artista_id?: number }) => get<Album[]>("/albumes", query),
    obtener: (id: number) => get<Album>(`/albumes/${id}`),
    crear: (data: Omit<Album, "id" | "artista">) => post<Album>("/albumes", data),
  },

  // Canciones
  canciones: {
    listar: (query?: { album_id?: number }) => get<Cancion[]>("/canciones", query),
    obtener: (id: number) => get<Cancion>(`/canciones/${id}`),
    crear: (data: Omit<Cancion, "id" | "album">) => post<Cancion>("/canciones", data),
    actualizar: (id: number, data: Partial<Omit<Cancion, "id" | "album">>) =>
      put<Cancion>(`/canciones/${id}`, data),
    eliminar: (id: number) => del<{ ok: true }>(`/canciones/${id}`),
    listarAll: () => get<Cancion[]>(`/canciones/all`),
  },
  
  // Playlists
  playlists: {
    crear: (data: any) => post<Playlist>(`/playlists`, data),
    listar: () => get<Playlist[]>(`/playlists`),
    obtener: (id: number) => get<Playlist>(`/playlists/${id}`),
    actualizar: (id: number, data: any, usuario_dueno_id?: number) =>
      put<Playlist>(`/playlists/${id}`, data, usuario_dueno_id ? { usuario_dueno_id } : undefined),
    eliminar: (id: number, usuario_id: number) => del<{ ok: true }>(`/playlists/${id}/usuario/${usuario_id}`),
    addColaborador: (playlist_id: number, body: { usuario_id: number; usuario_dueno_id: number }) =>
      post<Playlist>(`/playlists/${playlist_id}/colaboradores`, body),
    removeColaborador: (playlist_id: number, usuario_id: number, usuario_dueno_id?: number) =>
      del<Playlist>(`/playlists/${playlist_id}/colaboradores/${usuario_id}`, usuario_dueno_id ? { usuario_dueno_id } : undefined),
  },

  // Playlist canciones
  playlistCanciones: {
    crear: (data: { playlist_id: number; cancion_id: number }, usuario_id?: number) =>
      post(`/playlist-canciones`, data, usuario_id ? { usuario_id } : undefined),
    listarPorPlaylist: (playlist_id: number) => get<any[]>(`/playlist-canciones/playlist/${playlist_id}`),
    listarTodas: () => get<any[]>(`/playlist-canciones`),
    eliminar: (id: number, usuario_id?: number) => del(`/playlist-canciones/${id}`, usuario_id ? { usuario_id } : undefined),
  },

  // Favoritos
  favoritos: {
    toggle: (data: { usuario_id: number; cancion_id: number }) => post(`/favoritos`, data),
    listar: (usuario_id?: number) => get<any[]>(`/favoritos`, usuario_id ? { usuario_id } : undefined),
    eliminar: (id: number) => del(`/favoritos/${id}`),
  },

  // Seguidores
  seguidores: {
    toggle: (data: { usuario_id: number; artista_id: number }) => post(`/seguidores`, data),
    listar: (usuario_id?: number) => get<any[]>(`/seguidores`, usuario_id ? { usuario_id } : undefined),
    eliminar: (id: number) => del(`/seguidores/${id}`),
  },

  // Reproducciones
  reproducciones: {
    crear: (data: { usuario_id: number; cancion_id: number; segundos_escuchados: number }) => post(`/reproducciones`, data),
    listar: () => get<any[]>(`/reproducciones`),
  },

  // Buscar
  buscar: {
    buscar: async (q: string) => {
      const resp = await get<{ artistas: RawArtista[]; albumes: Album[]; canciones: Cancion[] }>(`/buscar`, { busqueda: q });
      return {
        ...resp,
        artistas: resp.artistas.map(normalizeArtista),
      };
    },
  },
};
