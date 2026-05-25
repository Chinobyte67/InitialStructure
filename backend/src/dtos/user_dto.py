from datetime import datetime
from pydantic import BaseModel

from src.dtos.cancion_dto import CancionResponseDTO
from src.dtos.artista_dto import ArtistaResponseDTO


class CreateUserDTO(BaseModel):
    email: str
    password: str
    nombre: str | None = None
    plan: str = "free"


class UserResponseDTO(BaseModel):
    id: int
    email: str
    nombre: str | None = None
    plan: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UsuarioResumenAnualDTO(BaseModel):
    top_canciones: list[CancionResponseDTO]
    top_artistas: list[ArtistaResponseDTO]
    top_generos: list[str]
    total_minutos_escuchados: float
    cantidad_canciones_distintas: int