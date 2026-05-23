#(usuario_id, artista_id)

from pydantic import BaseModel

from src.dtos.user_dto import UserResponseDTO

class SeguidoresResponseDTO(BaseModel):
    id: int
    usuario_id: int
    artista_id: int

class CreateSeguidoresDTO(BaseModel):
    usuario_id: int
    artista_id: int

class UsuariosSeguidoresResponseDTO(BaseModel):
    count: int
    usuarios: list[UserResponseDTO] = []
