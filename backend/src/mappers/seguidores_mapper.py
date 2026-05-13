from ..db.models.seguidores_model import Seguidores
from ..dtos.seguidores_dto import SeguidoresResponseDTO

def to_seguidores_response(seguidores: Seguidores) -> SeguidoresResponseDTO:
    return SeguidoresResponseDTO(
        id=seguidores.id,
        usuario_id=seguidores.usuario_id,
        artista_id=seguidores.artista_id
    )