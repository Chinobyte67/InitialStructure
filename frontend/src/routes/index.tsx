import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp, recomendaciones } from "@/store/app";
import {
  artistas,
  albumes,
  canciones,
  getAlbum,
  getArtistaDeCancion,
} from "@/data/catalog";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

// removed greeting function as it's no longer used

function Index() {
  const user = useApp((s) => s.user);
  const reps = useApp((s) => s.reproducciones);
  const playlists = useApp((s) => s.playlists);

  const featured = useMemo(() => albumes.slice(0, 6), []);
  const topArt = useMemo(() => artistas.slice(0, 6), []);
  const recientes = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof reps = [];
    for (let i = reps.length - 1; i >= 0 && out.length < 6; i--) {
      const r = reps[i];
      if (!seen.has(r.cancion_id)) {
        seen.add(r.cancion_id);
        out.push(r);
      }
    }
    return out;
  }, [reps]);
  const recos = useMemo(() => recomendaciones(reps, 6), [reps]);

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Bienvenido, {user.nombre}
        </h1>
        <p className="text-muted-foreground mt-1">
          {playlists.length} playlists · {reps.length} reproducciones registradas
        </p>
      </div>

      <section className="mb-12">
        <SectionHeader title="Álbumes destacados" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {featured.map((al) => {
            const a = artistas.find((x) => x.id === al.artista_id);
            return (
              <Link
                key={al.id}
                to="/album/$id"
                params={{ id: al.id }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg transition-shadow"
              >
                <CoverArt colors={al.color} className="mb-3" />
                <div className="text-sm font-medium truncate">{al.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{a?.nombre}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader title="Tus artistas top" />
        <div className="flex gap-6 overflow-x-auto pb-4">
          {topArt.map((a) => (
            <Link
              key={a.id}
              to="/artista/$id"
              params={{ id: a.id }}
              className="flex flex-col items-center w-32 shrink-0 group"
            >
              <CoverArt
                colors={a.color}
                rounded="rounded-full"
                className="w-28 h-28 aspect-square mb-2 group-hover:shadow-emboss-lg"
              />
              <div className="text-sm font-medium truncate w-full text-center">{a.nombre}</div>
              <div className="text-xs text-muted-foreground">{a.genero_musical}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader title="Reproducidas recientemente" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recientes.map((r) => {
            const c = canciones.find((x) => x.id === r.cancion_id)!;
            const al = getAlbum(c.album_id)!;
            const a = getArtistaDeCancion(c)!;
            return (
              <Link
                key={r.id}
                to="/album/$id"
                params={{ id: al.id }}
                className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-emboss hover:bg-muted transition-colors"
              >
                <CoverArt colors={al.color} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.titulo}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.nombre}</div>
                </div>
              </Link>
            );
          })}
          {recientes.length === 0 && (
            <p className="text-sm text-muted-foreground">Empezá a escuchar para ver historial.</p>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Recomendado para vos" subtitle="Según tu género más escuchado" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {recos.map((c) => {
            const al = getAlbum(c.album_id)!;
            const a = getArtistaDeCancion(c)!;
            return (
              <Link
                key={c.id}
                to="/album/$id"
                params={{ id: al.id }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg transition-shadow"
              >
                <CoverArt colors={al.color} className="mb-3" />
                <div className="text-sm font-medium truncate">{c.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{a.nombre}</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
