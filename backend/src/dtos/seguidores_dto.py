#(usuario_id, artista_id)

from ..db.models.seguidores_model import Seguidores

class SeguidoresResponseDTO:
    id: int
    usuario_id: int
    artista_id: int

class CreateSeguidoresDTO:
    usuario_id: int
    artista_id: int