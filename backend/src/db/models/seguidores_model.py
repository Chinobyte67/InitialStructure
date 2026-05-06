from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#(usuario_id, artista_id)

class Seguidores(Base):
    
    __tablename__ = "seguidores"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, nullable=False)
    artista_id = Column(Integer, nullable=False)