from sqlalchemy.orm import Session
from sqlalchemy import func, case, Float
from datetime import datetime

from ..dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO, CancionEstadisticasDTO
from ..repositories.album_repository import AlbumRepository
from ..repositories.cancion_repository import CancionRepository
from ..db.models.reproduccion_model import Reproduccion
from ..db.models.cancion_model import Cancion
from ..utils.errors import NotFoundError
from ..utils.cloudinary import get_cloudinary_duration, delete_audio_asset

class CancionService:
    def __init__(self, db: Session):
        self.cancion_repo = CancionRepository(db)
        self.album_repo = AlbumRepository(db)

    def create_cancion(self, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        if not self.album_repo.find_by_id(cancion_dto.album_id):
            raise NotFoundError("Album no encontrado")
        
        # Si no hay duración pero hay URL de audio, intentar obtenerla de Cloudinary
        duracion_seg = cancion_dto.duracion_seg
        if duracion_seg is None:
            if cancion_dto.url_audio:
                duracion_seg = get_cloudinary_duration(cancion_dto.url_audio)
            else:
                raise ValueError("Debes proporcionar duracion_seg o una url_audio válida de Cloudinary")
        
        # Crear DTO con la duración resuelta
        cancion_dto_final = CreateCancionDTO(
            titulo=cancion_dto.titulo,
            duracion_seg=duracion_seg,
            album_id=cancion_dto.album_id,
            url_audio=cancion_dto.url_audio,
        )
        return self.cancion_repo.create(cancion_dto_final)

    def create_cancion_pendiente(self, titulo: str, album_id: int) -> CancionResponseDTO:
        """Crea una canción sin audio (duracion=0, url=None) y devuelve la fila con su id.
        Se usa en el flujo de upload para luego nombrar el asset de Cloudinary con ese id."""
        if not self.album_repo.find_by_id(album_id):
            raise NotFoundError("Album no encontrado")
        return self.cancion_repo.create(CreateCancionDTO(
            titulo=titulo,
            album_id=album_id,
            duracion_seg=0,
            url_audio=None,
        ))

    def set_audio(self, cancion_id: int, url_audio: str, duracion_seg: int) -> CancionResponseDTO:
        """Setea url_audio y duracion_seg en una canción ya creada (tras subir a Cloudinary)."""
        actual = self.cancion_repo.find_by_id(cancion_id)
        if not actual:
            raise NotFoundError("Cancion no encontrada")
        return self.cancion_repo.update(cancion_id, CreateCancionDTO(
            titulo=actual.titulo,
            album_id=actual.album_id,
            duracion_seg=duracion_seg,
            url_audio=url_audio,
        ))

    def get_cancion_by_id(self, cancion_id: int) -> CancionResponseDTO | None:
        return self.cancion_repo.find_by_id(cancion_id)

    def list_canciones(self, album_id: int | None = None) -> list[CancionResponseDTO]:
        return self.cancion_repo.list_all(album_id)

    def get_estadisticas_cancion(self, cancion_id: int, anio_inicio: int | None = None, anio_fin: int | None = None) -> CancionEstadisticasDTO:
        if not self.cancion_repo.find_by_id(cancion_id):
            raise NotFoundError("Cancion no encontrada")

        query = self.cancion_repo.db.query(
            func.count(Reproduccion.id).label("cantidad_reproducciones"),
            func.count(case((Reproduccion.cuenta_para_estadisticas == True, 1))).label("reproducciones_validas"),
            func.coalesce(
                func.avg((Reproduccion.segundos_escuchados.cast(Float) / Cancion.duracion_seg) * 100),
                0.0
            ).label("porcentaje_promedio_escuchado")
        ).join(Cancion, Cancion.id == Reproduccion.cancion_id)
        
        query = query.filter(Cancion.id == cancion_id)
        if anio_inicio is not None:
            inicio = datetime(anio_inicio, 1, 1)
            query = query.filter(Reproduccion.fecha >= inicio)
        if anio_fin is not None:
            fin = datetime(anio_fin, 12, 31, 23, 59, 59, 999999)
            query = query.filter(Reproduccion.fecha <= fin)

        cantidad_reproducciones, reproducciones_validas, porcentaje_promedio_escuchado = query.one()

        porcentaje = float(porcentaje_promedio_escuchado or 0.0)
        porcentaje_formateado = f"%{porcentaje:.1f}"

        return CancionEstadisticasDTO(
            cancion_id=cancion_id,
            cantidad_reproducciones=int(cantidad_reproducciones or 0),
            reproducciones_validas=int(reproducciones_validas or 0),
            porcentaje_promedio_escuchado=porcentaje_formateado,
        )

    def update_cancion(self, cancion_id: int, cancion_dto: CreateCancionDTO) -> CancionResponseDTO | None:
        return self.cancion_repo.update(cancion_id, cancion_dto)

    def delete_cancion(self, cancion_id: int, borrar_de_cloudinary: bool = True) -> bool:
        # Si la canción tiene un asset en Cloudinary subido por nosotros, lo borramos también.
        if borrar_de_cloudinary:
            actual = self.cancion_repo.find_by_id(cancion_id)
            if actual and actual.url_audio:
                public_id = _public_id_from_url(actual.url_audio)
                if public_id:
                    delete_audio_asset(public_id)
        return self.cancion_repo.delete(cancion_id)

def _public_id_from_url(url: str) -> str | None:
    """Extrae el public_id (incluyendo carpeta) de una URL de Cloudinary.
    Ej: .../upload/v123/canciones/cancion_42.mp3 → 'canciones/cancion_42'."""
    from urllib.parse import urlparse
    try:
        parts = urlparse(url).path.split("/")
        if "upload" not in parts:
            return None
        idx = parts.index("upload")
        # saltar version (vNNN) si está
        rest = parts[idx + 1:]
        if rest and rest[0].startswith("v") and rest[0][1:].isdigit():
            rest = rest[1:]
        if not rest:
            return None
        joined = "/".join(rest)
        return joined.rsplit(".", 1)[0]
    except Exception:
        return None
    