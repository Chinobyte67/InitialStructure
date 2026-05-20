import { useEffect, useRef, useState } from "react";
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
import { api, type Album, type Artista, type Cancion } from "@/lib/api";
import { CoverArt } from "@/components/CoverArt";
import { cn } from "@/lib/utils";

function formatDur(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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

  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [artista, setArtista] = useState<Artista | null>(null);

  // Elemento <audio> real para reproducir el archivo alojado en Cloudinary.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => tick(1), 1000);
    return () => clearInterval(id);
  }, [isPlaying, tick]);

  // Cargar el audio cuando cambia la canción.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = cancion?.url_audio ?? "";
    if (audio.src !== src) {
      audio.src = src;
      audio.currentTime = 0;
    }
  }, [cancion?.id, cancion?.url_audio]);

  // Sincronizar play/pausa del <audio> con el estado del reproductor.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !cancion?.url_audio) return;
    if (isPlaying) {
      audio.play().catch(() => {
        /* el navegador puede bloquear autoplay hasta una interacción del usuario */
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, cancion?.id, cancion?.url_audio]);

  useEffect(() => {
    if (!currentSongId) {
      setCancion(null);
      setAlbum(null);
      setArtista(null);
      return;
    }

    const songId = Number(currentSongId);
    if (Number.isNaN(songId)) {
      setCancion(null);
      setAlbum(null);
      setArtista(null);
      return;
    }

    let active = true;
    api.canciones
      .obtener(songId)
      .then((song) => {
        if (!active) return;
        setCancion(song);
        return api.albumes.obtener(Number(song.album_id));
      })
      .then((loadedAlbum) => {
        if (!active || !loadedAlbum) return;
        setAlbum(loadedAlbum);
        return api.artistas.obtener(Number(loadedAlbum.artista_id));
      })
      .then((loadedArtista) => {
        if (!active) return;
        setArtista(loadedArtista);
      })
      .catch(() => {
        if (active) {
          setCancion(null);
          setAlbum(null);
          setArtista(null);
        }
      });

    return () => {
      active = false;
    };
  }, [currentSongId]);

  const isFav = cancion ? favoritos.includes(String(cancion.id)) : false;
  const pct = cancion ? Math.min(100, (progress / cancion.duracion_seg) * 100) : 0;

  return (
    <footer className="h-22 bg-card border-t border-border px-4 py-3 flex items-center justify-between gap-6 shadow-emboss">
      <audio ref={audioRef} preload="metadata" />
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        {cancion && album ? (
          <>
            <CoverArt size="sm" />
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
              onClick={() => toggleFavorito(String(cancion.id))}
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
