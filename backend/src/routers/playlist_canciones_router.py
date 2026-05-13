from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO, PlaylistCancionesResponseDTO
from src.schemas.playlist_canciones_schema import CreatePlaylistCancionesSchema
from src.services.playlist_canciones_service import PlaylistCancionesService

router = APIRouter(prefix="/playlist-canciones", tags=["playlist-canciones"])

@router.post("/", response_model=PlaylistCancionesResponseDTO)
def create_playlist_canciones(payload: CreatePlaylistCancionesSchema, db: Session = Depends(get_db)):
    dto = CreatePlaylistCancionesDTO(**payload.model_dump())
    return PlaylistCancionesService().create_playlist_canciones(dto)

@router.get("/{playlist_canciones_id}", response_model=PlaylistCancionesResponseDTO)
def get_playlist_canciones(playlist_canciones_id: int, db: Session = Depends(get_db)):
    return PlaylistCancionesService().get_playlist_canciones_by_id(playlist_canciones_id)

@router.get("/", response_model=list[PlaylistCancionesResponseDTO])
def list_playlist_canciones(db: Session = Depends(get_db)):
    return PlaylistCancionesService().list_all_playlist_canciones()

@router.delete("/{playlist_canciones_id}")
def delete_playlist_canciones(playlist_canciones_id: int, db: Session = Depends(get_db)):
    return PlaylistCancionesService().delete_playlist_canciones(playlist_canciones_id)

@router.put("/{playlist_canciones_id}", response_model=PlaylistCancionesResponseDTO)
def update_playlist_canciones(playlist_canciones_id: int, payload: CreatePlaylistCancionesSchema, db: Session = Depends(get_db)):
    dto = CreatePlaylistCancionesDTO(**payload.model_dump())
    return PlaylistCancionesService().update_playlist_canciones(playlist_canciones_id, dto)

@router.patch("/{playlist_canciones_id}", response_model=PlaylistCancionesResponseDTO)
def partial_update_playlist_canciones(playlist_canciones_id: int, payload: CreatePlaylistCancionesSchema | None = None, db: Session = Depends(get_db)):
    dto = CreatePlaylistCancionesDTO(**payload.model_dump()) if payload else None
    return PlaylistCancionesService().update_playlist_canciones(playlist_canciones_id, dto)
