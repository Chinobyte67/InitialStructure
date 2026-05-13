# TODO: definir CreateProductSchema y UpdateProductSchema con Pydantic
# Seguí el patrón de user_schema.py

from pydantic import BaseModel

class CreateCancionSchema(BaseModel):
    titulo: str
    duracion_seg: int
    album_id: int

class UpdateCancionSchema(BaseModel):
    id: int
    titulo: str | None = None
    duracion_seg: int | None = None
    album_id: int | None = None