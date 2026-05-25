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
import { canciones } from "@/data/catalog";
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
  const volume = useApp((s) => s.volume);
  const togglePlay = useApp((s) => s.togglePlay);
  const play = useApp((s) => s.play);
  const next = useApp((s) => s.next);
  const prev = useApp((s) => s.prev);
  const tick = useApp((s) => s.tick);
  const setVolume = useApp((s) => s.setVolume);
  const setProgress = useApp((s) => s.setProgress);
  const favoritos = useApp((s) => s.favoritos);
  const toggleFavorito = useApp((s) => s.toggleFavorito);

  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [artista, setArtista] = useState<Artista | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");

  // Elemento <audio> real para reproducir el archivo alojado en Cloudinary.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // NO usar tick() porque el audio real maneja timeupdate correctamente.
  // Solo se usa tick() en reproducción sintética (sin elemento <audio>).
  // useEffect(() => {
  //   if (!isPlaying) return;
  //   const id = setInterval(() => tick(1), 1000);
  //   return () => clearInterval(id);
  // }, [isPlaying, tick]);

  // Cargar el audio cuando cambia la canción.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = cancion?.url_audio ?? "";
    if (audio.src !== src) {
      audio.src = src;
      audio.currentTime = 0;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {
          /* el navegador puede bloquear autoplay hasta una interacción del usuario */
        });
      }
    }
  }, [cancion?.id, cancion?.url_audio, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {
        /* el navegador puede bloquear autoplay hasta una interacción del usuario */
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !cancion?.url_audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      if (shuffle) {
        const randomSong = canciones[Math.floor(Math.random() * canciones.length)];
        play(randomSong.id);
        return;
      }
      next();
    };

    const handleLoadedMetadata = () => {
      // Sincronizar con el progreso del store después de cargar metadatos
      if (Math.abs(audio.currentTime - progress) > 0.5) {
        audio.currentTime = progress;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [next, play, setProgress, shuffle, repeatMode, cancion?.id, cancion?.url_audio]);

  // Sincronización del progreso cuando cambia desde controles externos (ej: slider)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !cancion) return;
    // Solo sincronizar si hay una diferencia significativa (>1 segundo)
    if (Math.abs(audio.currentTime - progress) > 1) {
      audio.currentTime = progress;
    }
  }, [progress, cancion?.id]);

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
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg shadow-emboss">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-3">
        <audio ref={audioRef} preload="metadata" />
        <div className="flex items-center gap-3 min-w-0 w-full md:w-1/4">
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
          <button
            onClick={() => setShuffle((prev) => !prev)}
            className={cn(
              "transition-colors",
              shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Aleatorio"
          >
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
          <button
            onClick={() =>
              setRepeatMode((mode) =>
                mode === "off" ? "all" : mode === "all" ? "one" : "off"
              )
            }
            className={cn(
              "transition-colors",
              repeatMode !== "off"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Repetir"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">
            {cancion ? formatDur(progress) : "0:00"}
          </span>
          <input
            type="range"
            min={0}
            max={cancion?.duracion_seg ?? 0}
            value={Math.min(progress, cancion?.duracion_seg ?? 0)}
            onChange={(e) => {
              const value = Number(e.target.value);
              setProgress(value);
              if (audioRef.current) audioRef.current.currentTime = value;
            }}
            className="flex-grow accent-primary"
            aria-label="Progreso de la canción"
          />
          <span className="text-[10px] tabular-nums text-muted-foreground w-9">
            {cancion ? formatDur(cancion.duracion_seg) : "0:00"}
          </span>
        </div>
      </div>

        <div className="hidden md:flex w-full md:w-1/4 items-center justify-end gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-28 h-1 accent-primary cursor-pointer"
            aria-label="Volumen"
          />
        </div>
      </div>
    </footer>
  );
}
