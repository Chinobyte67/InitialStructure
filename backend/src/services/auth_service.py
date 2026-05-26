from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.dtos.auth_dto import LoginDTO, TokenDTO
from src.repositories.user_repository import UserRepository
from src.utils.hash import verify_password
from src.utils.jwt import create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def login(self, dto: LoginDTO) -> TokenDTO:
        user = self.repo.find_by_email(dto.email)
        print(f"Comparando contraseñas para usuario {dto.email}. Hash presente: {bool(user and user.password_hash)}")
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

        if not verify_password(dto.password, user.password_hash):
            print("Verificación de contraseña fallida")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return TokenDTO(access_token=token)
