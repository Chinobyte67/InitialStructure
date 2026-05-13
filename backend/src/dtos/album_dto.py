from pydantic import BaseModel

class CreateAlbumDTO(BaseModel):
    titulo: str
    artista: str
    anio: int
    artista_id: int

class AlbumResponseDTO(BaseModel):
    id: int
    titulo: str
    artista: str
    anio: int
    artista_id: int