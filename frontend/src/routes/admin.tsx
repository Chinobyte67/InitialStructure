import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Album, type Cancion } from "@/lib/api";
import { useSession } from "@/store/session";
import UploadSong from "@/components/UploadSong";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin" }] }),
});

function AdminPage() {
  const nav = useNavigate();
  const user = useSession((s) => s.user);

  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albumId, setAlbumId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Gate: solo admins
  useEffect(() => {
    if (user && !user.is_admin) nav({ to: "/" });
    if (!user) nav({ to: "/auth" });
  }, [user, nav]);

  const recargar = async () => {
    setLoading(true);
    try {
      const [albs, cans] = await Promise.all([
        api.albumes.listar(),
        api.canciones.listarAll(),
      ]);
      setAlbumes(albs);
      setCanciones(cans);
      if (albs.length && albumId === null) setAlbumId(albs[0].id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { recargar(); }, []);

  const handleEliminar = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esto también borra el audio de Cloudinary.`)) return;
    setErr(null);
    setMsg(null);
    try {
      await api.canciones.eliminar(id);
      setMsg(`Eliminada: ${titulo}`);
      setCanciones((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  if (!user?.is_admin) return null;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Panel Admin</h1>
        <p className="text-sm text-muted-foreground">Subí canciones nuevas y eliminá del catálogo. Las canciones se cargan únicamente desde acá.</p>
      </header>

      {msg && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>}
      {err && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Álbum destino</h2>
        <select
          className="border rounded px-3 py-2 bg-background"
          value={albumId ?? ""}
          onChange={(e) => setAlbumId(Number(e.target.value))}
        >
          {albumes.map((a) => (
            <option key={a.id} value={a.id}>{a.titulo} (id={a.id})</option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Subir canción nueva</h2>
        {albumId ? <UploadSong albumId={albumId} /> : <p className="text-sm text-muted-foreground">Elegí un álbum primero.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Canciones ({canciones.length})</h2>
        {loading ? <p>Cargando...</p> : (
          <ul className="divide-y border rounded">
            {canciones.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2">
                <div>
                  <span className="font-medium">{c.titulo}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    id={c.id} · album={c.album_id} · {c.duracion_seg}s
                    {c.url_audio ? "" : " · sin audio"}
                  </span>
                </div>
                <button
                  onClick={() => handleEliminar(c.id, c.titulo)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
