from sqlalchemy import Column, Integer, String

from src.db.connection import Base

# (id, titulo, duracion_seg, album_id, url_audio)


class Cancion(Base):
    __tablename__ = "cancion"

    id = Column(Integer, primary_key=True)
    titulo = Column(String, unique=True, nullable=False)
    duracion_seg = Column(Integer, nullable=False)
    album_id = Column(Integer, nullable=False)
    # URL del archivo de audio alojado en Cloudinary (resource_type=video).
    url_audio = Column(String, nullable=True)
