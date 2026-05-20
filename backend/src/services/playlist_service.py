from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from ..repositories.playlist_repository import PlaylistRepository

class PlaylistController:
    def __init__(self):
        self.playlist_repository = PlaylistRepository()

    def create_playlist(self, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_repository.create_playlist(playlist_dto)

    def get_playlist_by_id(self, playlist_id: int) -> PlaylistResponseDTO:
        return self.playlist_repository.get_playlist_by_id(playlist_id)

    def list_all_playlists(self) -> list[PlaylistResponseDTO]:
        return self.playlist_repository.list_all_playlists()

    def delete_playlist(self, playlist_id: int) -> bool:
        return self.playlist_repository.delete_playlist(playlist_id)
    
    def update_playlist(self, playlist_id: int, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_repository.update_playlist(playlist_id, playlist_dto)