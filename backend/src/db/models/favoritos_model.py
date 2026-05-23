from sqlalchemy import Column, Integer, String, Numeric, UniqueConstraint

from src.db.connection import Base

#(usuario_id, cancion_id)

class Favoritos(Base):
    __tablename__ = "favoritos"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, nullable=False)
    cancion_id = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("usuario_id", "cancion_id", name="uix_usuario_cancion"),
    )