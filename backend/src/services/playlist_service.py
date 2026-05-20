from sqlalchemy.orm import Session

from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from ..repositories.playlist_repository import PlaylistRepository

class PlaylistController:
    def __init__(self, db: Session):
        self.playlist_repository = PlaylistRepository(db)

    def create_playlist(self, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_repository.create(playlist_dto)

    def get_playlist_by_id(self, playlist_id: int) -> PlaylistResponseDTO | None:
        return self.playlist_repository.find_by_id(playlist_id)

    def list_all_playlists(self) -> list[PlaylistResponseDTO]:
        return self.playlist_repository.list_all()

    def delete_playlist(self, playlist_id: int, usuario_id: int) -> bool:
        return self.playlist_repository.delete(playlist_id, usuario_id)
    
    def update_playlist(self, playlist_id: int, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO | None:
        return self.playlist_repository.update(playlist_id, playlist_dto)