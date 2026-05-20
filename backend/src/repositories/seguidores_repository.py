from sqlalchemy.orm import Session

from ..db.models.seguidores_model import Seguidores
from ..dtos.seguidores_dto import SeguidoresResponseDTO
from ..mappers.seguidores_mapper import to_seguidores_response

class SeguidoresRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, usuario_id: int, artista_id: int) -> SeguidoresResponseDTO:
        seguidores = Seguidores(usuario_id=usuario_id, artista_id=artista_id)
        self.db.add(seguidores)
        self.db.commit()
        self.db.refresh(seguidores)
        return to_seguidores_response(seguidores)
    
    def find_by_id(self, id: int) -> SeguidoresResponseDTO | None:
        seguidores = self.db.query(Seguidores).filter(Seguidores.id == id).first()
        if seguidores:
            return to_seguidores_response(seguidores)
        return None

    def list_all(self) -> list[SeguidoresResponseDTO]:
        seguidores_list = self.db.query(Seguidores).all()
        return [to_seguidores_response(seguidores) for seguidores in seguidores_list]

    def delete(self, id: int) -> bool:
        seguidores = self.db.query(Seguidores).filter(Seguidores.id == id).first()
        if seguidores:
            self.db.delete(seguidores)
            self.db.commit()
            return True
        return False

    def update(self, id: int, usuario_id: int, artista_id: int) -> SeguidoresResponseDTO | None:
        seguidores = self.db.query(Seguidores).filter(Seguidores.id == id).first()
        if seguidores:
            seguidores.usuario_id = usuario_id
            seguidores.artista_id = artista_id
            self.db.commit()
            self.db.refresh(seguidores)
            return to_seguidores_response(seguidores)
        return None