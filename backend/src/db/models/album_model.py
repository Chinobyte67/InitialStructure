from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#(id, titulo, anio, artista_id)

class Album(Base):
    __tablename__ = 'album'

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    anio = Column(Numeric, index=True)
    artista_id = Column(Integer, index=True)
