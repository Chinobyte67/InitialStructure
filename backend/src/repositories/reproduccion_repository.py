from sqlalchemy.orm import Session

from ..db.models.reproduccion_model import Reproduccion
from ..dtos.reproduccion_dto import ReproduccionResponseDTO
from ..mappers.reproduccion_mapper import to_reproduccion_response

class ReproduccionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, usuario_id: int, cancion_id: int, fecha: str, segundos_escuchados: int) -> ReproduccionResponseDTO:
        nueva_reproduccion = Reproduccion(
            usuario_id=usuario_id,
            cancion_id=cancion_id,
            fecha=fecha,
            segundos_escuchados=segundos_escuchados
        )
        self.db.add(nueva_reproduccion)
        self.db.commit()
        self.db.refresh(nueva_reproduccion)
        return to_reproduccion_response(nueva_reproduccion)
    
    def find_by_id(self, reproduccion_id: int) -> ReproduccionResponseDTO | None:
        reproduccion = self.db.query(Reproduccion).filter(Reproduccion.id == reproduccion_id).first()
        if not reproduccion:
            return None
        return to_reproduccion_response(reproduccion)
    
    def list_all(self) -> list[ReproduccionResponseDTO]:
        reproducciones = self.db.query(Reproduccion).all()
        return [to_reproduccion_response(r) for r in reproducciones]
    
    def delete(self, reproduccion_id: int) -> bool:
        reproduccion = self.db.query(Reproduccion).filter(Reproduccion.id == reproduccion_id).first()
        if not reproduccion:
            return False
        self.db.delete(reproduccion)
        self.db.commit()
        return True

    def update(self, reproduccion_id: int, usuario_id: int, cancion_id: int, fecha: str, segundos_escuchados: int) -> ReproduccionResponseDTO | None:
        reproduccion = self.db.query(Reproduccion).filter(Reproduccion.id == reproduccion_id).first()
        if not reproduccion:
            return None
        reproduccion.usuario_id = usuario_id
        reproduccion.cancion_id = cancion_id
        reproduccion.fecha = fecha
        reproduccion.segundos_escuchados = segundos_escuchados
        self.db.commit()
        self.db.refresh(reproduccion)
        return to_reproduccion_response(reproduccion)