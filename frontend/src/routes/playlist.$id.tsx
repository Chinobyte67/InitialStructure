import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
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
import { api } from "@/lib/api";

export const Route = createFileRoute("/playlist/$id")({
  component: PlaylistPage,
  head: () => ({ meta: [{ title: "Playlist — AuraStream" }] }),
});

type PlaylistTrackDetail = {
  cancion_id: number;
  orden: number;
  fecha_agregada: string;
  canciones: {
    id: number;
    titulo: string;
    duracion_seg: number;
    albumes: { titulo: string; artistas: { id: number; nombre: string; genero_musical: string } };
  };
};

type PlaylistDetail = {
  playlist: {
    id: number;
    nombre: string;
    usuario_id: number;
    fecha_creacion: string;
    es_publica: number | boolean;
    colaborativa: number | boolean;
    colaboradores?: number[];
  };
  tracks: PlaylistTrackDetail[];
  total_seg: number;
  colaboradores: string[];
};

async function fetchPlaylistDetail(playlistId: number): Promise<PlaylistDetail> {
  const pl = await api.playlists.obtener(playlistId);
  if (!pl) throw new Error("Playlist no encontrada");

  const tracks = await api.playlistCanciones.listarPorPlaylist(playlistId);
  const tracksWithCancion = await Promise.all((tracks ?? []).map(async (t: any) => {
    let cancion: any = null;
    let album: any = null;
    let artista: any = null;

    try {
      cancion = await api.canciones.obtener(t.cancion_id);
    } catch {
      cancion = null;
    }

    if (cancion) {
      try {
        album = await api.albumes.obtener(cancion.album_id);
      } catch {
        album = null;
      }
    }

    if (album) {
      try {
        artista = await api.artistas.obtener(album.artista_id);
      } catch {
        artista = null;
      }
    }

    return {
      ...t,
      canciones: {
        id: cancion?.id ?? t.cancion_id,
        titulo: cancion?.titulo ?? "Canción desconocida",
        duracion_seg: cancion?.duracion_seg ?? 0,
        albumes: {
          titulo: album?.titulo ?? "Álbum desconocido",
          artistas: {
            id: artista?.id ?? 0,
            nombre: artista?.nombre ?? "Artista desconocido",
            genero_musical: artista?.genero_musical ?? artista?.genero ?? "unknown",
          },
        },
      },
    };
  }));

  const total_seg = tracksWithCancion.reduce((acc, t: any) => acc + (t.canciones?.duracion_seg ?? 0), 0);
  const colaboradores = pl.colaboradores?.map(String) ?? [];

  return { playlist: pl, tracks: tracksWithCancion, total_seg, colaboradores };
}

function formatTotal(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function PlaylistPage() {
  const { id } = Route.useParams();
  const appUserId = useApp((s) => s.user.id);
  const sessionUser = useSession((s) => s.user);
  const currentUserId = String(sessionUser?.id ?? appUserId);
  const playSong = useApp((s) => s.playSong);
  const removePlaylist = useApp((s) => s.deletePlaylist);
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const playlistId = Number(id);
    if (Number.isNaN(playlistId)) {
      setPageError("ID de playlist inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    fetchPlaylistDetail(playlistId)
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

  const playlistOwnerId = String(playlist.playlist.usuario_id ?? (playlist.playlist as any).user_id ?? "");
  const isOwner = String(sessionUser?.id) === playlistOwnerId || String(appUserId) === playlistOwnerId;
  const isAdmin = sessionUser?.is_admin ?? false;
  const canDelete = isOwner || isAdmin;
  console.log(
    "Sesión ID:", sessionUser?.id,
    "Playlist Dueño ID:", playlistOwnerId,
    "Es dueño:", isOwner,
    "Es admin:", isAdmin,
    "Puede borrar:", canDelete
  );
  const firstAlbum = tracks[0]?.albumes;
  const colors = firstAlbum
    ? (["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] as [string, string])
    : (["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] as [string, string]);

  const handleRename = async () => {
    setEditError(null);
    try {
      const usuario_id = Number(sessionUser?.id ?? appUserId);
      const body = { nombre: name };
      await api.playlists.actualizar(playlist.playlist.id, body, Number.isNaN(usuario_id) ? undefined : usuario_id);
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
    const deleteUserId = Number(sessionUser?.id ?? appUserId);
    if (Number.isNaN(deleteUserId)) {
      setPageError("No estás autenticado correctamente para eliminar esta playlist.");
      return;
    }

    try {
      const result = await api.playlists.eliminar(playlist.playlist.id, deleteUserId);
      if (!result?.ok) {
        throw new Error(result?.message ?? "No se pudo eliminar la playlist");
      }
      removePlaylist(playlist.playlist.id);
      navigate({ to: "/biblioteca" });
    } catch (err) {
      console.error("Error al eliminar playlist:", err);
      setPageError(err instanceof Error ? err.message : "No se pudo eliminar la playlist");
    }
  };

  const handleTogglePub = async () => {
    try {
      const usuario_id = Number(sessionUser?.id ?? appUserId);
      const body = { es_publica: playlist.playlist.es_publica ? 0 : 1 };
      await api.playlists.actualizar(playlist.playlist.id, body, Number.isNaN(usuario_id) ? undefined : usuario_id);
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
      const usuario_id = Number(sessionUser?.id ?? appUserId);
      const body = { colaborativa: playlist.playlist.colaborativa ? 0 : 1 };
      await api.playlists.actualizar(playlist.playlist.id, body, Number.isNaN(usuario_id) ? undefined : usuario_id);
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
      const result = await api.playlistCanciones.eliminarPorPlaylist(
        playlist.playlist.id,
        Number(cancionId),
        Number(sessionUser?.id ?? appUserId)
      );
      if (!result?.ok) {
        throw new Error("No se pudo eliminar la canción de la playlist");
      }
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: prev.tracks.filter((track) => String(track.cancion_id) !== cancionId),
            }
          : prev
      );
    } catch (err) {
      console.error("Error al quitar canción de playlist:", err);
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
            onClick={() => tracks[0] && playSong(String(tracks[0].id), tracks.map((c) => String(c.id)))}
            disabled={tracks.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold shadow-emboss-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> Reproducir
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-destructive border border-destructive/20 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Playlist
            </button>
          )}
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
                contextQueue={tracks.map((track) => String(track.id))}
                onPlay={(id, queue) => playSong(id, queue)}
                onRemove={isOwner ? () => handleRemoveTrack(String(c.id)) : undefined}
                showDelete={isOwner}
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
