# TODO: implementar ProductRepository (create, find_by_id, list_all, update, delete)
# Seguí el patrón de user_repository.py

from sqlalchemy.orm import Session

from ..db.models.cancion_model import Cancion
from ..dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from ..mappers.cancion_mapper import to_cancion_response      

class CancionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        cancion = Cancion(
            titulo=cancion_dto.titulo,
            duracion_seg=cancion_dto.duracion_seg,
            album_id=cancion_dto.album_id,
        )
        self.db.add(cancion)
        self.db.commit()
        self.db.refresh(cancion)
        return to_cancion_response(cancion)

    def find_by_id(self, cancion_id: int) -> CancionResponseDTO | None:
        cancion = self.db.query(Cancion).filter(Cancion.id == cancion_id).first()
        if not cancion:
            return None
        return to_cancion_response(cancion)

    def list_all(self) -> list[CancionResponseDTO]:
        canciones = self.db.query(Cancion).all()
        return [to_cancion_response(c) for c in canciones]

    def update(self, cancion_id: int, cancion_dto: CreateCancionDTO) -> CancionResponseDTO | None:
        cancion = self.db.query(Cancion).filter(Cancion.id == cancion_id).first()
        if not cancion:
            return None
        cancion.titulo = cancion_dto.titulo
        cancion.duracion_seg = cancion_dto.duracion_seg
        cancion.album_id = cancion_dto.album_id
        self.db.commit()
        self.db.refresh(cancion)
        return to_cancion_response(cancion)

    def delete(self, cancion_id: int) -> bool:
        cancion = self.db.query(Cancion).filter(Cancion.id == cancion_id).first()
        if not cancion:
            return False
        self.db.delete(cancion)
        self.db.commit()
        return True