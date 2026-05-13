from ..db.models.favoritos_model import Favoritos
from ..dtos.favoritos_dto import FavoritosResponseDTO

def to_favoritos_response(favoritos: Favoritos) -> FavoritosResponseDTO:
    return FavoritosResponseDTO(
        id=favoritos.id,
        usuario_id=favoritos.usuario_id,
        cancion_id=favoritos.cancion_id
    )