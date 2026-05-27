import { X, ListMusic } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/app";
import { getCancion, type Cancion } from "@/data/catalog";
import { api, type Cancion as ApiCancion } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDur(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QueueDrawer() {
  const isQueueOpen = useApp((s) => s.isQueueOpen);
  const queue = useApp((s) => s.queue);
  const currentIndex = useApp((s) => s.currentIndex);
  const currentSongId = useApp((s) => s.currentSongId);
  const toggleQueueOpen = useApp((s) => s.toggleQueueOpen);
  const playSong = useApp((s) => s.playSong);

  const currentSong = currentSongId ? getCancion(currentSongId) : null;
  // Resolve queue ids to song objects, preferring local catalog, and fetching missing ones from API
  const [fetched, setFetched] = useState<Record<string, ApiCancion | null>>({});

  useEffect(() => {
    let active = true;
    const missing = queue.filter((id) => !getCancion(id) && fetched[id] === undefined);
    if (missing.length === 0) return;
    missing.forEach((id) => {
      const num = Number(id);
      if (Number.isNaN(num)) {
        setFetched((s) => ({ ...s, [id]: null }));
        return;
      }
      api.canciones
        .obtener(num)
        .then((song) => {
          if (!active) return;
          setFetched((s) => ({ ...s, [id]: song }));
        })
        .catch(() => {
          if (!active) return;
          setFetched((s) => ({ ...s, [id]: null }));
        });
    });
    return () => {
      active = false;
    };
  }, [queue.join(","), JSON.stringify(fetched)]);

  const resolveSong = (id: string): Cancion | ApiCancion | null => {
    const local = getCancion(id);
    if (local) return local;
    const apiSong = fetched[id];
    return apiSong ?? null;
  };

  const currentSongObj = currentSongId ? resolveSong(currentSongId) : null;
  const upcomingIds = queue.slice(currentIndex + 1);
  const upcoming = upcomingIds.map(resolveSong).filter((s): s is Cancion | ApiCancion => Boolean(s));

  const queueSongs = queue
    .map((id) => getCancion(id))
    .filter((song): song is Cancion => Boolean(song));

  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full w-72 bg-slate-950 text-slate-100 shadow-2xl z-50 transform transition-transform duration-300",
        isQueueOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <ListMusic className="w-4 h-4" /> Cola de reproducción
        </div>
        <button
          onClick={toggleQueueOpen}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Cerrar cola"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Reproduciendo</div>
          {currentSongObj ? (
            <div className="rounded-2xl bg-slate-900 p-4 shadow-inner">
              <div className="text-sm font-semibold truncate">{currentSongObj.titulo}</div>
              <div className="text-xs text-muted-foreground">{formatDur(currentSongObj.duracion_seg)}</div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900 p-4 text-sm text-muted-foreground">
              No hay canción reproduciéndose.
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Siguientes</div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-slate-900 p-4 text-sm text-muted-foreground">
              No hay más canciones en la cola.
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((song, idx) =>
                song ? (
                  <button
                    key={String((song as any).id)}
                    onClick={() => playSong(String((song as any).id), queue)}
                    className="w-full rounded-2xl bg-slate-900 p-3 text-left transition hover:bg-slate-800"
                  >
                    <div className="text-sm font-medium truncate">{(song as any).titulo}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDur((song as any).duracion_seg)}</span>
                      <span>#{currentIndex + idx + 2}</span>
                    </div>
                  </button>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
