from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from ..services.playlist_service import PlaylistService

class PlaylistController:
    def __init__(self):
        self.playlist_service = PlaylistService()

    def create_playlist(self, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_service.create_playlist(playlist_dto)

    def get_playlist_by_id(self, playlist_id: int) -> PlaylistResponseDTO:
        return self.playlist_service.get_playlist_by_id(playlist_id)

    def list_all_playlists(self) -> list[PlaylistResponseDTO]:
        return self.playlist_service.list_all_playlists()

    def delete_playlist(self, playlist_id: int) -> bool:
        return self.playlist_service.delete_playlist(playlist_id)
    
    def update_playlist(self, playlist_id: int, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_service.update_playlist(playlist_id, playlist_dto)