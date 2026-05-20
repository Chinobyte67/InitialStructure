from pydantic import BaseModel

class CreateReproduccionSchema(BaseModel):
    nombre: str
    descripcion: str | None = None
    imagen_url: str | None = None

class UpdateReproduccionSchema(BaseModel):
    id: int
    nombre: str | None = None
    descripcion: str | None = None
    imagen_url: str | None = None