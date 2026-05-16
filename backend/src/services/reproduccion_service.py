from sqlalchemy.orm import Session

from ..dtos.reproduccion_dto import ReproduccionResponseDTO
from ..repositories.reproduccion_repository import ReproduccionRepository

class ReproduccionController:
    def __init__(self, db: Session):
        self.reproduccion_repository = ReproduccionRepository(db)

    def get_reproduccion_by_id(self, reproduccion_id: int) -> ReproduccionResponseDTO | None:
        return self.reproduccion_repository.find_by_id(reproduccion_id)

    def list_all_reproducciones(self) -> list[ReproduccionResponseDTO]:
        return self.reproduccion_repository.list_all()