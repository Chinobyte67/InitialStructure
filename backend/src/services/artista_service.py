from sqlalchemy.orm import Session

from ..dtos.artista_dto import CreateArtistaDTO, UpdateArtistaDTO, ArtistaResponseDTO
from ..repositories.artista_repository import ArtistaRepository

class ArtistaService:
    def __init__(self, db: Session):
        self.artista_repository = ArtistaRepository(db)

    def create_artista(self, create_artista_dto: CreateArtistaDTO):
        return self.artista_repository.create(create_artista_dto)

    def get_artista_by_id(self, artista_id: int):
        return self.artista_repository.find_by_id(artista_id)

    def update_artista(self, artista_id: int, update_artista_dto: UpdateArtistaDTO):
        return self.artista_repository.update(artista_id, update_artista_dto)

    def delete_artista(self, artista_id: int):
        return self.artista_repository.delete(artista_id)
    
    def list_artistas(self):
        return self.artista_repository.list_all()    