from ..dtos.seguidores_dto import SeguidoresResponseDTO
from ..repositories.seguidores_repository import SeguidoresRepository

class SeguidoresController:
    def __init__(self):
        self.seguidores_repository = SeguidoresRepository()

    def get_seguidor_by_id(self, seguidor_id: int) -> SeguidoresResponseDTO:
        return self.seguidores_repository.get_seguidor_by_id(seguidor_id)

    def list_all_seguidores(self) -> list[SeguidoresResponseDTO]:
        return self.seguidores_repository.list_all_seguidores()
    