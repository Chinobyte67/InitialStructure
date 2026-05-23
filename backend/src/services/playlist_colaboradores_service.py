from sqlalchemy.orm import Session

from ..repositories.playlist_colaboradores_repository import PlaylistColaboradoresRepository
from ..repositories.playlist_repository import PlaylistRepository
from ..repositories.user_repository import UserRepository
from ..utils.errors import ConflictError, ForbiddenError, NotFoundError


class PlaylistColaboradoresService:
    def __init__(self, db: Session):
        self.db = db
        self.playlist_repository = PlaylistRepository(db)
        self.playlist_colaboradores_repo = PlaylistColaboradoresRepository(db)
        self.user_repository = UserRepository(db)

    def _get_playlist(self, playlist_id: int):
        playlist = self.playlist_repository.find_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")
        return playlist

    def _ensure_owner(self, playlist, requester_id: int):
        if playlist.usuario_id != requester_id:
            raise ForbiddenError("Solo el dueño puede modificar los colaboradores")

    def add_collaborator(self, playlist_id: int, usuario_id: int, usuario_dueno_id: int):
        playlist = self._get_playlist(playlist_id)
        self._ensure_owner(playlist, usuario_dueno_id)

        if playlist.colaborativa != 1:
            raise ConflictError("La playlist no está marcada como colaborativa")

        if usuario_id == playlist.usuario_id:
            raise ConflictError("El dueño no puede ser colaborador")

        if not self.user_repository.find_by_id(usuario_id):
            raise NotFoundError("El usuario solicitado no existe")

        self.playlist_colaboradores_repo.add_collaborator(playlist_id, usuario_id)
        return self.playlist_repository.find_by_id(playlist_id)

    def remove_collaborator(self, playlist_id: int, usuario_id: int, usuario_dueno_id: int):
        playlist = self._get_playlist(playlist_id)
        self._ensure_owner(playlist, usuario_dueno_id)

        if not self.playlist_colaboradores_repo.remove_collaborator(playlist_id, usuario_id):
            raise NotFoundError("El colaborador no existe en esta playlist")

        return self.playlist_repository.find_by_id(playlist_id)
