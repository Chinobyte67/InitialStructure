from pydantic import BaseModel

class CreateArtistaDTO(BaseModel):
    nombre: str
    pais: str
    genero: str

class UpdateArtistaDTO(BaseModel):
    id: int
    nombre: str
    pais: str
    genero: str