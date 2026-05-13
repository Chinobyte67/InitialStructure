from sqlalchemy.orm import Session

from src.dtos.user_dto import CreateUserDTO, UserResponseDTO
from src.mappers.user_mapper import to_user_response
from src.repositories.user_repository import UserRepository
from src.utils.hash import hash_password
from src.errors.not_found_error import NotFoundError


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def create(self, dto: CreateUserDTO) -> UserResponseDTO:
        """Ejemplo completo: hashea la password, crea el user y devuelve el DTO de respuesta."""
        password_hash = hash_password(dto.password)
        user = self.repo.create(
            email=dto.email,
            password_hash=password_hash,
            age=dto.age,
        )
        return to_user_response(user)

    def get_by_id(self, user_id: int) -> UserResponseDTO:
        # TODO: buscar el user. Si no existe, lanzar NotFoundError. Devolver UserResponseDTO.
        user = self.repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def list_all(self) -> list[UserResponseDTO]:
        # TODO: devolver lista de UserResponseDTO
        users = self.repo.list_all()
        return [to_user_response(user) for user in users]

    def update(self, user_id: int, dto) -> UserResponseDTO:
        # TODO: validar existencia, aplicar cambios desde dto, devolver el DTO actualizado.
        user = self.repo.update(user_id, **dto.dict())
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def delete(self, user_id: int) -> None:
        if not self.repo.delete(user_id):
            raise NotFoundError("User not found")   
        
