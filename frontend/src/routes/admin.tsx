import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Album, type Cancion, type Artista } from "@/lib/api";
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

  // Form crear álbum
  const [albumTitulo, setAlbumTitulo] = useState("");
  const [albumAnio, setAlbumAnio] = useState(new Date().getFullYear());
  const [albumArtistaId, setAlbumArtistaId] = useState<number | null>(null);
  const [artistas, setArtistas] = useState<Artista[]>([]);

  // Form crear artista
  const [artistaNombre, setArtistaNombre] = useState("");
  const [artistaPais, setArtistaPais] = useState("");
  const [artistaGenero, setArtistaGenero] = useState("");

  // Editar álbum
  const [editAlbumId, setEditAlbumId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editAnio, setEditAnio] = useState<number | null>(null);
  const [editArtistaId, setEditArtistaId] = useState<number | null>(null);

  // Gate: solo admins
  useEffect(() => {
    if (user && !user.is_admin) nav({ to: "/" });
    if (!user) nav({ to: "/auth" });
  }, [user, nav]);

  const recargar = async () => {
    setLoading(true);
    try {
      const [albs, cans, arts] = await Promise.all([
        api.albumes.listar(),
        api.canciones.listarAll(),
        api.artistas.listar(),
      ]);
      setAlbumes(albs);
      setCanciones(cans);
      setArtistas(arts);
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

  const handleCrearAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!albumTitulo.trim()) {
      setErr("Ingresá el título del álbum");
      return;
    }

    if (!albumArtistaId) {
      setErr("Seleccioná un artista");
      return;
    }

    try {
      const nuevoAlbum = await api.albumes.crear({
        titulo: albumTitulo.trim(),
        anio: albumAnio,
        artista_id: albumArtistaId,
      });
      setMsg(`Álbum creado: ${nuevoAlbum.titulo}. Ahora podés subir canciones.`);
      setAlbumes([...albumes, nuevoAlbum]);
      setAlbumId(nuevoAlbum.id); // Selecciona automáticamente el nuevo álbum
      setAlbumTitulo("");
      setAlbumAnio(new Date().getFullYear());
      setAlbumArtistaId(null);
      // Scroll a la sección de upload
      setTimeout(() => {
        document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear álbum");
    }
  };

  const handleCrearArtista = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!artistaNombre.trim()) {
      setErr("Ingresá el nombre del artista");
      return;
    }
    try {
      const nuevo = await api.artistas.crear({ nombre: artistaNombre.trim(), pais: artistaPais, genero: artistaGenero });
      setMsg(`Artista creado: ${nuevo.nombre}`);
      setArtistas((prev) => [...prev, nuevo]);
      setArtistaNombre("");
      setArtistaPais("");
      setArtistaGenero("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear artista");
    }
  };

  const handleEliminarArtista = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar artista "${nombre}"? Esto puede borrar también sus álbumes.`)) return;
    setErr(null);
    setMsg(null);
    try {
      await api.artistas.eliminar(id);
      setMsg(`Artista eliminado: ${nombre}`);
      setArtistas((prev) => prev.filter((a) => a.id !== id));
      // Recargar albums por si se eliminaron
      setAlbumes((prev) => prev.filter((al) => al.artista_id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar artista");
    }
  };

  const handleEliminarAlbum = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar álbum "${titulo}"? Esto también borrará sus canciones.`)) return;
    setErr(null);
    setMsg(null);
    try {
      await api.albumes.eliminar(id);
      setMsg(`Álbum eliminado: ${titulo}`);
      setAlbumes((prev) => prev.filter((a) => a.id !== id));
      if (albumId === id) setAlbumId(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar álbum");
    }
  };

  const startEditarAlbum = (album: Album) => {
    setEditAlbumId(album.id);
    setEditTitulo(album.titulo);
    setEditAnio(album.anio);
    setEditArtistaId(album.artista_id);
    // Scroll to edit
    setTimeout(() => document.getElementById("edit-album")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleActualizarAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAlbumId) return;
    setErr(null);
    setMsg(null);
    try {
      const updated = await api.albumes.actualizar(editAlbumId, {
        titulo: editTitulo,
        anio: editAnio ?? undefined,
        artista_id: editArtistaId ?? undefined,
      });
      setMsg(`Álbum actualizado: ${updated.titulo}`);
      setAlbumes((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditAlbumId(null);
      setEditTitulo("");
      setEditAnio(new Date().getFullYear());
      setEditArtistaId(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al actualizar álbum");
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
        <h2 className="text-xl font-semibold">Crear álbum nuevo</h2>
        <form onSubmit={handleCrearAlbum} className="border rounded p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Título</label>
            <input
              type="text"
              value={albumTitulo}
              onChange={(e) => setAlbumTitulo(e.target.value)}
              placeholder="Nombre del álbum"
              className="w-full border rounded px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Año</label>
            <input
              type="number"
              value={albumAnio}
              onChange={(e) => setAlbumAnio(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Artista</label>
            <select
              value={albumArtistaId ?? ""}
              onChange={(e) => setAlbumArtistaId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-background"
            >
              <option value="">Seleccioná un artista</option>
              {artistas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 transition"
          >
            Crear álbum
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Gestionar artistas</h2>
        <form onSubmit={handleCrearArtista} className="border rounded p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={artistaNombre}
              onChange={(e) => setArtistaNombre(e.target.value)}
              placeholder="Nombre del artista"
              className="w-full border rounded px-3 py-2 bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={artistaPais}
              onChange={(e) => setArtistaPais(e.target.value)}
              placeholder="País"
              className="w-full border rounded px-3 py-2 bg-background"
            />
            <input
              type="text"
              value={artistaGenero}
              onChange={(e) => setArtistaGenero(e.target.value)}
              placeholder="Género"
              className="w-full border rounded px-3 py-2 bg-background"
            />
          </div>
          <button className="w-full bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 transition">Crear artista</button>
        </form>

        <div className="border rounded p-4">
          <h3 className="text-sm font-medium mb-2">Artistas ({artistas.length})</h3>
          <ul className="divide-y">
            {artistas.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium">{a.nombre}</span>
                  <span className="text-xs text-muted-foreground ml-2">{a.pais} · {a.genero}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEliminarArtista(a.id, a.nombre)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

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

      <section className="space-y-3" id="upload-section">
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Gestionar álbumes</h2>
        <div className="border rounded p-4">
          <h3 className="text-sm font-medium mb-2">Álbumes ({albumes.length})</h3>
          <ul className="divide-y">
            {albumes.map((al) => (
              <li key={al.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium">{al.titulo}</span>
                  <span className="text-xs text-muted-foreground ml-2">id={al.id} · {al.anio} · artista={al.artista_id}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEditarAlbum(al)} className="text-sm text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => handleEliminarAlbum(al.id, al.titulo)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {editAlbumId && (
          <form id="edit-album" onSubmit={handleActualizarAlbum} className="border rounded p-4 space-y-3 mt-4">
            <h3 className="text-sm font-medium">Editar álbum (id={editAlbumId})</h3>
            <div>
              <label className="text-sm font-medium">Título</label>
              <input type="text" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} className="w-full border rounded px-3 py-2 bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Año</label>
              <input type="number" value={editAnio ?? ""} onChange={(e) => setEditAnio(Number(e.target.value))} className="w-full border rounded px-3 py-2 bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Artista</label>
              <select value={editArtistaId ?? ""} onChange={(e) => setEditArtistaId(Number(e.target.value))} className="w-full border rounded px-3 py-2 bg-background">
                <option value="">Seleccioná un artista</option>
                {artistas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">Guardar</button>
              <button type="button" onClick={() => setEditAlbumId(null)} className="bg-gray-200 text-gray-800 rounded px-3 py-2">Cancelar</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
