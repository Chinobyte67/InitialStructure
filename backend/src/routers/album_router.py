from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.album_dto import CreateAlbumDTO, UpdateAlbumDTO, AlbumResponseDTO
from src.dtos.cancion_dto import CancionResponseDTO
from src.schemas.album_schema import CreateAlbumSchema, UpdateAlbumSchema
from src.services.album_service import AlbumService
from src.services.cancion_service import CancionService
from src.middlewares.auth_middleware import get_current_user
from src.utils.errors import ForbiddenError

router = APIRouter(prefix="/albumes", tags=["albumes"])

def require_admin(user = Depends(get_current_user)):
    """Dependency que valida que el usuario sea admin."""
    if not user.is_admin:
        raise ForbiddenError("Solo admins pueden crear álbumes")
    return user

@router.post("/", response_model=AlbumResponseDTO)
def create_album(payload: CreateAlbumSchema, db: Session = Depends(get_db), _admin = Depends(require_admin)):
    dto = CreateAlbumDTO(**payload.model_dump())
    return AlbumService(db).create_album(dto)

@router.get("/{album_id}", response_model=AlbumResponseDTO)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = AlbumService(db).get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    return album

@router.put("/{album_id}", response_model=AlbumResponseDTO)
def update_album(album_id: int, payload: UpdateAlbumSchema, db: Session = Depends(get_db)):
    dto = UpdateAlbumDTO(**payload.model_dump())
    updated_album = AlbumService(db).update_album(album_id, dto)
    if not updated_album:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    return updated_album

@router.delete("/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_album(album_id: int, db: Session = Depends(get_db)):
    success = AlbumService(db).delete_album(album_id)
    if not success:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    

@router.get("/{album_id}/canciones", response_model=list[CancionResponseDTO])
def list_album_canciones(album_id: int, db: Session = Depends(get_db)):
    return CancionService(db).list_canciones(album_id)


@router.get("/", response_model=list[AlbumResponseDTO])
def list_albums(db: Session = Depends(get_db), artista_id: int | None = None):
    return AlbumService(db).list_albums(artista_id)
