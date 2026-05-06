# TODO: implementar ProductRepository (create, find_by_id, list_all, update, delete)
# Seguí el patrón de user_repository.py

from backend.src.db.models.cancion_model import Cancion
from backend.src.dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from backend.src.mappers.cancion_mapper import to_cancion_response      

class CancionRepository:   
    def create(self, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        cancion = Cancion(
            titulo=cancion_dto.titulo,
            duracion_seg=cancion_dto.duracion_seg,
            album_id=cancion_dto.album_id
        )
        cancion.save()
        return to_cancion_response(cancion)

    def find_by_id(self, cancion_id: int) -> CancionResponseDTO:
        cancion = Cancion.query.get(cancion_id)
        if not cancion:
            return None
        return to_cancion_response(cancion)

    def list_all(self) -> list[CancionResponseDTO]:
        canciones = Cancion.query.all()
        return [to_cancion_response(c) for c in canciones]

    def update(self, cancion_id: int, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        cancion = Cancion.query.get(cancion_id)
        if not cancion:
            return None
        cancion.titulo = cancion_dto.titulo
        cancion.duracion_seg = cancion_dto.duracion_seg
        cancion.album_id = cancion_dto.album_id
        cancion.save()
        return to_cancion_response(cancion)

    def delete(self, cancion_id: int) -> bool:
        cancion = Cancion.query.get(cancion_id)
        if not cancion:
            return False
        cancion.delete()
        return True