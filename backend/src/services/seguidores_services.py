from sqlalchemy.orm import Session

from ..dtos.artista_dto import ArtistaResponseDTO
from ..dtos.seguidores_dto import CreateSeguidoresDTO, SeguidoresResponseDTO, UsuariosSeguidoresResponseDTO
from ..dtos.user_dto import UserResponseDTO
from ..mappers.artista_mapper import to_artista_response
from ..mappers.user_mapper import to_user_response
from ..repositories.artista_repository import ArtistaRepository
from ..repositories.seguidores_repository import SeguidoresRepository
from ..repositories.user_repository import UserRepository

class SeguidoresController:
    def __init__(self, db: Session):
        self.seguidores_repository = SeguidoresRepository(db)
        self.artista_repository = ArtistaRepository(db)
        self.user_repository = UserRepository(db)

    def create_seguidor(self, seguidores_dto: CreateSeguidoresDTO) -> SeguidoresResponseDTO:
        return self.seguidores_repository.create(
            usuario_id=seguidores_dto.usuario_id,
            artista_id=seguidores_dto.artista_id,
        )

    def get_seguidor_by_id(self, seguidor_id: int) -> SeguidoresResponseDTO | None:
        return self.seguidores_repository.find_by_id(seguidor_id)

    def list_all_seguidores(self) -> list[SeguidoresResponseDTO]:
        return self.seguidores_repository.list_all()

    def list_artistas_seguidos_por_usuario(self, usuario_id: int) -> list[ArtistaResponseDTO]:
        artistas = self.seguidores_repository.list_artistas_by_usuario(usuario_id)
        return [to_artista_response(artista) for artista in artistas]

    def list_usuarios_seguidores_por_artista(self, artista_id: int) -> UsuariosSeguidoresResponseDTO:
        usuarios = self.seguidores_repository.list_usuarios_by_artista(artista_id)
        return UsuariosSeguidoresResponseDTO(
            count=len(usuarios),
            usuarios=[to_user_response(usuario) for usuario in usuarios],
        )
    