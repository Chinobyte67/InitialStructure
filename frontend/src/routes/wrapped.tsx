import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp, topCanciones, topArtistas, topGeneros, isReproValida } from "@/store/app";
import { artistas, getAlbum, getArtistaDeCancion } from "@/data/catalog";
import { CoverArt } from "@/components/CoverArt";
import { SectionHeader } from "@/components/SectionHeader";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/wrapped")({
  component: WrappedPage,
  head: () => ({ meta: [{ title: "Tu resumen anual — AuraStream" }] }),
});

function WrappedPage() {
  const reps = useApp((s) => s.reproducciones);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  const filtered = useMemo(
    () => reps.filter((r) => new Date(r.fecha).getFullYear() === year),
    [reps, year]
  );

  const validas = useMemo(() => filtered.filter(isReproValida), [filtered]);
  const top5C = useMemo(() => topCanciones(filtered, 5), [filtered]);
  const top5A = useMemo(() => topArtistas(filtered, 5), [filtered]);
  const top3G = useMemo(() => topGeneros(filtered, 3), [filtered]);

  const totalMin = Math.round(validas.reduce((a, r) => a + r.segundos_escuchados, 0) / 60);
  const distinct = new Set(validas.map((r) => r.cancion_id)).size;

  const years = useMemo(() => {
    const set = new Set(reps.map((r) => new Date(r.fecha).getFullYear()));
    set.add(currentYear);
    return [...set].sort((a, b) => b - a);
  }, [reps, currentYear]);

  if (filtered.length === 0) {
    return (
      <div className="px-8 pt-8 pb-12 max-w-[1400px]">
        <SectionHeader title={`Resumen ${year}`} />
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-muted-foreground">Año:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-input shadow-deboss px-3 py-1.5 rounded-md text-sm border border-border"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className="text-muted-foreground">
          No tenés reproducciones registradas en {year}.
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <div className="bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-2xl p-8 mb-10 shadow-emboss">
        <div className="text-xs uppercase tracking-widest text-primary mb-2">Tu año musical</div>
        <h1 className="text-5xl font-bold mb-2">Wrapped {year}</h1>
        <div className="flex items-center gap-3 mb-6">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-input shadow-deboss px-3 py-1.5 rounded-md text-sm border border-border"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Minutos escuchados" value={totalMin.toLocaleString()} />
          <Stat label="Canciones distintas" value={String(distinct)} />
          <Stat label="Reproducciones válidas" value={String(validas.length)} />
          <Stat label="Reproducciones totales" value={String(filtered.length)} />
        </div>
      </div>

      <section className="mb-10">
        <SectionHeader title="Top 5 canciones" />
        <ol className="space-y-2">
          {top5C.map((row, i) => {
            const al = getAlbum(row.cancion.album_id)!;
            const a = getArtistaDeCancion(row.cancion);
            return (
              <li key={row.cancion.id} className="flex items-center gap-4 bg-card rounded-lg p-3 shadow-emboss">
                <div className="text-3xl font-bold text-primary w-10 text-center tabular-nums">
                  {i + 1}
                </div>
                <CoverArt colors={al.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{row.cancion.titulo}</div>
                  <div className="text-xs text-muted-foreground truncate">{a?.nombre}</div>
                </div>
                <div className="text-sm text-muted-foreground tabular-nums">{row.plays} reproducciones</div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mb-10">
        <SectionHeader title="Top 5 artistas" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {top5A.map((row, i) => {
            const a = artistas.find((x) => x.id === row.id);
            if (!a) return null;
            return (
              <Link
                key={a.id}
                to="/artista/$id"
                params={{ id: a.id }}
                className="bg-card rounded-lg p-4 shadow-emboss text-center hover:shadow-emboss-lg"
              >
                <div className="text-xs text-primary font-semibold mb-2">#{i + 1}</div>
                <CoverArt colors={a.color} rounded="rounded-full" className="w-24 h-24 mx-auto mb-3" />
                <div className="font-medium truncate">{a.nombre}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {row.plays} reproducciones
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="Top 3 géneros" />
        <div className="grid grid-cols-3 gap-4">
          {top3G.map((g, i) => (
            <div
              key={g.genero}
              className="bg-card rounded-lg p-6 shadow-emboss text-center"
            >
              <div className="text-xs text-primary font-semibold mb-2">#{i + 1}</div>
              <div className="text-2xl font-bold mb-1">{g.genero}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{g.plays} reproducciones</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/50 rounded-lg p-4 shadow-deboss">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-bold text-primary tabular-nums">{value}</div>
    </div>
  );
}
