// Catálogo mock para la app tipo Spotify (frontend-only).
// Todos los IDs son strings estables.

export type Plan = "free" | "premium" | "familiar";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  fecha_registro: string; // ISO
  plan: Plan;
}

export interface Artista {
  id: string;
  nombre: string;
  pais: string;
  genero_musical: string;
  color: [string, string]; // gradient hint
}

export interface Album {
  id: string;
  titulo: string;
  anio: number;
  artista_id: string;
  color: [string, string];
}

export interface Cancion {
  id: string;
  titulo: string;
  duracion_seg: number;
  album_id: string;
}

const c = (a: string, b: string): [string, string] => [a, b];

export const artistas: Artista[] = [
  { id: "a1", nombre: "Nova Echo", pais: "Argentina", genero_musical: "Electronic", color: c("oklch(0.55 0.22 290)", "oklch(0.30 0.10 240)") },
  { id: "a2", nombre: "Silas Vance", pais: "USA", genero_musical: "Indie Rock", color: c("oklch(0.50 0.18 30)", "oklch(0.25 0.08 20)") },
  { id: "a3", nombre: "Lyra Starr", pais: "UK", genero_musical: "Pop", color: c("oklch(0.65 0.20 340)", "oklch(0.30 0.12 320)") },
  { id: "a4", nombre: "Rhythm Architect", pais: "France", genero_musical: "Hip-Hop", color: c("oklch(0.55 0.15 60)", "oklch(0.25 0.06 40)") },
  { id: "a5", nombre: "Cosmo Jones", pais: "Brasil", genero_musical: "Jazz", color: c("oklch(0.55 0.15 180)", "oklch(0.25 0.06 200)") },
  { id: "a6", nombre: "Stella Nova", pais: "Spain", genero_musical: "Pop", color: c("oklch(0.62 0.20 10)", "oklch(0.28 0.10 350)") },
  { id: "a7", nombre: "Forest Whispers", pais: "Canada", genero_musical: "Folk", color: c("oklch(0.55 0.15 150)", "oklch(0.25 0.06 140)") },
  { id: "a8", nombre: "Orion Bloom", pais: "Germany", genero_musical: "Electronic", color: c("oklch(0.55 0.20 260)", "oklch(0.25 0.10 280)") },
];

export const albumes: Album[] = [
  { id: "al1", titulo: "Quantum Leap", anio: 2023, artista_id: "a1", color: c("oklch(0.55 0.22 290)", "oklch(0.25 0.10 240)") },
  { id: "al2", titulo: "Neon Dreams", anio: 2021, artista_id: "a1", color: c("oklch(0.60 0.20 320)", "oklch(0.25 0.10 270)") },
  { id: "al3", titulo: "Velvet Roads", anio: 2022, artista_id: "a2", color: c("oklch(0.50 0.18 30)", "oklch(0.22 0.08 20)") },
  { id: "al4", titulo: "Starlight Sonata", anio: 2024, artista_id: "a3", color: c("oklch(0.65 0.20 340)", "oklch(0.28 0.12 320)") },
  { id: "al5", titulo: "Pulse Architect", anio: 2023, artista_id: "a4", color: c("oklch(0.55 0.15 60)", "oklch(0.25 0.06 40)") },
  { id: "al6", titulo: "Midnight Brass", anio: 2020, artista_id: "a5", color: c("oklch(0.55 0.15 180)", "oklch(0.25 0.06 200)") },
  { id: "al7", titulo: "Aurora", anio: 2024, artista_id: "a6", color: c("oklch(0.62 0.20 10)", "oklch(0.28 0.10 350)") },
  { id: "al8", titulo: "Forest Whispers", anio: 2022, artista_id: "a7", color: c("oklch(0.55 0.15 150)", "oklch(0.25 0.06 140)") },
  { id: "al9", titulo: "Nebula Echoes", anio: 2025, artista_id: "a8", color: c("oklch(0.55 0.20 260)", "oklch(0.25 0.10 280)") },
];

const titulos = [
  "Echoes", "Drift", "Horizon", "Pulse", "Neon", "Wander", "Falling", "Ember",
  "Tide", "Static", "Mirage", "Glow", "Velvet", "Hollow", "Spark", "Reverie",
  "Lumen", "Quartz", "Solace", "Cinder", "Orbit", "Halcyon", "Bloom", "Nimbus",
];

function makeCanciones(): Cancion[] {
  const out: Cancion[] = [];
  let i = 0;
  for (const a of albumes) {
    for (let k = 0; k < 6; k++) {
      const t = titulos[(i * 7 + k * 3) % titulos.length];
      out.push({
        id: `c${a.id}_${k + 1}`,
        titulo: `${t}${k % 2 === 0 ? "" : " " + (k + 1)}`,
        duracion_seg: 150 + ((i * 13 + k * 19) % 180),
        album_id: a.id,
      });
      i++;
    }
  }
  return out;
}

export const canciones: Cancion[] = makeCanciones();

export function getArtista(id: string) {
  return artistas.find((x) => x.id === id);
}
export function getAlbum(id: string) {
  return albumes.find((x) => x.id === id);
}
export function getCancion(id: string) {
  return canciones.find((x) => x.id === id);
}
export function getArtistaDeCancion(c: Cancion) {
  const al = getAlbum(c.album_id);
  return al ? getArtista(al.artista_id) : undefined;
}
export function cancionesDeArtista(artistaId: string) {
  const alIds = albumes.filter((a) => a.artista_id === artistaId).map((a) => a.id);
  return canciones.filter((c) => alIds.includes(c.album_id));
}
export function albumesDeArtista(artistaId: string) {
  return albumes.filter((a) => a.artista_id === artistaId);
}
export function cancionesDeAlbum(albumId: string) {
  return canciones.filter((c) => c.album_id === albumId);
}

export function formatDur(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTotal(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}
