from sqlalchemy.orm import Session

from ..dtos.album_dto import CreateAlbumDTO, UpdateAlbumDTO, AlbumResponseDTO
from ..repositories.album_repository import AlbumRepository
from ..repositories.artista_repository import ArtistaRepository
from ..utils.errors import NotFoundError

class AlbumService:
    def __init__(self, db: Session):
        self.album_repo = AlbumRepository(db)
        self.artista_repo = ArtistaRepository(db)

    def create_album(self, album_dto: CreateAlbumDTO) -> AlbumResponseDTO:
        if not self.artista_repo.find_by_id(album_dto.artista_id):
            raise NotFoundError("Artista no encontrado")
        return self.album_repo.create(album_dto)

    def get_album_by_id(self, album_id: int) -> AlbumResponseDTO | None:
        return self.album_repo.find_by_id(album_id)

    def list_albums(self, artista_id: int | None = None) -> list[AlbumResponseDTO]:
        return self.album_repo.list_all(artista_id)

    def update_album(self, album_id: int, album_dto: UpdateAlbumDTO) -> AlbumResponseDTO | None:
        return self.album_repo.update(album_id, album_dto)

    def delete_album(self, album_id: int) -> bool:
        return self.album_repo.delete(album_id)