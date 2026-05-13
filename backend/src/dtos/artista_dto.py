from pydantic import BaseModel

class CreateArtistaDTO(BaseModel):
    nombre: str
    pais: str
    genero: str

class ArtistaResponseDTO(BaseModel):
    id: int
    nombre: str
    pais: str
    genero: str