import { type ChangeEvent, useState } from "react";
import { api } from "@/lib/api";
import { subirAudio } from "@/lib/cloudinary";

interface UploadSongProps {
  albumId: number;
}

export default function UploadSong({ albumId }: UploadSongProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setError("Por favor seleccioná un archivo de audio.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Seleccioná una canción primero.");
      return;
    }
    if (!titulo.trim()) {
      setError("Ingresá un título para la canción.");
      return;
    }

    setError(null);
    setMessage(null);
    setUploading(true);

    try {
      const uploaded = await subirAudio(selectedFile);
      const created = await api.canciones.crear({
        titulo: titulo.trim(),
        album_id: albumId,
        duracion_seg: uploaded.duracionSeg,
        url_audio: uploaded.url,
      });

      setMessage(`Canción creada: ${created.titulo}`);
      setTitulo("");
      setSelectedFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Agregar canción</h2>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Título de la canción"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Archivo de audio</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-500"
          />
        </label>

        {selectedFile && (
          <div className="text-sm text-slate-600">
            Archivo seleccionado: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400"
        >
          {uploading ? "Subiendo..." : "Subir y crear canción"}
        </button>
      </div>
    </div>
  );
}
