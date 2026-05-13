#(usuario_id, cancion_id)

from pydantic import BaseModel

class FavoritosResponseDTO(BaseModel):
    id: int
    usuario_id: int
    cancion_id: int

class CreateFavoritosDTO(BaseModel):
    usuario_id: int
    cancion_id: int