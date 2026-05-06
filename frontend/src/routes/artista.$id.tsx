import { createFileRoute, Link } from "@tanstack/react-router";
import { artistas, albumesDeArtista, cancionesDeArtista } from "@/data/catalog";
import { useApp } from "@/store/app";
import { CoverArt } from "@/components/CoverArt";
import { SongRow } from "@/components/SongRow";
import { Play, Check, Plus } from "lucide-react";

export const Route = createFileRoute("/artista/$id")({
  component: ArtistaPage,
});

function ArtistaPage() {
  const { id } = Route.useParams();
  const a = artistas.find((x) => x.id === id);
  const seguidos = useApp((s) => s.seguidos);
  const toggle = useApp((s) => s.toggleSeguir);
  const play = useApp((s) => s.play);

  if (!a) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Artista no encontrado.</p>
      </div>
    );
  }

  const albs = albumesDeArtista(a.id);
  const cans = cancionesDeArtista(a.id);
  const top = cans.slice(0, 5);
  const isFollowing = seguidos.includes(a.id);

  return (
    <div>
      <div
        className="px-8 pt-12 pb-8"
        style={{ background: `linear-gradient(180deg, ${a.color[0]}, transparent)` }}
      >
        <div className="flex items-end gap-6">
          <CoverArt colors={a.color} rounded="rounded-full" className="w-44 h-44 shadow-emboss-lg" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Artista</div>
            <h1 className="text-5xl font-bold mb-3">{a.nombre}</h1>
            <div className="text-sm text-muted-foreground">
              {a.genero_musical} · {a.pais}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => top[0] && play(top[0].id)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
          <button
            onClick={() => toggle(a.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-emboss transition-colors ${
              isFollowing
                ? "bg-primary/15 text-primary border border-primary/40"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {isFollowing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isFollowing ? "Siguiendo" : "Seguir"}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px] space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-3">Populares</h2>
          <div className="bg-card rounded-lg shadow-emboss p-2">
            {top.map((c, i) => (
              <SongRow key={c.id} cancion={c} index={i + 1} showAlbum={false} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Discografía</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albs.map((al) => (
              <Link
                key={al.id}
                to="/album/$id"
                params={{ id: al.id }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg"
              >
                <CoverArt colors={al.color} className="mb-3" />
                <div className="text-sm font-medium truncate">{al.titulo}</div>
                <div className="text-xs text-muted-foreground">{al.anio}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
