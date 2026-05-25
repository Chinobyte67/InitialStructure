import cloudinary
import cloudinary.uploader
from typing import BinaryIO

from src.config.env import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_audio_to_cloudinary(file: BinaryIO) -> tuple[str, int]:
    result = cloudinary.uploader.upload(
        file,
        resource_type="video",
        folder="canciones",
        use_filename=True,
        unique_filename=True,
    )

    secure_url = result.get("secure_url") or result.get("url")
    if not secure_url:
        raise ValueError("No se recibió URL de Cloudinary para el audio cargado.")

    duration = result.get("duration")
    duracion_seg = round(float(duration)) if duration is not None else 0

    return secure_url, duracion_seg
