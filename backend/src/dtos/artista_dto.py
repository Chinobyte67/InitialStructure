from pydantic import BaseModel

class CreateArtistaDTO(BaseModel):
    nombre: str
    pais: str
    genero: str

class UpdateArtistaDTO(BaseModel):
    nombre: str | None = None
    pais: str | None = None
    genero: str | None = None

class ArtistaResponseDTO(BaseModel):
    id: int
    nombre: str
    pais: str
    genero: str