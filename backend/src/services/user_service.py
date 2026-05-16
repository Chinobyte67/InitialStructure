from sqlalchemy.orm import Session

from src.dtos.user_dto import CreateUserDTO, UserResponseDTO
from src.mappers.user_mapper import to_user_response
from src.repositories.user_repository import UserRepository
from src.utils.errors import NotFoundError, ConflictError
from src.utils.hash import hash_password


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

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