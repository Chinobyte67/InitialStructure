from sqlalchemy.orm import Session

from ..dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO, UpdatePlaylistCancionesDTO, PlaylistCancionesResponseDTO
from ..repositories.playlist_canciones_repository import PlaylistCancionesRepository
from ..repositories.playlist_colaboradores_repository import PlaylistColaboradoresRepository
from ..repositories.playlist_repository import PlaylistRepository
from ..utils.errors import ForbiddenError, NotFoundError

class PlaylistCancionesService:
    def __init__(self, db: Session):
        self.playlist_canciones_repo = PlaylistCancionesRepository(db)
        self.playlist_repository = PlaylistRepository(db)
        self.playlist_colaboradores_repo = PlaylistColaboradoresRepository(db)

    def _verify_write_access(self, playlist_id: int, usuario_id: int) -> None:
        playlist = self.playlist_repository.find_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        if playlist.usuario_id == usuario_id:
            return

        if playlist.colaborativa != 1:
            raise ForbiddenError("No tienes permiso para modificar esta playlist")

        if not self.playlist_colaboradores_repo.is_collaborator(playlist_id, usuario_id):
            raise ForbiddenError("No tienes permiso para modificar esta playlist")

    def create_playlist_canciones(self, playlist_canciones_dto: CreatePlaylistCancionesDTO, usuario_id: int) -> PlaylistCancionesResponseDTO:
        self._verify_write_access(playlist_canciones_dto.playlist_id, usuario_id)
        return self.playlist_canciones_repo.create(playlist_canciones_dto)

    def get_playlist_canciones_by_id(self, playlist_canciones_id: int) -> PlaylistCancionesResponseDTO:
        return self.playlist_canciones_repo.find_by_id(playlist_canciones_id)

    def list_all_playlist_canciones(self) -> list[PlaylistCancionesResponseDTO]:
        return self.playlist_canciones_repo.list_all()

    def list_playlist_canciones_by_playlist_id(self, playlist_id: int, current_user = None) -> list[PlaylistCancionesResponseDTO]:
        playlist = self.playlist_repository.find_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        if playlist.es_publica != 1 and not self._can_view_private(playlist, current_user):
            raise NotFoundError("Playlist not found")

        return self.playlist_canciones_repo.list_by_playlist(playlist_id)

    def _can_view_private(self, playlist, current_user) -> bool:
        if current_user is None:
            return False
        return current_user.id == playlist.usuario_id or current_user.is_admin

    def delete_playlist_canciones(self, playlist_canciones_id: int, usuario_id: int) -> bool:
        playlist_canciones = self.playlist_canciones_repo.find_by_id(playlist_canciones_id)
        if not playlist_canciones:
            return False
        self._verify_write_access(playlist_canciones.playlist_id, usuario_id)
        return self.playlist_canciones_repo.delete(playlist_canciones_id)

    def delete_playlist_canciones_by_playlist_and_cancion(self, playlist_id: int, cancion_id: int, usuario_id: int) -> bool:
        playlist_canciones = self.playlist_canciones_repo.find_by_playlist_and_song(playlist_id, cancion_id)
        if not playlist_canciones:
            return False
        self._verify_write_access(playlist_id, usuario_id)
        return self.playlist_canciones_repo.delete_by_playlist_and_song(playlist_id, cancion_id)
    
    def update_playlist_canciones(self, playlist_canciones_id: int, playlist_canciones_dto: UpdatePlaylistCancionesDTO, usuario_id: int) -> PlaylistCancionesResponseDTO:
        playlist_canciones = self.playlist_canciones_repo.find_by_id(playlist_canciones_id)
        if not playlist_canciones:
            raise NotFoundError("Playlist song entry not found")
        self._verify_write_access(playlist_canciones.playlist_id, usuario_id)
        return self.playlist_canciones_repo.update(playlist_canciones_id, playlist_canciones_dto)