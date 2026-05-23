from sqlalchemy.orm import Session

from ..db.models.favoritos_model import Favoritos
from ..db.models.cancion_model import Cancion
from ..dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from ..mappers.favoritos_mapper import to_favoritos_response
from ..utils.errors import ConflictError

class FavoritosRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO:
        # Prevent duplicate favorites for same usuario and cancion
        exists = (
            self.db.query(Favoritos)
            .filter(
                Favoritos.usuario_id == favoritos_dto.usuario_id,
                Favoritos.cancion_id == favoritos_dto.cancion_id,
            )
            .count()
            > 0
        )
        if exists:
            raise ConflictError("La canción ya está marcada como favorita")

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

    def list_canciones_by_usuario(self, usuario_id: int) -> list[Cancion]:
        return (
            self.db.query(Cancion)
            .join(Favoritos, Favoritos.cancion_id == Cancion.id)
            .filter(Favoritos.usuario_id == usuario_id)
            .all()
        )
    
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

    def delete_by_usuario_and_cancion(self, usuario_id: int, cancion_id: int) -> bool:
        favoritos = (
            self.db.query(Favoritos)
            .filter(Favoritos.usuario_id == usuario_id, Favoritos.cancion_id == cancion_id)
            .first()
        )
        if not favoritos:
            return False
        self.db.delete(favoritos)
        self.db.commit()
        return True