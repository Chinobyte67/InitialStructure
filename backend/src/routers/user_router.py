from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.artista_dto import ArtistaResponseDTO
from src.dtos.user_dto import CreateUserDTO, UserResponseDTO, UsuarioResumenAnualDTO
from src.schemas.user_schema import CreateUserSchema, UpdateUserSchema
from src.services.seguidores_services import SeguidoresController
from src.services.user_service import UserService
from src.services.favoritos_service import FavoritosService
from src.dtos.cancion_dto import CancionResponseDTO

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


@router.get("/{user_id}/favoritos", response_model=list[CancionResponseDTO])
def list_favoritos_usuario(user_id: int, db: Session = Depends(get_db)):
    canciones = FavoritosService(db).list_favoritos_por_usuario(user_id)
    if not canciones:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene favoritos")
    return canciones


@router.get("/{user_id}/top-canciones", response_model=list[CancionResponseDTO])
def get_top_canciones_usuario(user_id: int, db: Session = Depends(get_db)):
    """Retorna las 10 canciones más escuchadas por el usuario (solo con reproducciones válidas)."""
    canciones = UserService(db).get_top_canciones_por_usuario(user_id)
    if not canciones:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene canciones escuchadas")
    return canciones


@router.get("/{user_id}/top-artistas", response_model=list[ArtistaResponseDTO])
def get_top_artistas_usuario(user_id: int, db: Session = Depends(get_db)):
    """Retorna los 10 artistas más escuchados por el usuario (solo con reproducciones válidas)."""
    artistas = UserService(db).get_top_artistas_por_usuario(user_id)
    if not artistas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no tiene artistas escuchados")
    return artistas


@router.get("/{user_id}/resumen", response_model=UsuarioResumenAnualDTO)
def get_resumen_anual_usuario(user_id: int, anio: int, db: Session = Depends(get_db)):
    """Retorna el resumen anual del usuario para un año específico."""
    resumen = UserService(db).get_resumen_anual(user_id, anio)
    return resumen


@router.get("/{user_id}/recomendaciones", response_model=list[CancionResponseDTO])
def get_recomendaciones_usuario(user_id: int, db: Session = Depends(get_db)):
    """
    Retorna recomendaciones de canciones basadas en géneros más escuchados.
    - Si el usuario tiene < 5 reproducciones válidas, devuelve canciones del top global.
    - Si el usuario tiene >= 5 reproducciones válidas, devuelve canciones de sus géneros más escuchados.
    - Excluye canciones que el usuario ha escuchado en los últimos 30 días.
    """
    recomendaciones = UserService(db).get_recomendaciones(user_id)
    if not recomendaciones:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay recomendaciones disponibles para este usuario")
    return recomendaciones


@router.delete("/{user_id}/favoritos/{cancion_id}", status_code=204)
def delete_favorito_usuario(user_id: int, cancion_id: int, db: Session = Depends(get_db)):
    success = FavoritosService(db).delete_favorito_por_usuario_cancion(user_id, cancion_id)
    if not success:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")


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