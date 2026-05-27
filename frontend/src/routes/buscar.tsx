import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/store/app";
import { api, Artista, Album, Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { SongRow } from "@/components/SongRow";

export const Route = createFileRoute("/buscar")({
  component: BuscarPage,
  head: () => ({ meta: [{ title: "Buscar — AuraStream" }] }),
});

type SearchResults = {
  canciones: Cancion[];
  artistas: Artista[];
  albumes: Album[];
};

const getColor = (id: number): [string, string] => {
  const colors = [
    ["oklch(0.55 0.22 290)", "oklch(0.30 0.10 240)"] as [string, string],
    ["oklch(0.50 0.18 30)", "oklch(0.25 0.08 20)"] as [string, string],
    ["oklch(0.65 0.20 340)", "oklch(0.30 0.12 320)"] as [string, string],
  ];
  return colors[id % colors.length];
};

function BuscarPage() {
  const [q, setQ] = useState("");
  const playSong = useApp((s) => s.playSong);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    api.buscar
      .buscar(term)
      .then((data) => setResults(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudo buscar");
        setResults(null);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué querés escuchar?"
          className="w-full max-w-xl bg-input shadow-deboss text-foreground placeholder:text-muted-foreground pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading && <p className="text-muted-foreground">Buscando...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!q.trim() && (
        <div className="text-muted-foreground">
          Buscá canciones, artistas o álbumes por nombre.
        </div>
      )}

      {results && (
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Artistas <span className="text-muted-foreground font-normal">({results.artistas.length})</span>
            </h2>
            {results.artistas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-3">
                {results.artistas.map((a) => (
                  <Link
                    key={a.id}
                    to="/artista/$id"
                    params={{ id: String(a.id) }}
                    className="flex flex-col items-center w-32 shrink-0"
                  >
                    <CoverArt colors={getColor(a.id)} rounded="rounded-full" className="w-28 h-28 mb-2" />
                    <div className="text-sm font-medium truncate w-full text-center">{a.nombre}</div>
                    <div className="text-xs text-muted-foreground">{a.genero_musical}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Álbumes <span className="text-muted-foreground font-normal">({results.albumes.length})</span>
            </h2>
            {results.albumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albumes.map((al) => (
                  <Link
                    key={al.id}
                    to="/album/$id"
                    params={{ id: String(al.id) }}
                    className="bg-card rounded-lg p-3 shadow-emboss hover:shadow-emboss-lg"
                  >
                    <CoverArt colors={getColor(al.id)} className="mb-3" />
                    <div className="text-sm font-medium truncate">{al.titulo}</div>
                    <div className="text-xs text-muted-foreground truncate">{al.artista?.nombre ?? "Artista"}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Canciones <span className="text-muted-foreground font-normal">({results.canciones.length})</span>
            </h2>
            {results.canciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin coincidencias.</p>
            ) : (
              <div className="bg-card rounded-lg shadow-emboss p-2">
                {results.canciones.map((c, i) => (
                  <SongRow
                    key={c.id}
                    cancion={c}
                    index={i + 1}
                    contextQueue={results.canciones.map((track) => String(track.id))}
                    onPlay={(id, queue) => playSong(id, queue)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
