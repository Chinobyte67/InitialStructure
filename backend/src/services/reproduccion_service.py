from sqlalchemy.orm import Session

from ..dtos.reproduccion_dto import ReproduccionResponseDTO
from ..repositories.reproduccion_repository import ReproduccionRepository
from ..repositories.cancion_repository import CancionRepository
from fastapi import HTTPException, status
from ..utils.errors import NotFoundError

from ..dtos.reproduccion_dto import CreateReproduccionDTO

class ReproduccionController:
    def __init__(self, db: Session):
        self.reproduccion_repository = ReproduccionRepository(db)
        self.cancion_repository = CancionRepository(db)

    def get_reproduccion_by_id(self, reproduccion_id: int) -> ReproduccionResponseDTO | None:
        return self.reproduccion_repository.find_by_id(reproduccion_id)

    def list_all_reproducciones(self) -> list[ReproduccionResponseDTO]:
        return self.reproduccion_repository.list_all()

    def create_reproduccion(self, reproduccion_dto: CreateReproduccionDTO) -> ReproduccionResponseDTO:
        # Validate cancion exists and get duration
        cancion = self.cancion_repository.find_by_id(reproduccion_dto.cancion_id)
        if not cancion:
            raise NotFoundError("Cancion no encontrada")

        duracion = cancion.duracion_seg
        if reproduccion_dto.segundos_escuchados > duracion:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="segundos_escuchados no puede superar la duracion de la cancion")

        # Determine whether it counts for stats (>= 30% of duration)
        cuenta_flag = reproduccion_dto.segundos_escuchados >= (0.3 * duracion)

        return self.reproduccion_repository.create(
            usuario_id=reproduccion_dto.usuario_id,
            cancion_id=reproduccion_dto.cancion_id,
            segundos_escuchados=reproduccion_dto.segundos_escuchados,
            cuenta_para_estadisticas=cuenta_flag,
        )