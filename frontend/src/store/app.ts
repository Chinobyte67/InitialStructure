import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Cancion,
  type Plan,
  canciones,
  getCancion,
  getArtistaDeCancion,
} from "@/data/catalog";

export interface PlaylistTrack {
  cancion_id: string;
  orden: number;
  fecha_agregada: string;
}

export interface Playlist {
  id: string;
  nombre: string;
  usuario_id: string;
  fecha_creacion: string;
  es_publica: boolean;
  colaborativa: boolean;
  colaboradores: string[]; // user ids
  tracks: PlaylistTrack[];
}

export interface Reproduccion {
  id: string;
  usuario_id: string;
  cancion_id: string;
  fecha: string; // ISO
  segundos_escuchados: number;
}

export interface UserState {
  id: string;
  email: string;
  nombre: string;
  plan: Plan;
  fecha_registro: string;
}

interface AppState {
  user: UserState;
  playlists: Playlist[];
  favoritos: string[]; // cancion ids
  seguidos: string[]; // artista ids
  reproducciones: Reproduccion[];

  // Player
  currentSongId: string | null;
  isPlaying: boolean;
  progress: number; // seconds played in current track

  // actions
  setUserPlan: (p: Plan) => void;

  createPlaylist: (nombre: string, es_publica: boolean) => Playlist | { error: string };
  renamePlaylist: (id: string, nombre: string) => void | { error: string };
  deletePlaylist: (id: string) => void;
  togglePlaylistPublic: (id: string) => void;
  togglePlaylistCollab: (id: string) => void;
  addColaborador: (playlistId: string, userId: string) => void;
  removeColaborador: (playlistId: string, userId: string) => void;

  addToPlaylist: (playlistId: string, cancionId: string) => void | { error: string };
  removeFromPlaylist: (playlistId: string, cancionId: string) => void;
  reorderPlaylist: (playlistId: string, fromIdx: number, toIdx: number) => void;

  toggleFavorito: (cancionId: string) => void;
  toggleSeguir: (artistaId: string) => void;

  play: (cancionId: string) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  tick: (delta: number) => void;
  registerPlay: (cancionId: string, segundos: number) => void;
}

const DEFAULT_USER: UserState = {
  id: "u_self",
  email: "tu@aurastream.app",
  nombre: "Alex",
  plan: "premium",
  fecha_registro: new Date(2024, 0, 15).toISOString(),
};

// Seed: una playlist con 3 canciones para que la app no esté vacía.
const seedPlaylists: Playlist[] = [
  {
    id: "p_seed",
    nombre: "Late Night Vibes",
    usuario_id: "u_self",
    fecha_creacion: new Date(2025, 5, 1).toISOString(),
    es_publica: true,
    colaborativa: false,
    colaboradores: [],
    tracks: [
      { cancion_id: canciones[0].id, orden: 1, fecha_agregada: new Date().toISOString() },
      { cancion_id: canciones[7].id, orden: 2, fecha_agregada: new Date().toISOString() },
      { cancion_id: canciones[14].id, orden: 3, fecha_agregada: new Date().toISOString() },
    ],
  },
];

