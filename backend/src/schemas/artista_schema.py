from pydantic import BaseModel

class CreateArtistaSchema(BaseModel):
    nombre: str
    pais: str
    genero: str

class UpdateArtistaSchema(BaseModel):
    nombre: str | None = None
    pais: str | None = None
    genero: str | None = None