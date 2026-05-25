import { Play, Heart, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CoverArt } from "@/components/CoverArt";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { listarPlaylists } from "@/lib/playlists.functions";

function formatDur(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface SongRowCancion {
  id: string | number;
  titulo: string;
  duracion_seg: number;
  album_id: string | number;
}

export interface SongRowAlbum {
  id: string | number;
  titulo: string;
  artista_id: string | number;
  anio?: number;
  color?: [string, string];
}

export interface SongRowArtista {
  id: string | number;
  nombre: string;
  pais: string;
  genero_musical: string;
}

interface PlaylistEntry {
  id: number;
  nombre: string;
}

interface SongRowProps {
  cancion: SongRowCancion;
  album?: SongRowAlbum | null;
  artista?: SongRowArtista | null;
  index?: number;
  showAlbum?: boolean;
  onRemove?: () => void;
  showDelete?: boolean;
  removeLabel?: string;
}

export function SongRow({
  cancion,
  album,
  artista,
  index,
  showAlbum = true,
  onRemove,
  showDelete = true,
  removeLabel,
}: SongRowProps) {
  const play = useApp((s) => s.play);
  const favoritos = useApp((s) => s.favoritos);
  const toggleFav = useApp((s) => s.toggleFavorito);
  const sessionUser = useSession((s) => s.user);
  const [playlists, setPlaylists] = useState<PlaylistEntry[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [hover, setHover] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const isFav = favoritos.includes(String(cancion.id));

  useEffect(() => {
    let active = true;
    listarPlaylists()
      .then((data) => {
        if (!active) return;
        setPlaylists(data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setPlaylists([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingPlaylists(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddToPlaylist = async (playlistId: number) => {
    setAddError(null);
    try {
      await api.playlistCanciones.crear(
        { playlist_id: playlistId, cancion_id: Number(cancion.id) },
        sessionUser ? Number(sessionUser.id) : undefined
      );
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "No se pudo agregar a la playlist");
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid grid-cols-[2.5rem_1fr_1fr_auto_minmax(10rem,auto)] items-center gap-4 px-3 py-2 rounded-md hover:bg-muted/50 group transition-colors"
    >
      <div className="text-sm text-muted-foreground tabular-nums flex items-center justify-center w-10">
        {hover ? (
          <button
            onClick={() => play(String(cancion.id))}
            className="text-foreground"
            aria-label="Reproducir"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        ) : (
          index ?? "•"
        )}
      </div>

      <div className="flex items-center gap-3 min-w-0">
        {album ? <CoverArt colors={album.color} size="sm" /> : <CoverArt size="sm" />}
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{cancion.titulo}</div>
          {artista && (
            <Link
              to="/artista/$id"
              params={{ id: String(artista.id) }}
              className="text-xs text-muted-foreground hover:text-primary hover:underline truncate block"
            >
              {artista.nombre}
            </Link>
          )}
        </div>
      </div>

      {showAlbum && album ? (
        <Link
          to="/album/$id"
          params={{ id: String(album.id) }}
          className="text-xs text-muted-foreground hover:text-primary hover:underline truncate hidden md:block"
        >
          {album.titulo}
        </Link>
      ) : (
        <span />
      )}

      <button
        onClick={() => toggleFav(String(cancion.id))}
        className={cn(
          "transition-colors mr-4",
          isFav ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
        )}
        aria-label="Favorito"
      >
        <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
      </button>

      <div className="flex items-center gap-4 justify-end min-w-[8rem]">
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDur(cancion.duracion_seg)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
              aria-label="Más"
            >
              <Plus className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Agregar a playlist</DropdownMenuLabel>
            {loadingPlaylists ? (
              <DropdownMenuItem disabled>Cargando playlists...</DropdownMenuItem>
            ) : playlists.length === 0 ? (
              <DropdownMenuItem disabled>No tenés playlists</DropdownMenuItem>
            ) : (
              playlists.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => handleAddToPlaylist(p.id)}>
                  {p.nombre}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {onRemove && showDelete && (
          <button
            onClick={onRemove}
            title={removeLabel ?? "Quitar"}
            className="text-destructive hover:text-destructive"
            aria-label={removeLabel ?? "Quitar"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
