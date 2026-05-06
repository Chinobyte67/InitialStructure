# TODO: implementar ProductService con la misma estructura que UserService

from ..dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from ..repositories.cancion_repository import CancionRepository

class CancionService:
    def __init__(self):
        self.cancion_repo = CancionRepository()

    def create_cancion(self, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        return self.cancion_repo.create(cancion_dto)

    def get_cancion_by_id(self, cancion_id: int) -> CancionResponseDTO:
        return self.cancion_repo.find_by_id(cancion_id)

    def list_all_canciones(self) -> list[CancionResponseDTO]:
        return self.cancion_repo.list_all()

    def update_cancion(self, cancion_id: int, cancion_dto: CreateCancionDTO) -> CancionResponseDTO:
        return self.cancion_repo.update(cancion_id, cancion_dto)

    def delete_cancion(self, cancion_id: int) -> bool:
        return self.cancion_repo.delete(cancion_id)
    
    