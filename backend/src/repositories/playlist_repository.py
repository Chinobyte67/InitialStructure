from datetime import date
from sqlalchemy.orm import Session

from ..db.models.playlist_model import Playlist
from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from ..mappers.playlist_mapper import to_playlist_response
from ..repositories.user_repository import UserRepository
from ..utils.errors import ConflictError, ForbiddenError, NotFoundError

class PlaylistRepository:
    #(id, nombre, usuario_id, fecha_creacion, es_publica)
    def __init__(self, db: Session):
        self.db = db

    def _playlist_name_exists_for_user(self, usuario_id: int, nombre: str, exclude_id: int | None = None) -> bool:
        query = self.db.query(Playlist).filter(
            Playlist.usuario_id == usuario_id,
            Playlist.nombre == nombre,
        )
        if exclude_id is not None:
            query = query.filter(Playlist.id != exclude_id)
        return self.db.query(query.exists()).scalar()

    def create(self, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        if not playlist_dto.usuario_id or not UserRepository(self.db).find_by_id(playlist_dto.usuario_id):
            raise NotFoundError("El usuario solicitado no existe")

        if self._playlist_name_exists_for_user(playlist_dto.usuario_id, playlist_dto.nombre):
            raise ConflictError("Ya existe una playlist con ese nombre para este usuario")

        playlist = Playlist(
            nombre=playlist_dto.nombre,
            usuario_id=playlist_dto.usuario_id,
            fecha_creacion=playlist_dto.fecha_creacion or date.today().isoformat(),
            es_publica=playlist_dto.es_publica if playlist_dto.es_publica is not None else 0,
        )
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

        new_nombre = updated_data.get("nombre", playlist.nombre)
        new_usuario_id = updated_data.get("usuario_id", playlist.usuario_id)
        if self._playlist_name_exists_for_user(new_usuario_id, new_nombre, exclude_id=playlist_id):
            raise ConflictError("Ya existe una playlist con ese nombre para este usuario")

        for key, value in updated_data.items():
            setattr(playlist, key, value)
        self.db.commit()
        self.db.refresh(playlist)
        return to_playlist_response(playlist)
    
    def delete(self, playlist_id: int, usuario_id: int) -> bool:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return False
        if playlist.usuario_id != usuario_id:
            raise ForbiddenError("Solo el dueño de la playlist puede eliminarla")
        self.db.delete(playlist)
        self.db.commit()
        return True

    def list_all(self) -> list[PlaylistResponseDTO]:
        playlists = self.db.query(Playlist).all()
        return [to_playlist_response(playlist) for playlist in playlists]