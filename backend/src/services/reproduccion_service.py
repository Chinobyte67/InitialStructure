from ..dtos.reproduccion_dto import ReproduccionResponseDTO
from ..repositories.reproduccion_repository import ReproduccionRepository

class ReproduccionController:
    def __init__(self):
        self.reproduccion_repository = ReproduccionRepository()

    def get_reproduccion_by_id(self, reproduccion_id: int) -> ReproduccionResponseDTO:
        return self.reproduccion_repository.get_reproduccion_by_id(reproduccion_id)

    def list_all_reproducciones(self) -> list[ReproduccionResponseDTO]:
        return self.reproduccion_repository.list_all_reproducciones()