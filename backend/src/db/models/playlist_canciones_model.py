from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#(playlist_id, cancion_id, orden, fecha_agregada)

class PlaylistCanciones(Base): 
    __tablename__ = "playlist_canciones"

    id = Column(Integer, primary_key=True)
    playlist_id = Column(Integer, nullable=False)
    cancion_id = Column(Integer, nullable=False)
    orden = Column(Integer, nullable=False)
    fecha_agregada = Column(String, nullable=False)