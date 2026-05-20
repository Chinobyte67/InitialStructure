# TODO: definir CreateProductSchema y UpdateProductSchema con Pydantic
# Seguí el patrón de user_schema.py

from pydantic import BaseModel

class CreateCancionSchema(BaseModel):
    titulo: str
    duracion_seg: int
    album_id: int
    url_audio: str | None = None

class UpdateCancionSchema(BaseModel):
    # TODO: completar con los campos opcionales que se permiten actualizar.
    # Tip: todos los campos van como Optional / con default None.
    id: int
    titulo: str | None = None  
    duracion_seg: int | None = None