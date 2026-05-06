from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#(id, nombre, usuario_id, fecha_creacion, es_publica)

class Playlist(Base):
    
    __tablename__ = "playlist"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    usuario_id = Column(Integer, nullable=False)
    fecha_creacion = Column(String, nullable=False)
    es_publica = Column(Integer, nullable=False)