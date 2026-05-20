from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

from src.db.connection import Base


class PlaylistColaborador(Base):
    __tablename__ = "playlist_colaboradores"

    id = Column(Integer, primary_key=True)
    playlist_id = Column(Integer, ForeignKey("playlist.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("playlist_id", "usuario_id", name="uix_playlist_colaborador"),
    )
