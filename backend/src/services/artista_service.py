from ..dtos.artista_dto import CreateArtistaDTO, UpdateArtistaDTO
from ..repositories.artista_repository import ArtistaRepository

class ArtistaService:
    def __init__(self, artista_repository: ArtistaRepository):
        self.artista_repository = artista_repository

    def create_artista(self, create_artista_dto: CreateArtistaDTO):
        return self.artista_repository.create(create_artista_dto)

    def get_artista_by_id(self, artista_id: int):
        return self.artista_repository.get_by_id(artista_id)

    def update_artista(self, update_artista_dto: UpdateArtistaDTO):
        return self.artista_repository.update(update_artista_dto)

    def delete_artista(self, artista_id: int):
        return self.artista_repository.delete(artista_id)
    
    def list_all_artistas(self):
        return self.artista_repository.list_all()
    