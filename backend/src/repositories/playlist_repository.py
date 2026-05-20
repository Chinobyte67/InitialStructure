from sqlalchemy.orm import Session

from ..db.models.playlist_model import Playlist
from ..dtos.playlist_dto import PlaylistResponseDTO
from ..mappers.playlist_mapper import to_playlist_response

class PlaylistRepository:
    #(id, nombre, usuario_id, fecha_creacion, es_publica)
    def __init__(self, db: Session):
        self.db = db

    def create(self, playlist: Playlist) -> PlaylistResponseDTO:
        self.db.add(playlist)
        self.db.commit()
        self.db.refresh(playlist)
        return to_playlist_response(playlist)

    def find_by_id(self, playlist_id: int) -> PlaylistResponseDTO | None:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return None
        return to_playlist_response(playlist)
    
    def update(self, playlist_id: int, updated_data: dict) -> PlaylistResponseDTO | None:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return None
        for key, value in updated_data.items():
            setattr(playlist, key, value)
        self.db.commit()
        self.db.refresh(playlist)
        return to_playlist_response(playlist)
    
    def delete(self, playlist_id: int) -> bool:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return False
        self.db.delete(playlist)
        self.db.commit()
        return True

    def list_all(self) -> list[PlaylistResponseDTO]:
        playlists = self.db.query(Playlist).all()
        return [to_playlist_response(playlist) for playlist in playlists]