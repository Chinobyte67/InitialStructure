from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.playlist_canciones_dto import CreatePlaylistCancionesDTO, UpdatePlaylistCancionesDTO, PlaylistCancionesResponseDTO
from src.schemas.playlist_canciones_schema import CreatePlaylistCancionesSchema, UpdatePlaylistCancionesSchema
from src.services.playlist_canciones_service import PlaylistCancionesService

router = APIRouter(prefix="/playlist-canciones", tags=["playlist-canciones"])

@router.post("/", response_model=PlaylistCancionesResponseDTO)
def create_playlist_canciones(
    payload: CreatePlaylistCancionesSchema,
    usuario_id: int,
    db: Session = Depends(get_db),
):
    dto = CreatePlaylistCancionesDTO(**payload.model_dump())
    return PlaylistCancionesService(db).create_playlist_canciones(dto, usuario_id)

@router.get("/", response_model=list[PlaylistCancionesResponseDTO])
def list_all_playlist_canciones(db: Session = Depends(get_db)):
    return PlaylistCancionesService(db).list_all_playlist_canciones()

@router.get("/playlist/{playlist_id}", response_model=list[PlaylistCancionesResponseDTO])
def get_playlist_canciones_by_playlist(playlist_id: int, db: Session = Depends(get_db)):
    return PlaylistCancionesService(db).list_playlist_canciones_by_playlist_id(playlist_id)

@router.delete("/{playlist_canciones_id}")
def delete_playlist_canciones(
    playlist_canciones_id: int,
    usuario_id: int,
    db: Session = Depends(get_db),
):
    return PlaylistCancionesService(db).delete_playlist_canciones(playlist_canciones_id, usuario_id)

@router.put("/{playlist_canciones_id}", response_model=PlaylistCancionesResponseDTO)
def update_playlist_canciones(
    playlist_canciones_id: int,
    payload: UpdatePlaylistCancionesSchema,
    usuario_id: int,
    db: Session = Depends(get_db),
):
    dto = UpdatePlaylistCancionesDTO(**payload.model_dump())
    return PlaylistCancionesService(db).update_playlist_canciones(playlist_canciones_id, dto, usuario_id)

@router.patch("/{playlist_canciones_id}", response_model=PlaylistCancionesResponseDTO)
def partial_update_playlist_canciones(
    playlist_canciones_id: int,
    payload: UpdatePlaylistCancionesSchema,
    usuario_id: int,
    db: Session = Depends(get_db),
):
    dto = UpdatePlaylistCancionesDTO(**payload.model_dump())
    return PlaylistCancionesService(db).update_playlist_canciones(playlist_canciones_id, dto, usuario_id)
