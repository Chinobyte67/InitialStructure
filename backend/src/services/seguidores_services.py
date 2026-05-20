from sqlalchemy.orm import Session

from ..dtos.seguidores_dto import CreateSeguidoresDTO, SeguidoresResponseDTO
from ..repositories.seguidores_repository import SeguidoresRepository

class SeguidoresController:
    def __init__(self, db: Session):
        self.seguidores_repository = SeguidoresRepository(db)

    def create_seguidor(self, seguidores_dto: CreateSeguidoresDTO) -> SeguidoresResponseDTO:
        return self.seguidores_repository.create(
            usuario_id=seguidores_dto.usuario_id,
            artista_id=seguidores_dto.artista_id,
        )

    def get_seguidor_by_id(self, seguidor_id: int) -> SeguidoresResponseDTO | None:
        return self.seguidores_repository.find_by_id(seguidor_id)

    def list_all_seguidores(self) -> list[SeguidoresResponseDTO]:
        return self.seguidores_repository.list_all()
    