// Seed reproducciones sintéticas para tops y wrapped.
function seedReproducciones(): Reproduccion[] {
  const out: Reproduccion[] = [];
  const now = Date.now();
  const picks = [0, 0, 0, 7, 7, 14, 14, 14, 14, 21, 28, 28, 35, 35, 35, 42, 49];
  picks.forEach((idx, i) => {
    const s = canciones[idx];
    out.push({
      id: `r_seed_${i}`,
      usuario_id: "u_self",
      cancion_id: s.id,
      fecha: new Date(now - i * 86400000 * 3).toISOString(),
      segundos_escuchados: Math.floor(s.duracion_seg * (0.5 + (i % 4) * 0.15)),
    });
  });
  return out;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      playlists: seedPlaylists,
      favoritos: [canciones[2].id, canciones[10].id],
      seguidos: ["a1", "a3"],
      reproducciones: seedReproducciones(),

      currentSongId: canciones[0].id,
      isPlaying: false,
      progress: 0,

      setUserPlan: (plan) => set((s) => ({ user: { ...s.user, plan } })),

      createPlaylist: (nombre, es_publica) => {
        const trimmed = nombre.trim();
        if (!trimmed) return { error: "El nombre no puede estar vacío" };
        const exists = get().playlists.some(
          (p) => p.usuario_id === get().user.id && p.nombre.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return { error: "Ya tenés una playlist con ese nombre" };
        const pl: Playlist = {
          id: `p_${Date.now()}`,
          nombre: trimmed,
          usuario_id: get().user.id,
          fecha_creacion: new Date().toISOString(),
          es_publica,
          colaborativa: false,
          colaboradores: [],
          tracks: [],
        };
        set((s) => ({ playlists: [...s.playlists, pl] }));
        return pl;
      },

      renamePlaylist: (id, nombre) => {
        const trimmed = nombre.trim();
        if (!trimmed) return { error: "Nombre vacío" };
        const dupe = get().playlists.some(
          (p) =>
            p.id !== id &&
            p.usuario_id === get().user.id &&
            p.nombre.toLowerCase() === trimmed.toLowerCase()
        );
        if (dupe) return { error: "Ya tenés otra playlist con ese nombre" };
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, nombre: trimmed } : p)),
        }));
      },

      deletePlaylist: (id) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

      togglePlaylistPublic: (id) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, es_publica: !p.es_publica } : p
          ),
        })),

      togglePlaylistCollab: (id) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, colaborativa: !p.colaborativa } : p
          ),
        })),

      addColaborador: (playlistId, userId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.colaboradores.includes(userId)
              ? { ...p, colaboradores: [...p.colaboradores, userId] }
              : p
          ),
        })),

      removeColaborador: (playlistId, userId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, colaboradores: p.colaboradores.filter((u) => u !== userId) }
              : p
          ),
        })),

      addToPlaylist: (playlistId, cancionId) => {
        const pl = get().playlists.find((p) => p.id === playlistId);
        if (!pl) return { error: "Playlist no encontrada" };
        if (pl.tracks.some((t) => t.cancion_id === cancionId))
          return { error: "Esa canción ya está en la playlist" };
        const track: PlaylistTrack = {
          cancion_id: cancionId,
          orden: pl.tracks.length + 1,
          fecha_agregada: new Date().toISOString(),
        };
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p
          ),
        }));
      },

      removeFromPlaylist: (playlistId, cancionId) =>
        set((s) => ({
          playlists: s.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const filtered = p.tracks
              .filter((t) => t.cancion_id !== cancionId)
              .map((t, i) => ({ ...t, orden: i + 1 }));
            return { ...p, tracks: filtered };
          }),
        })),

      reorderPlaylist: (playlistId, fromIdx, toIdx) =>
        set((s) => ({
          playlists: s.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const arr = [...p.tracks];
            const [m] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, m);
            return { ...p, tracks: arr.map((t, i) => ({ ...t, orden: i + 1 })) };
          }),
        })),

      toggleFavorito: (cancionId) =>
        set((s) => ({
          favoritos: s.favoritos.includes(cancionId)
            ? s.favoritos.filter((c) => c !== cancionId)
            : [...s.favoritos, cancionId],
        })),

      toggleSeguir: (artistaId) =>
        set((s) => ({
          seguidos: s.seguidos.includes(artistaId)
            ? s.seguidos.filter((a) => a !== artistaId)
            : [...s.seguidos, artistaId],
        })),

      play: (cancionId) => {
        const prev = get().currentSongId;
        const prevProg = get().progress;
        if (prev && prev !== cancionId && prevProg > 5) {
          get().registerPlay(prev, prevProg);
        }
        set({ currentSongId: cancionId, isPlaying: true, progress: 0 });
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const cur = get().currentSongId;
        const idx = canciones.findIndex((c) => c.id === cur);
        const nextSong = canciones[(idx + 1) % canciones.length];
        get().play(nextSong.id);
      },

      prev: () => {
        const cur = get().currentSongId;
        const idx = canciones.findIndex((c) => c.id === cur);
        const prevSong = canciones[(idx - 1 + canciones.length) % canciones.length];
        get().play(prevSong.id);
      },

      tick: (delta) => {
        const { isPlaying, currentSongId, progress } = get();
        if (!isPlaying || !currentSongId) return;
        const song = getCancion(currentSongId);
        if (!song) return;
        const next = progress + delta;
        if (next >= song.duracion_seg) {
          get().registerPlay(currentSongId, song.duracion_seg);
          get().next();
        } else {
          set({ progress: next });
        }
      },

      registerPlay: (cancionId, segundos) => {
        const song = getCancion(cancionId);
        if (!song) return;
        const seg = Math.min(segundos, song.duracion_seg);
        const r: Reproduccion = {
          id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          usuario_id: get().user.id,
          cancion_id: cancionId,
          fecha: new Date().toISOString(),
          segundos_escuchados: seg,
        };
        set((s) => ({ reproducciones: [...s.reproducciones, r] }));
      },
    }),
    { name: "aurastream-state-v1" }
  )
);

// ----- Selectors / queries (HU compliance helpers) -----

export const VALID_THRESHOLD = 0.3;

export function isReproValida(r: Reproduccion): boolean {
  const c = getCancion(r.cancion_id);
  if (!c) return false;
  return r.segundos_escuchados / c.duracion_seg >= VALID_THRESHOLD;
}

export function topCanciones(reps: Reproduccion[], limit = 10) {
  const map = new Map<string, number>();
  reps.filter(isReproValida).forEach((r) => {
    map.set(r.cancion_id, (map.get(r.cancion_id) ?? 0) + 1);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cancion_id, plays]) => ({ cancion: getCancion(cancion_id)!, plays }))
    .filter((x) => x.cancion);
}

export function topArtistas(reps: Reproduccion[], limit = 10) {
  const map = new Map<string, number>();
  reps.filter(isReproValida).forEach((r) => {
    const c = getCancion(r.cancion_id);
    const a = c ? getArtistaDeCancion(c) : undefined;
    if (a) map.set(a.id, (map.get(a.id) ?? 0) + 1);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, plays]) => ({ id, plays }));
}

export function topGeneros(reps: Reproduccion[], limit = 3) {
  const map = new Map<string, number>();
  reps.filter(isReproValida).forEach((r) => {
    const c = getCancion(r.cancion_id);
    const a = c ? getArtistaDeCancion(c) : undefined;
    if (a) map.set(a.genero_musical, (map.get(a.genero_musical) ?? 0) + 1);
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genero, plays]) => ({ genero, plays }));
}

export function recomendaciones(reps: Reproduccion[], limit = 10): Cancion[] {
  const validas = reps.filter(isReproValida);
  const recientes = new Set(
    reps
      .filter((r) => Date.now() - new Date(r.fecha).getTime() < 30 * 86400000)
      .map((r) => r.cancion_id)
  );
  if (validas.length < 5) {
    return canciones
      .filter((c) => !recientes.has(c.id))
      .slice(0, limit);
  }
  const generos = topGeneros(validas, 3).map((g) => g.genero);
  const candidatas = canciones.filter((c) => {
    if (recientes.has(c.id)) return false;
    const a = getArtistaDeCancion(c);
    return a ? generos.includes(a.genero_musical) : false;
  });
  return candidatas.slice(0, limit);
}
