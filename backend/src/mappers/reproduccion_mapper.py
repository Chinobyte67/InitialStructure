from ..db.models.reproduccion_model import Reproduccion
from ..dtos.reproduccion_dto import ReproduccionResponseDTO

def to_reproduccion_response(reproduccion: Reproduccion) -> ReproduccionResponseDTO:
    return ReproduccionResponseDTO(
        id=reproduccion.id,
        usuario_id=reproduccion.usuario_id,
        cancion_id=reproduccion.cancion_id,
        fecha=reproduccion.fecha,
        segundos_escuchados=reproduccion.segundos_escuchados,
        cuenta_para_estadisticas=bool(getattr(reproduccion, "cuenta_para_estadisticas", False)),
    )