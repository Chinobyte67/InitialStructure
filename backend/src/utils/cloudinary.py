import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import BinaryIO
from urllib.parse import urlparse

from src.config.env import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_audio_to_cloudinary(file: BinaryIO, public_id: str | None = None) -> tuple[str, int]:
    upload_opts: dict = {
        "resource_type": "video",
        "folder": "canciones",
    }
    if public_id:
        # public_id explícito: el asset queda como "canciones/<public_id>" en Cloudinary,
        # atado al id de la fila en la DB. overwrite=True permite re-subir si hace falta.
        upload_opts["public_id"] = public_id
        upload_opts["overwrite"] = True
    else:
        upload_opts["use_filename"] = True
        upload_opts["unique_filename"] = True

    result = cloudinary.uploader.upload(file, **upload_opts)

    secure_url = result.get("secure_url") or result.get("url")
    if not secure_url:
        raise ValueError("No se recibió URL de Cloudinary para el audio cargado.")

    duration = result.get("duration")
    duracion_seg = round(float(duration)) if duration is not None else 0

    return secure_url, duracion_seg


def delete_audio_asset(public_id: str) -> None:
    """Borra un asset de audio/video de Cloudinary. No lanza si no existe."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type="video", invalidate=True)
    except Exception:
        # Si ya no existe o falla la API, no bloqueamos el borrado en la DB.
        pass


def get_cloudinary_duration(cloudinary_url: str) -> int:
    """Obtiene la duración en segundos de un archivo de audio existente en Cloudinary."""
    try:
        # Extraer el public_id de la URL de Cloudinary
        # Ej: https://res.cloudinary.com/cloud_name/video/upload/v123/canciones/file.mp3
        parsed = urlparse(cloudinary_url)
        path_parts = parsed.path.split("/")
        
        # Buscar la posición de "upload" y tomar todo después
        upload_idx = path_parts.index("upload") if "upload" in path_parts else -1
        if upload_idx == -1:
            raise ValueError("URL de Cloudinary no válida")
        
        # public_id = todo desde después de upload (sin la extensión final)
        remaining = "/".join(path_parts[upload_idx + 2:])  # skip version
        public_id = remaining.rsplit(".", 1)[0]  # quitar extensión
        
        # Obtener metadatos del recurso
        resource = cloudinary.api.resource(public_id, resource_type="video")
        duration = resource.get("duration")
        
        if duration is None:
            raise ValueError("No se pudo obtener la duración del audio")
        
        return round(float(duration))
    except Exception as e:
        raise ValueError(f"Error al obtener duración de Cloudinary: {str(e)}")
