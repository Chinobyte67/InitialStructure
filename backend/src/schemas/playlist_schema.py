from pydantic import BaseModel

class CreatePlaylistSchema(BaseModel):
    nombre: str
    descripcion: str | None = None
    imagen_url: str | None = None

class UpdatePlaylistSchema(BaseModel):
    id: int
    nombre: str | None = None
    descripcion: str | None = None
    imagen_url: str | None = None
