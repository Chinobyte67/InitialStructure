// Cliente HTTP del backend Python (FastAPI/Flask) que corre en localhost:8000.
// Las rutas siguen el contrato de las HUs (HU1..HU14). Sin auth por ahora.
//
// Para apuntar a otro host, definir VITE_API_URL en .env.local.

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

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
  genero_musical: string;
}

export interface Album {
  id: number;
  titulo: string;
  anio?: number;
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
  es_publica: boolean;
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
    listar: () => get<Artista[]>("/artistas"),
    obtener: (id: number) => get<Artista>(`/artistas/${id}`),
    crear: (data: Omit<Artista, "id">) => post<Artista>("/artistas", data),
  },

  // Álbumes
  albumes: {
    listar: (query?: { artista_id?: number }) => get<Album[]>("/albums", query),
    obtener: (id: number) => get<Album>(`/albums/${id}`),
    crear: (data: Omit<Album, "id" | "artista">) => post<Album>("/albums", data),
  },

  // Canciones
  canciones: {
    listar: (query?: { album_id?: number }) => get<Cancion[]>("/canciones", query),
    obtener: (id: number) => get<Cancion>(`/canciones/${id}`),
    crear: (data: Omit<Cancion, "id" | "album">) => post<Cancion>("/canciones", data),
    actualizar: (id: number, data: Partial<Omit<Cancion, "id" | "album">>) =>
      put<Cancion>(`/canciones/${id}`, data),
    eliminar: (id: number) => del<{ ok: true }>(`/canciones/${id}`),
  },
};

export { ApiError };
