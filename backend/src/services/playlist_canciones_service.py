from ..dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO, PlaylistCancionesResponseDTO
from ..repositories.playlist_canciones_repository import PlaylistCancionesRepository

class PlaylistCancionesService:
    def __init__(self):
        self.playlist_canciones_repo = PlaylistCancionesRepository()

    def create_playlist_canciones(self, playlist_canciones_dto: CreatePlaylistCancionesDTO) -> PlaylistCancionesResponseDTO:
        return self.playlist_canciones_repo.create(playlist_canciones_dto)

    def get_playlist_canciones_by_id(self, playlist_canciones_id: int) -> PlaylistCancionesResponseDTO:
        return self.playlist_canciones_repo.find_by_id(playlist_canciones_id)

    def list_all_playlist_canciones(self) -> list[PlaylistCancionesResponseDTO]:
        return self.playlist_canciones_repo.list_all()

    def delete_playlist_canciones(self, playlist_canciones_id: int) -> bool:
        return self.playlist_canciones_repo.delete(playlist_canciones_id)
    
    def update_playlist_canciones(self, playlist_canciones_id: int, playlist_canciones_dto: CreatePlaylistCancionesDTO) -> PlaylistCancionesResponseDTO:
        return self.playlist_canciones_repo.update(playlist_canciones_id, playlist_canciones_dto)