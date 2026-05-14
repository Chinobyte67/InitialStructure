from pydantic import BaseModel

class CreateAlbumSchema(BaseModel):
    titulo: str
    anio: int
    artista_id: int

class UpdateAlbumSchema(BaseModel):
    titulo: str | None = None
    anio: int | None = None
    artista_id: int | None = None