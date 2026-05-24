from sqlalchemy.orm import Session
from sqlalchemy import func

from src.dtos.user_dto import CreateUserDTO, UserResponseDTO
from src.mappers.user_mapper import to_user_response
from src.mappers.cancion_mapper import to_cancion_response
from src.mappers.artista_mapper import to_artista_response
from src.repositories.user_repository import UserRepository
from src.db.models.reproduccion_model import Reproduccion
from src.db.models.cancion_model import Cancion
from src.db.models.album_model import Album
from src.db.models.artista_model import Artista
from src.utils.errors import NotFoundError, ConflictError
from src.utils.hash import hash_password


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def create(self, dto: CreateUserDTO) -> UserResponseDTO:
        # Verificar si ya existe un usuario con ese email
        existing_user = self.repo.find_by_email(dto.email)
        if existing_user:
            raise ConflictError("Email already registered")

        # Hashear la contraseña
        password_hash = hash_password(dto.password)

        # Crear el usuario
        user = self.repo.create(
            email=dto.email,
            password_hash=password_hash,
            nombre=getattr(dto, 'nombre', None),
        )
        return to_user_response(user)


    def get_by_id(self, user_id: int) -> UserResponseDTO:
        user = self.repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def list_all(self) -> list[UserResponseDTO]:
        users = self.repo.list_all()
        return [to_user_response(user) for user in users]

    def update(self, user_id: int, dto) -> UserResponseDTO:
        # Filtrar campos None (solo actualizar los que fueron enviados)
        update_data = {k: v for k, v in dto.model_dump().items() if v is not None}
        
        # Si se incluye password, hashearla
        if "password" in update_data:
            update_data["password_hash"] = hash_password(update_data.pop("password"))
        
        user = self.repo.update(user_id, **update_data)
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def delete(self, user_id: int) -> None:
        if not self.repo.delete(user_id):
            raise NotFoundError("User not found")

    def get_top_canciones_por_usuario(self, usuario_id: int, limit: int = 10) -> list:
        """
        Retorna las canciones más escuchadas por el usuario.
        Solo cuenta reproducciones válidas (cuenta_para_estadisticas = true).
        """
        # Verificar que el usuario existe
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Query: agrupar por cancion_id, contar, ordenar descendente
        resultado = (
            self.db.query(
                Cancion,
                func.count(Reproduccion.id).label("cantidad")
            )
            .join(Reproduccion, Cancion.id == Reproduccion.cancion_id)
            .filter(
                Reproduccion.usuario_id == usuario_id,
                Reproduccion.cuenta_para_estadisticas == True
            )
            .group_by(Cancion.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convertir a DTOs
        return [to_cancion_response(cancion) for cancion, cantidad in resultado]

    def get_top_artistas_por_usuario(self, usuario_id: int, limit: int = 10) -> list:
        """
        Retorna los artistas más escuchados por el usuario.
        Solo cuenta reproducciones válidas (cuenta_para_estadisticas = true).
        """
        # Verificar que el usuario existe
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Query: artista -> album -> cancion -> reproduccion, agrupar, contar
        resultado = (
            self.db.query(
                Artista,
                func.count(Reproduccion.id).label("cantidad")
            )
            .join(Album, Album.artista_id == Artista.id)
            .join(Cancion, Cancion.album_id == Album.id)
            .join(Reproduccion, Reproduccion.cancion_id == Cancion.id)
            .filter(
                Reproduccion.usuario_id == usuario_id,
                Reproduccion.cuenta_para_estadisticas == True
            )
            .group_by(Artista.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convertir a DTOs
        return [to_artista_response(artista) for artista, cantidad in resultado]