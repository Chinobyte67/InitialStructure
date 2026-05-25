import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { CoverArt } from "@/components/CoverArt";
import { useSession } from "@/store/session";
import { wrappedAnio } from "@/lib/stats.functions";

export const Route = createFileRoute("/wrapped")({
  component: WrappedPage,
  head: () => ({ meta: [{ title: "Tu resumen anual — AuraStream" }] }),
});

type WrappedSong = {
  id: string;
  titulo: string;
  duracion_seg: number;
  albumes: { titulo: string; artistas: { id: string; nombre: string } };
};

type WrappedArtist = {
  id: string;
  nombre: string;
  genero_musical: string;
};

type WrappedGenre = {
  genero: string;
  plays: number;
};

type WrappedSummary = {
  anio: number;
  minutos_totales: number;
  canciones_distintas: number;
  top_canciones: Array<{ cancion_id: string; plays: number; cancion: WrappedSong }>;
  top_artistas: Array<{ plays: number; artista: WrappedArtist }>;
  top_generos: WrappedGenre[];
};

function WrappedPage() {
  const currentYear = new Date().getFullYear();
  const sessionUser = useSession((s) => s.user);
  const [year, setYear] = useState<number>(currentYear);
  const [summary, setSummary] = useState<WrappedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!sessionUser) {
      setSummary(null);
      setError("Iniciá sesión para ver tu Wrapped anual.");
      setLoading(false);
      return;
    }

    const userId = Number(String(sessionUser.id).replace(/\D/g, "")) || 1;
    wrappedAnio({ anio: year, usuario_id: userId })
      .then((data) => setSummary(data))
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar Wrapped"))
      .finally(() => setLoading(false));
  }, [year, sessionUser]);

  if (loading) {
    return (
      <div className="px-8 pt-8 pb-12 max-w-[1400px]">
        <SectionHeader title={`Wrapped ${year}`} />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="px-8 pt-8 pb-12 max-w-[1400px]">
        <SectionHeader title={`Wrapped ${year}`} />
        <p className="text-destructive">{error ?? "No se encontró el resumen"}</p>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-12 max-w-[1400px]">
      <div className="bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-2xl p-8 mb-10 shadow-emboss">
        <div className="text-xs uppercase tracking-widest text-primary mb-2">Tu año musical</div>
        <h1 className="text-5xl font-bold mb-2">Wrapped {year}</h1>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Minutos escuchados" value={summary.minutos_totales.toLocaleString()} />
          <Stat label="Canciones distintas" value={String(summary.canciones_distintas)} />
          <Stat label="Top canciones" value={String(summary.top_canciones.length)} />
          <Stat label="Top artistas" value={String(summary.top_artistas.length)} />
        </div>
      </div>

      <section className="mb-10">
        <SectionHeader title="Top 5 canciones" />
        <ol className="space-y-2">
          {summary.top_canciones.map((row, i) => (
            <li key={row.cancion_id} className="flex items-center gap-4 bg-card rounded-lg p-3 shadow-emboss">
              <div className="text-3xl font-bold text-primary w-10 text-center tabular-nums">{i + 1}</div>
              <CoverArt colors={["oklch(0.45 0.18 260)", "oklch(0.20 0.08 260)"]} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{row.cancion.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{row.cancion.albumes.artistas.nombre}</div>
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">{row.plays} reproducciones</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <SectionHeader title="Top 5 artistas" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {summary.top_artistas.map((row, i) => (
            <Link
              key={row.artista.id}
              to="/artista/$id"
              params={{ id: row.artista.id }}
              className="bg-card rounded-lg p-4 shadow-emboss text-center hover:shadow-emboss-lg"
            >
              <div className="text-xs text-primary font-semibold mb-2">#{i + 1}</div>
              <CoverArt colors={["oklch(0.45 0.18 260)", "oklch(0.20 0.08 260)"]} rounded="rounded-full" className="w-24 h-24 mx-auto mb-3" />
              <div className="font-medium truncate">{row.artista.nombre}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{row.plays} reproducciones</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Top 3 géneros" />
        <div className="grid grid-cols-3 gap-4">
          {summary.top_generos.map((g, i) => (
            <div key={g.genero} className="bg-card rounded-lg p-6 shadow-emboss text-center">
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
