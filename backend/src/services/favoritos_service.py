from sqlalchemy.orm import Session

from ..dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from ..repositories.favoritos_repository import FavoritosRepository
from ..mappers.cancion_mapper import to_cancion_response
from ..dtos.cancion_dto import CancionResponseDTO

class FavoritosService:
    def __init__(self, db: Session):
        self.favoritos_repo = FavoritosRepository(db)

    def create_favoritos(self, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO:
        return self.favoritos_repo.create(favoritos_dto)

    def get_favoritos_by_id(self, favoritos_id: int) -> FavoritosResponseDTO | None:
        return self.favoritos_repo.find_by_id(favoritos_id)

    def list_all_favoritos(self) -> list[FavoritosResponseDTO]:
        return self.favoritos_repo.list_all()

    def list_favoritos_por_usuario(self, usuario_id: int) -> list[CancionResponseDTO]:
        canciones = self.favoritos_repo.list_canciones_by_usuario(usuario_id)
        return [to_cancion_response(c) for c in canciones]

    def delete_favoritos(self, favoritos_id: int) -> bool:
        return self.favoritos_repo.delete(favoritos_id)

    def delete_favorito_por_usuario_cancion(self, usuario_id: int, cancion_id: int) -> bool:
        return self.favoritos_repo.delete_by_usuario_and_cancion(usuario_id, cancion_id)
    
    def update_favoritos(self, favoritos_id: int, favoritos_dto: CreateFavoritosDTO) -> FavoritosResponseDTO | None:
        return self.favoritos_repo.update(favoritos_id, favoritos_dto)