from datetime import date
from sqlalchemy.orm import Session

from ..db.models.playlist_model import Playlist
from ..db.models.playlist_canciones_model import PlaylistCanciones
from ..db.models.playlist_colaborador_model import PlaylistColaborador
from ..db.models.usuario_model import User
from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from ..mappers.playlist_mapper import to_playlist_response
from ..repositories.playlist_canciones_repository import PlaylistCancionesRepository
from ..repositories.playlist_colaboradores_repository import PlaylistColaboradoresRepository
from ..repositories.user_repository import UserRepository
from ..utils.errors import ConflictError, ForbiddenError, NotFoundError

class PlaylistRepository:
    #(id, nombre, usuario_id, fecha_creacion, es_publica)
    def __init__(self, db: Session):
        self.db = db
        self.playlist_colaboradores_repository = PlaylistColaboradoresRepository(db)
        self.playlist_canciones_repository = PlaylistCancionesRepository(db)

    def _get_playlist_canciones(self, playlist_id: int):
        return self.playlist_canciones_repository.list_by_playlist(playlist_id)

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
            colaborativa=playlist_dto.colaborativa if playlist_dto.colaborativa is not None else 0,
        )
        self.db.add(playlist)
        self.db.commit()
        self.db.refresh(playlist)
        return to_playlist_response(
            playlist,
            self.playlist_colaboradores_repository.list_collaborators(playlist.id),
            self._get_playlist_canciones(playlist.id),
        )

    def find_by_id(self, playlist_id: int) -> PlaylistResponseDTO | None:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return None
        return to_playlist_response(
            playlist,
            self.playlist_colaboradores_repository.list_collaborators(playlist.id),
            self._get_playlist_canciones(playlist.id),
        )
    
    def update(self, playlist_id: int, updated_data: dict | CreatePlaylistDTO) -> PlaylistResponseDTO | None:
        if hasattr(updated_data, "model_dump"):
            updated_data = {k: v for k, v in updated_data.model_dump().items() if v is not None}
        elif hasattr(updated_data, "dict"):
            updated_data = {k: v for k, v in updated_data.dict().items() if v is not None}
        else:
            updated_data = {k: v for k, v in dict(updated_data).items() if v is not None}

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
        return to_playlist_response(
            playlist, 
            self.playlist_colaboradores_repository.list_collaborators(playlist.id),
            self._get_playlist_canciones(playlist.id)
        )
    
    def delete(self, playlist_id: int, usuario_id: int) -> bool:
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            return False
        
        # Verificar si el usuario es admin
        user = self.db.query(User).filter(User.id == usuario_id).first()
        is_admin = user and user.is_admin
        
        print(f"\n=== DELETE PLAYLIST DEBUG ===")
        print(f"Playlist ID: {playlist_id}")
        print(f"Playlist Owner: {playlist.usuario_id}")
        print(f"User ID requesting delete: {usuario_id}")
        print(f"User found: {user is not None}")
        if user:
            print(f"User email: {user.email}")
            print(f"User is_admin: {user.is_admin}")
        print(f"is_admin flag: {is_admin}")
        print(f"usuario_id == playlist.usuario_id: {usuario_id == playlist.usuario_id}")
        print(f"Allow delete: {usuario_id == playlist.usuario_id or is_admin}")
        print(f"=== END DEBUG ===\n")
        
        # Permitir eliminar si es el dueño O si es admin
        if playlist.usuario_id != usuario_id and not is_admin:
            raise ForbiddenError("Solo el dueño de la playlist puede eliminarla")

        self.db.query(PlaylistCanciones).filter(PlaylistCanciones.playlist_id == playlist_id).delete(synchronize_session=False)
        self.db.query(PlaylistColaborador).filter(PlaylistColaborador.playlist_id == playlist_id).delete(synchronize_session=False)
        self.db.delete(playlist)
        self.db.commit()
        return True

    def list_all(self) -> list[PlaylistResponseDTO]:
        playlists = self.db.query(Playlist).all()
        return [
            to_playlist_response(playlist, self.playlist_colaboradores_repository.list_collaborators(playlist.id))
            for playlist in playlists
        ]