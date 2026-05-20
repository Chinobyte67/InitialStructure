import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/app";
import { api, type Artista, type Album, type Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/recomendaciones")({
  component: RecoPage,
  head: () => ({ meta: [{ title: "Recomendaciones — AuraStream" }] }),
});

function RecoPage() {
  const reps = useApp((s) => s.reproducciones);
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

  const albumsById = useMemo(() => new Map(albums.map((al) => [String(al.id), al])), [albums]);
  const artistasById = useMemo(() => new Map(artistas.map((a) => [String(a.id), a])), [artistas]);
  const songsById = useMemo(() => new Map(songs.map((c) => [String(c.id), c])), [songs]);

  const getArtistaOfSong = (cancion: Cancion) => {
    const album = albumsById.get(String(cancion.album_id));
    return album ? artistasById.get(String(album.artista_id)) : undefined;
  };

  const recos = useMemo(() => {
    const recientes = new Set(
      reps
        .filter((r) => Date.now() - new Date(r.fecha).getTime() < 30 * 86400000)
        .map((r) => String(r.cancion_id))
    );

    const validas = reps.filter((r) => {
      const cancion = songsById.get(String(r.cancion_id));
      if (!cancion) return false;
      return r.segundos_escuchados / cancion.duracion_seg >= 0.3;
    });

    const generos = Array.from(
      validas.reduce<Map<string, number>>((map, r) => {
        const cancion = songsById.get(String(r.cancion_id));
        const artista = cancion ? getArtistaOfSong(cancion) : undefined;
        if (!artista) return map;
        map.set(artista.genero_musical, (map.get(artista.genero_musical) ?? 0) + 1);
        return map;
      }, new Map())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genero]) => genero);

    if (validas.length < 5 || generos.length === 0) {
      return songs.filter((c) => !recientes.has(String(c.id))).slice(0, 10);
    }

    return songs
      .filter((c) => {
        if (recientes.has(String(c.id))) return false;
        const artista = getArtistaOfSong(c);
        return artista ? generos.includes(artista.genero_musical) : false;
      })
      .slice(0, 10);
  }, [reps, songs, albumsById, artistasById, songsById]);

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <SectionHeader
        title="Para vos"
        subtitle="Basado en los géneros que más escuchás. Excluye lo que reproduciste en los últimos 30 días."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {recos.map((c) => {
          const al = albumsById.get(String(c.album_id));
          const a = getArtistaOfSong(c);
          return (
            <Link
              key={c.id}
              to="/album/$id"
              params={{ id: String(al?.id ?? c.album_id) }}
              className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg"
            >
              <CoverArt className="mb-3" />
              <div className="text-sm font-medium truncate">{c.titulo}</div>
              <div className="text-xs text-muted-foreground truncate">{a?.nombre ?? "Artista"}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
