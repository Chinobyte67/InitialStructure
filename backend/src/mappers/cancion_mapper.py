# TODO: implementar to_product_response(product: Product) -> ProductResponseDTO

from ..db.models.cancion_model import Cancion
from ..dtos.cancion_dto import CancionResponseDTO 

def to_cancion_response(cancion: Cancion) -> CancionResponseDTO:
    return CancionResponseDTO(
        id=cancion.id,
        titulo=cancion.titulo,
        duracion_seg=cancion.duracion_seg,
        album_id=cancion.album_id,
        url_audio=cancion.url_audio,
    )

