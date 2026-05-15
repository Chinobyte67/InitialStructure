#(usuario_id, artista_id)

from pydantic import BaseModel

class SeguidoresResponseDTO(BaseModel):
    id: int
    usuario_id: int
    artista_id: int

class CreateSeguidoresDTO(BaseModel):
    usuario_id: int
    artista_id: int