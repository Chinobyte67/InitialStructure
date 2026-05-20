import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp, recomendaciones } from "@/store/app";
import { api, Artista, Album, Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { useMemo } from "react";

export const Route = createFileRoute("/recomendaciones")({
  component: RecoPage,
  head: () => ({ meta: [{ title: "Recomendaciones — AuraStream" }] }),
});

function RecoPage() {
  const reps = useApp((s) => s.reproducciones);
  const recos = useMemo(() => recomendaciones(reps, 10), [reps]);

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <SectionHeader
        title="Para vos"
        subtitle="Basado en los géneros que más escuchás. Excluye lo que reproduciste en los últimos 30 días."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {recos.map((c) => {
          const al = getAlbum(c.album_id)!;
          const a = getArtistaDeCancion(c)!;
          return (
            <Link
              key={c.id}
              to="/album/$id"
              params={{ id: al.id }}
              className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg"
            >
              <CoverArt colors={al.color} className="mb-3" />
              <div className="text-sm font-medium truncate">{c.titulo}</div>
              <div className="text-xs text-muted-foreground truncate">{a.nombre}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
