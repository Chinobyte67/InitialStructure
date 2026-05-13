import { createFileRoute, Link } from "@tanstack/react-router";
import { albumes, getArtista, cancionesDeAlbum, formatTotal } from "@/data/catalog";
import { CoverArt } from "@/components/CoverArt";
import { SongRow } from "@/components/SongRow";
import { useApp } from "@/store/app";
import { Play } from "lucide-react";

export const Route = createFileRoute("/album/$id")({
  component: AlbumPage,
});

function AlbumPage() {
  const { id } = Route.useParams();
  const al = albumes.find((x) => x.id === id);
  const play = useApp((s) => s.play);
  if (!al) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Álbum no encontrado.</p>
      </div>
    );
  }
  const a = getArtista(al.artista_id);
  const tracks = cancionesDeAlbum(al.id);
  const total = tracks.reduce((acc, c) => acc + c.duracion_seg, 0);

  return (
    <div>
      <div
        className="px-8 pt-12 pb-8"
        style={{ background: `linear-gradient(180deg, ${al.color[0]}, transparent)` }}
      >
        <div className="flex items-end gap-6">
          <CoverArt colors={al.color} className="w-44 h-44 shadow-emboss-lg" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Álbum</div>
            <h1 className="text-5xl font-bold mb-3">{al.titulo}</h1>
            <div className="text-sm text-muted-foreground">
              {a && (
                <Link to="/artista/$id" params={{ id: a.id }} className="hover:underline font-medium text-foreground">
                  {a.nombre}
                </Link>
              )}{" "}
              · {al.anio} · {tracks.length} canciones · {formatTotal(total)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => tracks[0] && play(tracks[0].id)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        <div className="bg-card rounded-lg shadow-emboss p-2">
          {tracks.map((c, i) => (
            <SongRow key={c.id} cancion={c} index={i + 1} showAlbum={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
