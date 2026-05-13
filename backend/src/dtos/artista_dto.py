from pydantic import BaseModel

class CreateAlbumDTO(BaseModel):
    nombre: str
    pais: str
    genero: str

class UpdateAlbumDTO(BaseModel):
    id: int
    nombre: str
    pais: str
    genero: str