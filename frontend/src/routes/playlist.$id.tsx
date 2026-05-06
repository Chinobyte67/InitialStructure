import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { canciones, getAlbum, formatTotal } from "@/data/catalog";
import { SongRow } from "@/components/SongRow";
import { CoverArt } from "@/components/CoverArt";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Globe, Lock, Users, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/playlist/$id")({
  component: PlaylistPage,
  head: () => ({ meta: [{ title: "Playlist — AuraStream" }] }),
});

function PlaylistPage() {
  const { id } = Route.useParams();
  const playlist = useApp((s) => s.playlists.find((p) => p.id === id));
  const userId = useApp((s) => s.user.id);
  const rename = useApp((s) => s.renamePlaylist);
  const removeP = useApp((s) => s.deletePlaylist);
  const togglePub = useApp((s) => s.togglePlaylistPublic);
  const toggleCol = useApp((s) => s.togglePlaylistCollab);
  const removeFromPlaylist = useApp((s) => s.removeFromPlaylist);
  const play = useApp((s) => s.play);
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playlist?.nombre ?? "");
  const [editError, setEditError] = useState<string | null>(null);

  const tracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.tracks
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((t) => canciones.find((c) => c.id === t.cancion_id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [playlist]);

  const totalSeg = tracks.reduce((acc, c) => acc + c.duracion_seg, 0);

  if (!playlist) {
    return (
      <div className="px-8 pt-12">
        <p className="text-muted-foreground">Playlist no encontrada.</p>
        <Link to="/biblioteca" className="text-primary hover:underline">
          Volver a biblioteca
        </Link>
      </div>
    );
  }

  const isOwner = playlist.usuario_id === userId;
  const firstAlbum = tracks[0] ? getAlbum(tracks[0].album_id) : null;
  const colors = firstAlbum?.color ?? (["oklch(0.40 0.15 280)", "oklch(0.20 0.05 280)"] as [string, string]);

  const handleRename = () => {
    setEditError(null);
    const res = rename(playlist.id, name);
    if (res && "error" in res) {
      setEditError(res.error);
      return;
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar esta playlist?")) return;
    removeP(playlist.id);
    navigate({ to: "/biblioteca" });
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
              {playlist.es_publica ? (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Pública
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Privada
                </span>
              )}
              {playlist.colaborativa && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Colaborativa
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-3 truncate">{playlist.nombre}</h1>
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
                  setName(playlist.nombre);
                  setEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                <Pencil className="w-4 h-4" /> Renombrar
              </button>
              <button
                onClick={() => togglePub(playlist.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                {playlist.es_publica ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                Hacer {playlist.es_publica ? "privada" : "pública"}
              </button>
              <button
                onClick={() => toggleCol(playlist.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground shadow-emboss hover:shadow-emboss-lg"
              >
                <Users className="w-4 h-4" />
                {playlist.colaborativa ? "Quitar colaborativa" : "Hacer colaborativa"}
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
                index={i + 1}
                onRemove={isOwner ? () => removeFromPlaylist(playlist.id, c.id) : undefined}
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
