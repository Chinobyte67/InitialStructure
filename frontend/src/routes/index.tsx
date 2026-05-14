import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { api, Artista, Album, Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { useMemo, useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const getColor = (id: number): [string, string] => {
  const colors = [
    ["oklch(0.55 0.22 290)", "oklch(0.30 0.10 240)"] as [string, string],
    ["oklch(0.50 0.18 30)", "oklch(0.25 0.08 20)"] as [string, string],
    ["oklch(0.65 0.20 340)", "oklch(0.30 0.12 320)"] as [string, string],
    ["oklch(0.55 0.15 60)", "oklch(0.25 0.06 40)"] as [string, string],
  ];
  return colors[id % colors.length];
};

function Index() {
  const user = useApp((s) => s.user);
  const playlists = useApp((s) => s.playlists);
  
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albs, arts, cans] = await Promise.all([
          api.albumes.listar(),
          api.artistas.listar(),
          api.canciones.listar(),
        ]);
        setAlbumes(albs);
        setArtistas(arts);
        setCanciones(cans);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = useMemo(() => albumes.slice(0, 6), [albumes]);
  const topArt = useMemo(() => artistas.slice(0, 6), [artistas]);

  const getArtista = (artistaId: number) => artistas.find((x) => x.id === artistaId);

  if (loading) {
    return <div className="px-8 pt-8">Cargando...</div>;
  }

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Bienvenido, {user.nombre || "Usuario"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {playlists.length} playlists · {canciones.length} canciones en el catálogo
        </p>
      </div>

      <section className="mb-12">
        <SectionHeader title="Álbumes destacados" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {featured.map((al) => {
            const a = getArtista(al.artista_id);
            return (
              <Link
                key={al.id}
                to="/album/$id"
                params={{ id: String(al.id) }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg transition-shadow"
              >
                <CoverArt colors={getColor(al.id)} className="mb-3" />
                <div className="text-sm font-medium truncate">{al.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{a?.nombre}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader title="Artistas destacados" />
        <div className="flex gap-6 overflow-x-auto pb-4">
          {topArt.map((a) => (
            <Link
              key={a.id}
              to="/artista/$id"
              params={{ id: String(a.id) }}
              className="flex flex-col items-center w-32 shrink-0 group"
            >
              <CoverArt
                colors={getColor(a.id)}
                rounded="rounded-full"
                className="w-28 h-28 aspect-square mb-2 group-hover:shadow-emboss-lg"
              />
              <div className="text-sm font-medium truncate w-full text-center">{a.nombre}</div>
              <div className="text-xs text-muted-foreground">{a.genero_musical}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Canciones disponibles" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {canciones.slice(0, 6).map((c) => {
            const al = albumes.find((x) => x.id === c.album_id);
            const a = al ? getArtista(al.artista_id) : null;
            return (
              <Link
                key={c.id}
                to="/album/$id"
                params={{ id: String(al?.id || 1) }}
                className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-emboss hover:bg-muted transition-colors"
              >
                <CoverArt colors={getColor(al?.id || c.id)} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.titulo}</div>
                  <div className="text-xs text-muted-foreground truncate">{a?.nombre || "Desconocido"}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
