import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/app";
import { api, type Artista, type Album, type Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SongRow } from "@/components/SongRow";
import { Play, Check, Plus } from "lucide-react";

export const Route = createFileRoute("/artista/$id")({
  component: ArtistaPage,
});

function ArtistaPage() {
  const { id } = Route.useParams();
  const seguidos = useApp((s) => s.seguidos);
  const toggle = useApp((s) => s.toggleSeguir);
  const playSong = useApp((s) => s.playSong);
  const [artista, setArtista] = useState<Artista | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const artistaId = Number(id);
    if (Number.isNaN(artistaId)) return;

    let active = true;
    setLoading(true);

    Promise.all([
      api.artistas.obtener(artistaId),
      api.albumes.listar({ artista_id: artistaId }),
      api.canciones.listar(),
    ])
      .then(([artista, albumes, canciones]) => {
        if (!active) return;
        setArtista(artista);
        setAlbums(albumes);
        const albumIds = new Set(albumes.map((al) => String(al.id)));
        setSongs(canciones.filter((c) => albumIds.has(String(c.album_id))));
      })
      .catch(() => {
        if (!active) return;
        setArtista(null);
        setAlbums([]);
        setSongs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const topTracks = useMemo(() => songs.slice(0, 5), [songs]);
  const isFollowing = artista ? seguidos.includes(String(artista.id)) : false;

  if (loading) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Cargando artista...</p>
      </div>
    );
  }

  if (!artista) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Artista no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-8 pt-12 pb-8">
        <div className="flex items-end gap-6">
          <CoverArt rounded="rounded-full" className="w-44 h-44 shadow-emboss-lg" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Artista</div>
            <h1 className="text-5xl font-bold mb-3">{artista.nombre}</h1>
            <div className="text-sm text-muted-foreground">
              {artista.genero_musical} · {artista.pais}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => topTracks[0] && playSong(String(topTracks[0].id), topTracks.map((c) => String(c.id)))}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
          <button
            onClick={() => artista && toggle(String(artista.id))}
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
            {topTracks.map((c, i) => (
              <SongRow
                key={c.id}
                cancion={c}
                album={albums.find((al) => String(al.id) === String(c.album_id))}
                artista={artista}
                index={i + 1}
                showAlbum={false}
                contextQueue={topTracks.map((track) => String(track.id))}
                onPlay={(id, queue) => playSong(id, queue)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Discografía</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((al) => (
              <Link
                key={al.id}
                to="/album/$id"
                params={{ id: String(al.id) }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg"
              >
                <CoverArt className="mb-3" />
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
