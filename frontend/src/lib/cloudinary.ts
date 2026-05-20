// Subida de audio a Cloudinary mediante "unsigned upload".
//
// Configuración previa (panel de Cloudinary):
//   1. Settings -> Upload -> Upload presets -> Add upload preset
//   2. Signing Mode: "Unsigned"
//   3. Copiar el nombre del preset y el "Cloud name" de la cuenta.
//
// Variables en frontend/.env:
//   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset_unsigned
//
// Cloudinary trata el audio como resource_type "video", por eso la URL de
// subida usa /video/upload. El audio resultante se sirve por CDN y soporta
// HTTP range requests, así que el <audio> del navegador puede hacer streaming.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export interface AudioSubido {
  /** URL pública del audio. Guardar en Cancion.url_audio. */
  url: string;
  /** Duración detectada por Cloudinary, en segundos enteros. */
  duracionSeg: number;
  /** public_id de Cloudinary (útil si después se quiere borrar/transformar). */
  publicId: string;
}

/**
 * Sube un archivo de audio a Cloudinary y devuelve su URL pública.
 *
 * Uso típico (al dar de alta una canción):
 *   const { url, duracionSeg } = await subirAudio(file);
 *   await api.canciones.crear({ titulo, album_id, duracion_seg: duracionSeg, url_audio: url });
 */
export async function subirAudio(file: File): Promise<AudioSubido> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Falta configurar VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en frontend/.env"
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Error subiendo el audio a Cloudinary");
  }

  return {
    url: data.secure_url as string,
    duracionSeg: Math.round((data.duration as number) ?? 0),
    publicId: data.public_id as string,
  };
}
