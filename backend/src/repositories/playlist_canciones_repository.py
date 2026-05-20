from sqlalchemy.orm import Session

from ..db.models.playlist_canciones_model import PlaylistCanciones
from ..dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO
from ..mappers.playlist_canciones import to_playlist_canciones_response

class PlaylistCancionesRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, playlist_canciones_dto: CreatePlaylistCancionesDTO):
        playlist_canciones = PlaylistCanciones(
            playlist_id=playlist_canciones_dto.playlist_id,
            cancion_id=playlist_canciones_dto.cancion_id,
            orden=playlist_canciones_dto.orden,
            fecha_agregada=playlist_canciones_dto.fecha_agregada
        )
        self.db.add(playlist_canciones)
        self.db.commit()
        self.db.refresh(playlist_canciones)
        return to_playlist_canciones_response(playlist_canciones)
    
    def find_by_id(self, playlist_canciones_id: int):
        playlist_canciones = self.db.query(PlaylistCanciones).filter(PlaylistCanciones.id == playlist_canciones_id).first()
        if not playlist_canciones:
            return None
        return to_playlist_canciones_response(playlist_canciones)
    
    def list_all(self):
        playlist_canciones_list = self.db.query(PlaylistCanciones).all()
        return [to_playlist_canciones_response(pc) for pc in playlist_canciones_list]
    
    def delete(self, playlist_canciones_id: int) -> bool:
        playlist_canciones = self.db.query(PlaylistCanciones).filter(PlaylistCanciones.id == playlist_canciones_id).first()
        if not playlist_canciones:
            return False
        self.db.delete(playlist_canciones)
        self.db.commit()
        return True
    
    def update(self, playlist_canciones_id: int, playlist_canciones_dto: CreatePlaylistCancionesDTO):
        playlist_canciones = self.db.query(PlaylistCanciones).filter(PlaylistCanciones.id == playlist_canciones_id).first()
        if not playlist_canciones:
            return None
        playlist_canciones.playlist_id = playlist_canciones_dto.playlist_id
        playlist_canciones.cancion_id = playlist_canciones_dto.cancion_id
        playlist_canciones.orden = playlist_canciones_dto.orden
        playlist_canciones.fecha_agregada = playlist_canciones_dto.fecha_agregada
        self.db.commit()
        self.db.refresh(playlist_canciones)
        return to_playlist_canciones_response(playlist_canciones)
    
    