from pydantic import BaseModel

class CreatePlaylistSchema(BaseModel):
    nombre: str
    usuario_id: int
    descripcion: str | None = None
    imagen_url: str | None = None
    es_publica: int | None = None

class UpdatePlaylistSchema(BaseModel):
    id: int
    nombre: str | None = None
    descripcion: str | None = None
    imagen_url: str | None = None
    es_publica: int | None = None
