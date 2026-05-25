# TODO: implementar ProductService con la misma estructura que UserService

from sqlalchemy.orm import Session
from sqlalchemy import func, case, Float
from datetime import datetime

from ..dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO, CancionEstadisticasDTO
from ..repositories.album_repository import AlbumRepository
from ..repositories.cancion_repository import CancionRepository
from ..db.models.reproduccion_model import Reproduccion
from ..db.models.cancion_model import Cancion
from ..utils.errors import NotFoundError

class CancionService:
    def __init__(self, db: Session):
        self.cancion_repo = CancionRepository(db)
        self.album_repo = AlbumRepository(db)

    def create_cancion(self, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        if not self.album_repo.find_by_id(cancion_dto.album_id):
            raise NotFoundError("Album no encontrado")
        return self.cancion_repo.create(cancion_dto)

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

    def delete_cancion(self, cancion_id: int) -> bool:
        return self.cancion_repo.delete(cancion_id)
    