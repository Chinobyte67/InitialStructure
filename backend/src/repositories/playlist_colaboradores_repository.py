from sqlalchemy.orm import Session

from ..db.models.playlist_colaborador_model import PlaylistColaborador
from ..utils.errors import ConflictError


class PlaylistColaboradoresRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_collaborator(self, playlist_id: int, usuario_id: int) -> PlaylistColaborador:
        existing = (
            self.db.query(PlaylistColaborador)
            .filter(
                PlaylistColaborador.playlist_id == playlist_id,
                PlaylistColaborador.usuario_id == usuario_id,
            )
            .first()
        )
        if existing:
            raise ConflictError("El usuario ya es colaborador de esta playlist")

        colaborador = PlaylistColaborador(
            playlist_id=playlist_id,
            usuario_id=usuario_id,
        )
        self.db.add(colaborador)
        self.db.commit()
        self.db.refresh(colaborador)
        return colaborador

    def remove_collaborator(self, playlist_id: int, usuario_id: int) -> bool:
        colaborador = (
            self.db.query(PlaylistColaborador)
            .filter(
                PlaylistColaborador.playlist_id == playlist_id,
                PlaylistColaborador.usuario_id == usuario_id,
            )
            .first()
        )
        if not colaborador:
            return False
        self.db.delete(colaborador)
        self.db.commit()
        return True

    def list_collaborators(self, playlist_id: int) -> list[int]:
        colaboradores = (
            self.db.query(PlaylistColaborador)
            .filter(PlaylistColaborador.playlist_id == playlist_id)
            .all()
        )
        return [colaborador.usuario_id for colaborador in colaboradores]

    def is_collaborator(self, playlist_id: int, usuario_id: int) -> bool:
        return (
            self.db.query(PlaylistColaborador)
            .filter(
                PlaylistColaborador.playlist_id == playlist_id,
                PlaylistColaborador.usuario_id == usuario_id,
            )
            .count()
            > 0
        )
