import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api, type Album, type Artista, type Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SongRow } from "@/components/SongRow";
import { useApp } from "@/store/app";
import { Play } from "lucide-react";

export const Route = createFileRoute("/album/$id")({
  component: AlbumPage,
});

function formatTotal(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

function AlbumPage() {
  const { id } = Route.useParams();
  const play = useApp((s) => s.play);
  const [album, setAlbum] = useState<Album | null>(null);
  const [artista, setArtista] = useState<Artista | null>(null);
  const [tracks, setTracks] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const albumId = Number(id);
    if (Number.isNaN(albumId)) return;

    let active = true;
    setLoading(true);

    api.albumes
      .obtener(albumId)
      .then((loadedAlbum) => {
        if (!active) return;
        setAlbum(loadedAlbum);
        return Promise.all([
          api.canciones.listar({ album_id: albumId }),
          api.artistas.obtener(loadedAlbum.artista_id),
        ]);
      })
      .then(([canciones, artista]) => {
        if (!active) return;
        setTracks(canciones);
        setArtista(artista);
      })
      .catch(() => {
        if (!active) return;
        setAlbum(null);
        setTracks([]);
        setArtista(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const total = useMemo(() => tracks.reduce((acc, c) => acc + c.duracion_seg, 0), [tracks]);

  if (loading) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Cargando álbum...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Álbum no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-8 pt-12 pb-8">
        <div className="flex items-end gap-6">
          <CoverArt className="w-44 h-44 shadow-emboss-lg" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Álbum</div>
            <h1 className="text-5xl font-bold mb-3">{album.titulo}</h1>
            <div className="text-sm text-muted-foreground">
              {artista && (
                <Link to="/artista/$id" params={{ id: String(artista.id) }} className="hover:underline font-medium text-foreground">
                  {artista.nombre}
                </Link>
              )}{" "}
              · {album.anio} · {tracks.length} canciones · {formatTotal(total)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => tracks[0] && play(String(tracks[0].id))}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        <div className="bg-card rounded-lg shadow-emboss p-2">
          {tracks.map((c, i) => (
            <SongRow
              key={c.id}
              cancion={c}
              album={album}
              artista={artista ?? undefined}
              index={i + 1}
              showAlbum={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
