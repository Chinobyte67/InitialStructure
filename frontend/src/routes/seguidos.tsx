import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { api, type Artista } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/seguidos")({
  component: SeguidosPage,
  head: () => ({ meta: [{ title: "Artistas seguidos — AuraStream" }] }),
});

function SeguidosPage() {
  const seguidos = useApp((s) => s.seguidos);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.artistas
      .listar()
      .then((data) => {
        if (active) setArtistas(data);
      })
      .catch(() => {
        if (active) setArtistas([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = artistas.filter((a) => seguidos.includes(String(a.id)));

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <SectionHeader title="Artistas que seguís" subtitle={`${items.length} artistas`} />
      {loading ? (
        <p className="text-muted-foreground">Cargando artistas...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no seguís a nadie. Entrá a un artista y tocá "Seguir".
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {items.map((a) => (
            <Link
              key={a.id}
              to="/artista/$id"
              params={{ id: String(a.id) }}
              className="bg-card rounded-lg p-4 shadow-emboss hover:shadow-emboss-lg flex flex-col items-center"
            >
              <CoverArt rounded="rounded-full" className="w-28 h-28 mb-3" />
              <div className="text-sm font-medium truncate w-full text-center">{a.nombre}</div>
              <div className="text-xs text-muted-foreground">{a.genero_musical}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
