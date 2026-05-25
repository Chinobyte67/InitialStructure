from datetime import date
from sqlalchemy.orm import Session

from ..db.models.playlist_canciones_model import PlaylistCanciones
from ..dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO, UpdatePlaylistCancionesDTO
from ..mappers.playlist_canciones import to_playlist_canciones_response
from ..utils.errors import ConflictError

class PlaylistCancionesRepository:
    def __init__(self, db: Session):
        self.db = db

    def _exists_song_in_playlist(self, playlist_id: int, cancion_id: int, exclude_id: int | None = None) -> bool:
        query = self.db.query(PlaylistCanciones).filter(
            PlaylistCanciones.playlist_id == playlist_id,
            PlaylistCanciones.cancion_id == cancion_id,
        )
        if exclude_id is not None:
            query = query.filter(PlaylistCanciones.id != exclude_id)
        return self.db.query(query.exists()).scalar()

    def _next_order_for_playlist(self, playlist_id: int) -> int:
        max_order = (
            self.db.query(PlaylistCanciones)
            .filter(PlaylistCanciones.playlist_id == playlist_id)
            .order_by(PlaylistCanciones.orden.desc())
            .with_entities(PlaylistCanciones.orden)
            .limit(1)
            .scalar()
        )
        return (max_order or 0) + 1

    def create(self, playlist_canciones_dto: CreatePlaylistCancionesDTO):
        if self._exists_song_in_playlist(
            playlist_canciones_dto.playlist_id,
            playlist_canciones_dto.cancion_id,
        ):
            raise ConflictError("This song is already in the playlist")

        orden = playlist_canciones_dto.orden
        if orden is None:
            orden = self._next_order_for_playlist(playlist_canciones_dto.playlist_id)

        playlist_canciones = PlaylistCanciones(
            playlist_id=playlist_canciones_dto.playlist_id,
            cancion_id=playlist_canciones_dto.cancion_id,
            orden=orden,
            fecha_agregada=date.today().isoformat(),
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
    
    def _reorder_playlist(self, playlist_id: int) -> None:
        playlist_canciones_list = (
            self.db.query(PlaylistCanciones)
            .filter(PlaylistCanciones.playlist_id == playlist_id)
            .order_by(PlaylistCanciones.orden.asc(), PlaylistCanciones.id.asc())
            .all()
        )

        for index, playlist_canciones in enumerate(playlist_canciones_list, start=1):
            if playlist_canciones.orden != index:
                playlist_canciones.orden = index

        self.db.commit()

    def list_all(self):
        playlist_canciones_list = (
            self.db.query(PlaylistCanciones)
            .order_by(PlaylistCanciones.id.asc())
            .all()
        )
        return [to_playlist_canciones_response(pc) for pc in playlist_canciones_list]

    def list_by_playlist(self, playlist_id: int):
        playlist_canciones_list = (
            self.db.query(PlaylistCanciones)
            .filter(PlaylistCanciones.playlist_id == playlist_id)
            .order_by(PlaylistCanciones.orden.asc())
            .all()
        )
        return [to_playlist_canciones_response(pc) for pc in playlist_canciones_list]

    def find_by_playlist_and_song(self, playlist_id: int, cancion_id: int):
        playlist_canciones = (
            self.db.query(PlaylistCanciones)
            .filter(
                PlaylistCanciones.playlist_id == playlist_id,
                PlaylistCanciones.cancion_id == cancion_id,
            )
            .first()
        )
        if not playlist_canciones:
            return None
        return to_playlist_canciones_response(playlist_canciones)

    def delete_by_playlist_and_song(self, playlist_id: int, cancion_id: int) -> bool:
        playlist_canciones = (
            self.db.query(PlaylistCanciones)
            .filter(
                PlaylistCanciones.playlist_id == playlist_id,
                PlaylistCanciones.cancion_id == cancion_id,
            )
            .first()
        )
        if not playlist_canciones:
            return False

        self.db.delete(playlist_canciones)
        self.db.commit()
        self._reorder_playlist(playlist_id)
        return True

    def delete(self, playlist_canciones_id: int) -> bool:
        playlist_canciones = self.db.query(PlaylistCanciones).filter(PlaylistCanciones.id == playlist_canciones_id).first()
        if not playlist_canciones:
            return False

        playlist_id = playlist_canciones.playlist_id
        self.db.delete(playlist_canciones)
        self.db.commit()
        self._reorder_playlist(playlist_id)
        return True
    
    def update(self, playlist_canciones_id: int, playlist_canciones_dto: UpdatePlaylistCancionesDTO):
        playlist_canciones = self.db.query(PlaylistCanciones).filter(PlaylistCanciones.id == playlist_canciones_id).first()
        if not playlist_canciones:
            return None

        if (
            playlist_canciones_dto.playlist_id is not None
            and playlist_canciones_dto.cancion_id is not None
            and self._exists_song_in_playlist(
                playlist_canciones_dto.playlist_id,
                playlist_canciones_dto.cancion_id,
                exclude_id=playlist_canciones_id,
            )
        ):
            raise ConflictError("This song is already in the playlist")

        if playlist_canciones_dto.playlist_id is not None:
            playlist_canciones.playlist_id = playlist_canciones_dto.playlist_id
        if playlist_canciones_dto.cancion_id is not None:
            playlist_canciones.cancion_id = playlist_canciones_dto.cancion_id
        if playlist_canciones_dto.orden is not None:
            playlist_canciones.orden = playlist_canciones_dto.orden

        self.db.commit()
        self.db.refresh(playlist_canciones)
        return to_playlist_canciones_response(playlist_canciones)
    
    