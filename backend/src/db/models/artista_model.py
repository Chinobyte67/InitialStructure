from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#(id, nombre, pais, genero_musical)

class Artista(Base):
    __tablename__ = 'artista'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    pais = Column(String, index=True)
    genero_musical = Column(String, index=True)