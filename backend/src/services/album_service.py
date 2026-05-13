from ..dtos.album_dto import AlbumCreateDTO, AlbumResponseDTO
from ..repositories.album_repository import AlbumRepository

class AlbumService:
    def __init__(self):
        self.album_repo = AlbumRepository()

    def create_album(self, album_dto: AlbumCreateDTO) -> AlbumResponseDTO:
        return self.album_repo.create(album_dto)

    def get_album_by_id(self, album_id: int) -> AlbumResponseDTO:
        return self.album_repo.find_by_id(album_id)

    def list_all_albums(self) -> list[AlbumResponseDTO]:
        return self.album_repo.list_all()

    def update_album(self, album_id: int, album_dto: AlbumCreateDTO) -> AlbumResponseDTO:
        return self.album_repo.update(album_id, album_dto)

    def delete_album(self, album_id: int) -> bool:
        return self.album_repo.delete(album_id)