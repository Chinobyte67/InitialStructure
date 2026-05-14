# TODO: implementar ProductService con la misma estructura que UserService

from sqlalchemy.orm import Session

from ..dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from ..repositories.album_repository import AlbumRepository
from ..repositories.cancion_repository import CancionRepository
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

    def list_all_canciones(self) -> list[CancionResponseDTO]:
        return self.cancion_repo.list_all()

    def update_cancion(self, cancion_id: int, cancion_dto: CreateCancionDTO) -> CancionResponseDTO | None:
        return self.cancion_repo.update(cancion_id, cancion_dto)

    def delete_cancion(self, cancion_id: int) -> bool:
        return self.cancion_repo.delete(cancion_id)
    