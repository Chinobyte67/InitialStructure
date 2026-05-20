from sqlalchemy.orm import Session

from ..dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from ..repositories.favoritos_repository import FavoritosRepository

class FavoritosService:
    def __init__(self, db: Session):
        self.favoritos_repo = FavoritosRepository(db)

    def create_favoritos(self, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO:
        return self.favoritos_repo.create(favoritos_dto)

    def get_favoritos_by_id(self, favoritos_id: int) -> FavoritosResponseDTO | None:
        return self.favoritos_repo.find_by_id(favoritos_id)

    def list_all_favoritos(self) -> list[FavoritosResponseDTO]:
        return self.favoritos_repo.list_all()

    def delete_favoritos(self, favoritos_id: int) -> bool:
        return self.favoritos_repo.delete(favoritos_id)
    
    def update_favoritos(self, favoritos_id: int, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO | None:
        return self.favoritos_repo.update(favoritos_id, favoritos_dto)