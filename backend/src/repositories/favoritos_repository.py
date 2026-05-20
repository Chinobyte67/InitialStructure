from sqlalchemy.orm import Session

from ..db.models.favoritos_model import Favoritos
from ..dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from ..mappers.favoritos_mapper import to_favoritos_response

class FavoritosRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO:
        favoritos = Favoritos(
            usuario_id=favoritos_dto.usuario_id,
            cancion_id=favoritos_dto.cancion_id,
        )
        self.db.add(favoritos)
        self.db.commit()
        self.db.refresh(favoritos)
        return to_favoritos_response(favoritos)
    
    def find_by_id(self, favoritos_id: int) -> FavoritosResponseDTO | None:
        favoritos = self.db.query(Favoritos).filter(Favoritos.id == favoritos_id).first()
        if not favoritos:
            return None
        return to_favoritos_response(favoritos)
    
    def list_all(self) -> list[FavoritosResponseDTO]:
        favoritos_list = self.db.query(Favoritos).all()
        return [to_favoritos_response(f) for f in favoritos_list]
    
    def delete(self, favoritos_id: int) -> bool:
        favoritos = self.db.query(Favoritos).filter(Favoritos.id == favoritos_id).first()
        if not favoritos:
            return False
        self.db.delete(favoritos)
        self.db.commit()
        return True
    
    def update(self, favoritos_id: int, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO | None:
        favoritos = self.db.query(Favoritos).filter(Favoritos.id == favoritos_id).first()
        if not favoritos:
            return None
        favoritos.usuario_id = favoritos_dto.usuario_id
        favoritos.cancion_id = favoritos_dto.cancion_id
        self.db.commit()
        self.db.refresh(favoritos)
        return to_favoritos_response(favoritos)