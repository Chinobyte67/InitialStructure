import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { api, type Album, type Artista, type Cancion } from "@/lib/api";
import { SongRow } from "@/components/SongRow";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  component: FavoritosPage,
  head: () => ({ meta: [{ title: "Favoritos — AuraStream" }] }),
});

function FavoritosPage() {
  const favoritos = useApp((s) => s.favoritos);
  const toggleFav = useApp((s) => s.toggleFavorito);
  const [songs, setSongs] = useState<Cancion[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.canciones.listar(), api.albumes.listar(), api.artistas.listar()])
      .then(([canciones, albumes, artistas]) => {
        if (!active) return;
        setSongs(canciones);
        setAlbums(albumes);
        setArtistas(artistas);
      })
      .catch(() => {
        if (!active) return;
        setSongs([]);
        setAlbums([]);
        setArtistas([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const songsById = useMemo(() => new Map(songs.map((c) => [String(c.id), c])), [songs]);
  const albumsById = useMemo(() => new Map(albums.map((a) => [String(a.id), a])), [albums]);
  const artistasById = useMemo(() => new Map(artistas.map((a) => [String(a.id), a])), [artistas]);

  const items = favoritos
    .map((id) => songsById.get(String(id)))
    .filter((c): c is Cancion => Boolean(c));

  return (
    <div>
      <div className="bg-gradient-to-b from-primary/30 to-transparent px-8 pt-12 pb-8">
        <div className="flex items-end gap-6">
          <div className="w-44 h-44 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-emboss-lg">
            <Heart className="w-20 h-20" fill="currentColor" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Playlist</div>
            <h1 className="text-5xl font-bold mb-3">Canciones favoritas</h1>
            <div className="text-sm text-muted-foreground">{items.length} canciones</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        {items.length === 0 ? (
          <p className="text-muted-foreground">
            No marcaste favoritos todavía. Tocá el corazón en cualquier canción.
          </p>
        ) : (
          <div className="bg-card rounded-lg shadow-emboss p-2">
            {items.map((c, i) => {
              const album = albumsById.get(String(c.album_id));
              const artista = album ? artistasById.get(String(album.artista_id)) : undefined;
              return (
                <SongRow
                  key={c.id}
                  cancion={c}
                  album={album}
                  artista={artista}
                  index={i + 1}
                  onRemove={() => toggleFav(String(c.id))}
                  removeLabel="Quitar de favoritos"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
