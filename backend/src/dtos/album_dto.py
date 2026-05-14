from pydantic import BaseModel

class CreateAlbumDTO(BaseModel):
    titulo: str
    anio: int
    artista_id: int

class UpdateAlbumDTO(BaseModel):
    titulo: str | None = None
    anio: int | None = None
    artista_id: int | None = None

class AlbumResponseDTO(BaseModel):
    id: int
    titulo: str
    anio: int
    artista_id: int