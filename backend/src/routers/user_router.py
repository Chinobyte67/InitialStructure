from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.artista_dto import ArtistaResponseDTO
from src.dtos.user_dto import CreateUserDTO, UserResponseDTO
from src.schemas.user_schema import CreateUserSchema, UpdateUserSchema
from src.services.seguidores_services import SeguidoresController
from src.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserSchema, db: Session = Depends(get_db)):
    """Ejemplo completo: valida con Schema, arma DTO, llama al service."""
    dto = CreateUserDTO(**payload.model_dump())
    return UserService(db).create(dto)


@router.get("/{user_id}", response_model=UserResponseDTO)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return UserService(db).get_by_id(user_id)


@router.get("/", response_model=list[UserResponseDTO])
def list_users(db: Session = Depends(get_db)):
    return UserService(db).list_all()


@router.get("/{user_id}/seguidos", response_model=list[ArtistaResponseDTO])
def list_seguidos(user_id: int, db: Session = Depends(get_db)):
    return SeguidoresController(db).list_artistas_seguidos_por_usuario(user_id)


@router.put("/{user_id}", response_model=UserResponseDTO)
def update_user(user_id: int, payload: UpdateUserSchema, db: Session = Depends(get_db)):
    return UserService(db).update(user_id, payload)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    UserService(db).delete(user_id)

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_users(db: Session = Depends(get_db)):
    """Endpoint para crear usuarios de prueba."""
    service = UserService(db)
    users_to_create = [
        CreateUserDTO(email="user1@example.com", password="password1", nombre="Usuario Uno", plan="premium"),
        CreateUserDTO(email="user2@example.com", password="password2", nombre="Usuario Dos", plan="free"),
    ]
    for dto in users_to_create:
        service.create(dto)