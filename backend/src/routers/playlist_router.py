from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO
from src.schemas.playlist_schema import CreatePlaylistSchema, UpdatePlaylistSchema
from src.services.playlist_service import PlaylistController

router = APIRouter(prefix="/playlists", tags=["playlists"])

@router.post("/", response_model=PlaylistResponseDTO)
def create_playlist(payload: CreatePlaylistSchema, db: Session = Depends(get_db)):
    dto = CreatePlaylistDTO(**payload.model_dump())
    return PlaylistController().create_playlist(dto)

@router.get("/{playlist_id}", response_model=PlaylistResponseDTO)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    return PlaylistController().get_playlist_by_id(playlist_id)

@router.get("/", response_model=list[PlaylistResponseDTO])
def list_playlists(db: Session = Depends(get_db)):
    return PlaylistController().list_all_playlists()

@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    return PlaylistController().delete_playlist(playlist_id)

@router.put("/{playlist_id}", response_model=PlaylistResponseDTO)
def update_playlist(playlist_id: int, payload: CreatePlaylistSchema, db: Session = Depends(get_db)):
    dto = CreatePlaylistDTO(**payload.model_dump())
    return PlaylistController().update_playlist(playlist_id, dto)

@router.patch("/{playlist_id}", response_model=PlaylistResponseDTO)
def partial_update_playlist(playlist_id: int, payload: UpdatePlaylistSchema | None = None, db: Session = Depends(get_db)):
    dto = CreatePlaylistDTO(**payload.model_dump()) if payload else None
    return PlaylistController().update_playlist(playlist_id, dto)

