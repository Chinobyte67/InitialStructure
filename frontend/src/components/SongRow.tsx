import { Play, Heart, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  type Cancion,
  getAlbum,
  getArtistaDeCancion,
  formatDur,
} from "@/data/catalog";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";
import { CoverArt } from "@/components/CoverArt";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface SongRowProps {
  cancion: Cancion;
  index?: number;
  showAlbum?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export function SongRow({ cancion, index, showAlbum = true, onRemove, removeLabel }: SongRowProps) {
  const album = getAlbum(cancion.album_id);
  const artista = getArtistaDeCancion(cancion);
  const play = useApp((s) => s.play);
  const favoritos = useApp((s) => s.favoritos);
  const toggleFav = useApp((s) => s.toggleFavorito);
  const playlists = useApp((s) => s.playlists);
  const addToPlaylist = useApp((s) => s.addToPlaylist);
  const isFav = favoritos.includes(cancion.id);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid grid-cols-[2.5rem_1fr_1fr_auto_3rem] items-center gap-4 px-3 py-2 rounded-md hover:bg-muted/50 group transition-colors"
    >
      <div className="text-sm text-muted-foreground tabular-nums flex items-center justify-center w-10">
        {hover ? (
          <button
            onClick={() => play(cancion.id)}
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
        {album && <CoverArt colors={album.color} size="sm" />}
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{cancion.titulo}</div>
          {artista && (
            <Link
              to="/artista/$id"
              params={{ id: artista.id }}
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
          params={{ id: album.id }}
          className="text-xs text-muted-foreground hover:text-primary hover:underline truncate hidden md:block"
        >
          {album.titulo}
        </Link>
      ) : (
        <span />
      )}

      <button
        onClick={() => toggleFav(cancion.id)}
        className={cn(
          "transition-colors",
          isFav ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
        )}
        aria-label="Favorito"
      >
        <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
      </button>

      <div className="flex items-center gap-2 justify-end">
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
            {playlists.length === 0 && (
              <DropdownMenuItem disabled>No tenés playlists</DropdownMenuItem>
            )}
            {playlists.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, cancion.id)}>
                {p.nombre}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
            aria-label={removeLabel ?? "Quitar"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
