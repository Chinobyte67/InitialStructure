from ..db.models.playlist_model import Playlist
from ..dtos.playlist_dto import PlaylistResponseDTO
from ..mappers.playlist_mapper import to_playlist_response

class PlaylistRepository:
    #(id, nombre, usuario_id, fecha_creacion, es_publica)
    def create(self, playlist: Playlist) -> PlaylistResponseDTO:
        playlist.save()
        return to_playlist_response(playlist)

    def find_by_id(self, playlist_id: int) -> PlaylistResponseDTO:
        playlist = Playlist.get_by_id(playlist_id)
        return to_playlist_response(playlist)
    
    def update(self, playlist_id: int, updated_data: dict) -> PlaylistResponseDTO:
        playlist = Playlist.get_by_id(playlist_id)
        for key, value in updated_data.items():
            setattr(playlist, key, value)
        playlist.save()
        return to_playlist_response(playlist)
    
    def delete(self, playlist_id: int) -> None:
        playlist = Playlist.get_by_id(playlist_id)
        playlist.delete_instance()

    def list_all(self) -> list[PlaylistResponseDTO]:
        playlists = Playlist.select()
        return [to_playlist_response(playlist) for playlist in playlists]