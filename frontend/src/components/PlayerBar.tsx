import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  Shuffle,
  Repeat,
} from "lucide-react";
import { useApp } from "@/store/app";
import { getAlbum, getCancion, getArtistaDeCancion, formatDur } from "@/data/catalog";
import { CoverArt } from "@/components/CoverArt";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const currentSongId = useApp((s) => s.currentSongId);
  const isPlaying = useApp((s) => s.isPlaying);
  const progress = useApp((s) => s.progress);
  const togglePlay = useApp((s) => s.togglePlay);
  const next = useApp((s) => s.next);
  const prev = useApp((s) => s.prev);
  const tick = useApp((s) => s.tick);
  const favoritos = useApp((s) => s.favoritos);
  const toggleFavorito = useApp((s) => s.toggleFavorito);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => tick(1), 1000);
    return () => clearInterval(id);
  }, [isPlaying, tick]);

  const cancion = currentSongId ? getCancion(currentSongId) : null;
  const album = cancion ? getAlbum(cancion.album_id) : null;
  const artista = cancion ? getArtistaDeCancion(cancion) : null;
  const isFav = cancion ? favoritos.includes(cancion.id) : false;
  const pct = cancion ? Math.min(100, (progress / cancion.duracion_seg) * 100) : 0;

  return (
    <footer className="h-22 bg-card border-t border-border px-4 py-3 flex items-center justify-between gap-6 shadow-emboss">
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        {cancion && album ? (
          <>
            <CoverArt colors={album.color} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{cancion.titulo}</div>
              {artista && (
                <Link
                  to="/artista/$id"
                  params={{ id: artista.id }}
                  className="text-xs text-muted-foreground hover:text-primary truncate block"
                >
                  {artista.nombre}
                </Link>
              )}
            </div>
            <button
              onClick={() => toggleFavorito(cancion.id)}
              className={cn(
                "ml-2 transition-colors",
                isFav ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Favorito"
            >
              <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
            </button>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Nada sonando</div>
        )}
      </div>

      <div className="flex flex-col items-center flex-1 max-w-2xl">
        <div className="flex items-center gap-5 mb-1.5">
          <button className="text-muted-foreground hover:text-foreground" aria-label="Aleatorio">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={prev} className="text-muted-foreground hover:text-foreground" aria-label="Anterior">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emboss-lg hover:scale-105 transition-transform"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={next} className="text-muted-foreground hover:text-foreground" aria-label="Siguiente">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground" aria-label="Repetir">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">
            {cancion ? formatDur(progress) : "0:00"}
          </span>
          <div className="flex-grow h-1 rounded-full bg-muted shadow-deboss overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground w-9">
            {cancion ? formatDur(cancion.duracion_seg) : "0:00"}
          </span>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end gap-3">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <div className="w-24 h-1 rounded-full bg-muted shadow-deboss overflow-hidden">
          <div className="h-full w-2/3 bg-primary/70" />
        </div>
      </div>
    </footer>
  );
}
