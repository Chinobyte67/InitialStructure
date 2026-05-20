import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { ListMusic, Heart, Disc3 } from "lucide-react";
import { useState, useEffect } from "react";

const getColor = (id: string | number): [string, string] => {
  const colors = [
    ["oklch(0.55 0.22 290)", "oklch(0.30 0.10 240)"] as [string, string],
    ["oklch(0.50 0.18 30)", "oklch(0.25 0.08 20)"] as [string, string],
    ["oklch(0.65 0.20 340)", "oklch(0.30 0.12 320)"] as [string, string],
  ];
  const index = typeof id === "number" ? id : parseInt(String(id).replace(/\D/g, ""), 10);
  const safeIndex = Number.isFinite(index) && index >= 0 ? index : 0;
  return colors[safeIndex % colors.length];
};

export const Route = createFileRoute("/biblioteca")({
  component: BibliotecaPage,
  head: () => ({ meta: [{ title: "Biblioteca — AuraStream" }] }),
});

function BibliotecaPage() {
  const playlists = useApp((s) => s.playlists);
  const [favoritos, setFavoritos] = useState(0);
  const [seguidos, setSeguidos] = useState(0);

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
            <div className="text-xs text-muted-foreground">{favoritos} canciones</div>
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
            <div className="text-xs text-muted-foreground">{seguidos} artistas</div>
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
            {playlists.map((p) => (
              <Link
                key={p.id}
                to="/playlist/$id"
                params={{ id: String(p.id) }}
                className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg transition-shadow"
              >
                <CoverArt colors={getColor(p.id)} className="mb-3" />
                <div className="text-sm font-medium truncate">{p.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  {p.es_publica ? "Pública" : "Privada"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Artistas que seguís</h2>
        {seguidos === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no seguís a nadie.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Seguís {seguidos} artistas.</p>
        )}
      </section>
    </div>
  );
}
