import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { ListMusic, Heart, Disc3 } from "lucide-react";
import { albumes, artistas, canciones } from "@/data/catalog";

export const Route = createFileRoute("/biblioteca")({
  component: BibliotecaPage,
  head: () => ({ meta: [{ title: "Biblioteca — AuraStream" }] }),
});

function BibliotecaPage() {
  const playlists = useApp((s) => s.playlists);
  const favoritos = useApp((s) => s.favoritos);
  const seguidos = useApp((s) => s.seguidos);

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <SectionHeader title="Tu biblioteca" subtitle="Todo lo que guardaste en un solo lugar" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          to="/favoritos"
          className="bg-card rounded-lg p-4 shadow-emboss flex items-center gap-3 hover:shadow-emboss-lg transition-shadow"
        >
          <div className="w-14 h-14 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-emboss-lg">
            <Heart className="w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <div className="font-semibold">Canciones favoritas</div>
            <div className="text-xs text-muted-foreground">{favoritos.length} canciones</div>
          </div>
        </Link>
        <Link
          to="/seguidos"
          className="bg-card rounded-lg p-4 shadow-emboss flex items-center gap-3 hover:shadow-emboss-lg transition-shadow"
        >
          <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center shadow-deboss">
            <Disc3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Artistas seguidos</div>
            <div className="text-xs text-muted-foreground">{seguidos.length} artistas</div>
          </div>
        </Link>
        <div className="bg-card rounded-lg p-4 shadow-emboss flex items-center gap-3">
          <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center shadow-deboss">
            <ListMusic className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Playlists</div>
            <div className="text-xs text-muted-foreground">{playlists.length} en total</div>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Tus playlists</h2>
        {playlists.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no creaste ninguna. Usá el + en la barra lateral.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playlists.map((p) => {
              const first = p.tracks[0];
              const cancion = first ? canciones.find((c) => c.id === first.cancion_id) : null;
              const al = cancion ? albumes.find((a) => a.id === cancion.album_id) : null;
              const colors = al?.color ?? (["oklch(0.30 0.10 280)", "oklch(0.20 0.05 280)"] as [string, string]);
              return (
                <Link
                  key={p.id}
                  to="/playlist/$id"
                  params={{ id: p.id }}
                  className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg transition-shadow"
                >
                  <CoverArt colors={colors} className="mb-3" />
                  <div className="text-sm font-medium truncate">{p.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.tracks.length} canciones · {p.es_publica ? "Pública" : "Privada"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Artistas que seguís</h2>
        {seguidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no seguís a nadie.</p>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-3">
            {seguidos.map((id) => {
              const a = artistas.find((x) => x.id === id);
              if (!a) return null;
              return (
                <Link
                  key={a.id}
                  to="/artista/$id"
                  params={{ id: a.id }}
                  className="flex flex-col items-center w-32 shrink-0"
                >
                  <CoverArt colors={a.color} rounded="rounded-full" className="w-28 h-28 mb-2" />
                  <div className="text-sm font-medium truncate w-full text-center">{a.nombre}</div>
                  <div className="text-xs text-muted-foreground">{a.genero_musical}</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
