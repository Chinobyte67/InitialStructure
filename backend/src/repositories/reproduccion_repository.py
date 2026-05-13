from ..db.models.reproduccion_model import Reproduccion
from ..dtos.reproduccion_dto import ReproduccionResponseDTO
from ..mappers.reproduccion_mapper import to_reproduccion_response

class ReproduccionRepository:
    def create(self, usuario_id: int, cancion_id: int, fecha: str, segundos_escuchados: int) -> ReproduccionResponseDTO:
        nueva_reproduccion = Reproduccion(
            usuario_id=usuario_id,
            cancion_id=cancion_id,
            fecha=fecha,
            segundos_escuchados=segundos_escuchados
        )
        nueva_reproduccion.save()
        return to_reproduccion_response(nueva_reproduccion)
    
    def find_by_id(self, reproduccion_id: int) -> ReproduccionResponseDTO:
        reproduccion = Reproduccion.get_by_id(reproduccion_id)
        return to_reproduccion_response(reproduccion)
    
    def list_all(self) -> list[ReproduccionResponseDTO]:
        reproducciones = Reproduccion.select()
        return [to_reproduccion_response(r) for r in reproducciones]
    
    def delete(self, reproduccion_id: int) -> None:
        reproduccion = Reproduccion.get_by_id(reproduccion_id)
        reproduccion.delete_instance()

    def update(self, reproduccion_id: int, usuario_id: int, cancion_id: int, fecha: str, segundos_escuchados: int) -> ReproduccionResponseDTO:
        reproduccion = Reproduccion.get_by_id(reproduccion_id)
        reproduccion.usuario_id = usuario_id
        reproduccion.cancion_id = cancion_id
        reproduccion.fecha = fecha
        reproduccion.segundos_escuchados = segundos_escuchados
        reproduccion.save()
        return to_reproduccion_response(reproduccion)