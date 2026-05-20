import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { SongRow } from "@/components/SongRow";
import { CoverArt } from "@/components/CoverArt";
import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Globe, Lock, Users, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  obtenerPlaylist,
  renombrarPlaylist,
  eliminarPlaylist,
  cambiarVisibilidad,
  cambiarColaborativa,
  quitarCancion,
} from "@/lib/playlists.functions";

export const Route = createFileRoute("/playlist/$id")({
  component: PlaylistPage,
  head: () => ({ meta: [{ title: "Playlist — AuraStream" }] }),
});

type PlaylistTrackDetail = {
  cancion_id: string;
  orden: number;
  fecha_agregada: string;
  canciones: {
    id: string;
    titulo: string;
    duracion_seg: number;
    albumes: { titulo: string; artistas: { id: string; nombre: string; genero_musical: string } };
  };
};

type PlaylistDetail = {
  playlist: {
    id: string;
    nombre: string;
    usuario_id: string;
    fecha_creacion: string;
    es_publica: boolean;
    colaborativa: boolean;
  };
  tracks: PlaylistTrackDetail[];
  total_seg: number;
  colaboradores: string[];
};

function PlaylistPage() {
  const { id } = Route.useParams();
  const userId = useApp((s) => s.user.id);
  const play = useApp((s) => s.play);
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPageError(null);
    obtenerPlaylist({ id })
      .then((data) => {
        setPlaylist(data);
        setName(data.playlist.nombre);
      })
      .catch((err) => {
        setPageError(err instanceof Error ? err.message : "No se pudo cargar la playlist");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const tracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.tracks
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((t) => t.canciones);
  }, [playlist]);

  const totalSeg = tracks.reduce((acc, c) => acc + c.duracion_seg, 0);

  if (loading) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Cargando playlist...</p>
      </div>
    );
  }

  if (pageError || !playlist) {
    return (
      <div className="px-8 pt-12">
        <p className="text-destructive">{pageError ?? "Playlist no encontrada."}</p>
        <Link to="/biblioteca" className="text-primary hover:underline">
          Volver a biblioteca
        </Link>
      </div>
    );
  }

  const isOwner = playlist.playlist.usuario_id === userId;
  const firstAlbum = tracks[0]?.albumes;
  const colors = firstAlbum
    ? (["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] as [string, string])
    : (["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] as [string, string]);

  const handleRename = async () => {
    setEditError(null);
    try {
      await renombrarPlaylist({ id: playlist.playlist.id, nombre: name });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              playlist: { ...prev.playlist, nombre: name },
            }
          : prev
      );
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo renombrar la playlist");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta playlist?")) return;
    try {
      await eliminarPlaylist({ id: playlist.playlist.id });
      navigate({ to: "/biblioteca" });
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "No se pudo eliminar la playlist");
    }
  };

  const handleTogglePub = async () => {
    try {
      await cambiarVisibilidad({ id: playlist.playlist.id, es_publica: !playlist.playlist.es_publica });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              playlist: { ...prev.playlist, es_publica: !prev.playlist.es_publica },
            }
          : prev
      );
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "No se pudo actualizar la visibilidad");
    }
  };

  const handleToggleCol = async () => {
    try {
      await cambiarColaborativa({ id: playlist.playlist.id, colaborativa: !playlist.playlist.colaborativa });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              playlist: { ...prev.playlist, colaborativa: !prev.playlist.colaborativa },
            }
          : prev
      );
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "No se pudo actualizar la colaboración");
    }
  };

  const handleRemoveTrack = async (cancionId: string) => {
    try {
      await quitarCancion({ playlist_id: playlist.playlist.id, cancion_id: cancionId });
      setPlaylist((prev) =>
        prev
          ? { ...prev, tracks: prev.tracks.filter((track) => track.cancion_id !== cancionId) }
          : prev
      );
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "No se pudo quitar la canción");
    }
  };

  return (
    <div>
      <div
        className="px-8 pt-12 pb-8"
        style={{ background: `linear-gradient(180deg, ${colors[0]}, transparent)` }}
      >
        <div className="flex items-end gap-6">
          <CoverArt colors={colors} className="w-44 h-44 aspect-square shadow-emboss-lg" />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-3">
              {playlist.playlist.es_publica ? (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Pública
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Privada
                </span>
              )}
              {playlist.playlist.colaborativa && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Colaborativa
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-3 truncate">{playlist.playlist.nombre}</h1>
            <div className="text-sm text-muted-foreground">
              {tracks.length} canciones · {formatTotal(totalSeg)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => tracks[0] && play(tracks[0].id)}
            disabled={tracks.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => {
                  setName(playlist.playlist.nombre);
                  setEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                <Pencil className="w-4 h-4" /> Renombrar
              </button>
              <button
                onClick={handleTogglePub}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                {playlist.playlist.es_publica ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                Hacer {playlist.playlist.es_publica ? "privada" : "pública"}
              </button>
              <button
                onClick={handleToggleCol}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                <Users className="w-4 h-4" />
                {playlist.playlist.colaborativa ? "Quitar colaborativa" : "Hacer colaborativa"}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        {tracks.length === 0 ? (
          <p className="text-muted-foreground">
            Esta playlist está vacía. Buscá canciones y agregalas con el +.
          </p>
        ) : (
          <div className="bg-card rounded-lg shadow-emboss p-2">
            {tracks.map((c, i) => (
              <SongRow
                key={c.id}
                cancion={c}
                album={{ id: c.albumes.titulo, titulo: c.albumes.titulo, artista_id: c.albumes.artistas.id, color: ["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] }}
                artista={{
                  id: c.albumes.artistas.id,
                  nombre: c.albumes.artistas.nombre,
                  pais: "",
                  genero_musical: c.albumes.artistas.genero_musical,
                }}
                index={i + 1}
                onRemove={isOwner ? () => handleRemoveTrack(c.id) : undefined}
                removeLabel="Quitar de la playlist"
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar playlist</DialogTitle>
          </DialogHeader>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input shadow-deboss text-foreground px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {editError && <p className="text-xs text-destructive">{editError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
