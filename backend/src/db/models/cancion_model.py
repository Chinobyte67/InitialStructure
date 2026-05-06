# TODO: definir el modelo Product (id, name, price, stock, created_at, etc.)
# Seguí el patrón de user_model.py
#
# from sqlalchemy import Column, Integer, String, Numeric
# from src.db.connection import Base
#
# class Product(Base):
#     __tablename__ = "products"
#     ...

from sqlalchemy import Column, Integer, String, Numeric

from src.db.connection import Base

#id, titulo, duracion_seg, album_id

class Cancion(Base):
    __tablename__ = "cancion"

    id = Column(Integer, primary_key=True)
    titulo = Column(String, unique=True, nullable=False)
    duracion_seg = Column(Integer, nullable=False)
    album_id = Column(Integer, nullable=False)
