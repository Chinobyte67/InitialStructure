from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.playlist_canciones_dto import PlaylistCancionesResponseDTO
from src.dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO, PlaylistResumenDTO
from src.schemas.playlist_schema import CreatePlaylistSchema, UpdatePlaylistSchema
from src.schemas.playlist_colaborador_schema import AddPlaylistColaboradorSchema
from src.services.playlist_canciones_service import PlaylistCancionesService
from src.services.playlist_colaboradores_service import PlaylistColaboradoresService
from src.services.playlist_service import PlaylistController
from src.utils.errors import ForbiddenError

router = APIRouter(prefix="/playlists", tags=["playlists"])

@router.post("/", response_model=PlaylistResponseDTO)
def create_playlist(payload: CreatePlaylistSchema, db: Session = Depends(get_db)):
    dto = CreatePlaylistDTO(**payload.model_dump())
    return PlaylistController(db).create_playlist(dto)

@router.get("/{playlist_id}", response_model=PlaylistResponseDTO)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    return PlaylistController(db).get_playlist_by_id(playlist_id)

@router.get("/{playlist_id}/resumen", response_model=PlaylistResumenDTO)
def get_resumen_playlist(playlist_id: int, db: Session = Depends(get_db)):
    """Retorna el resumen de la playlist con cantidad de canciones y duración total (hh:mm:ss)."""
    return PlaylistController(db).get_resumen_playlist(playlist_id)

@router.get("/", response_model=list[PlaylistResponseDTO])
def list_playlists(db: Session = Depends(get_db)):
    return PlaylistController(db).list_all_playlists()

@router.get("/{playlist_id}/canciones", response_model=list[PlaylistCancionesResponseDTO])
def list_playlist_canciones(playlist_id: int, db: Session = Depends(get_db)):
    return PlaylistCancionesService(db).list_playlist_canciones_by_playlist_id(playlist_id)

@router.post("/{playlist_id}/colaboradores", response_model=PlaylistResponseDTO)
def add_playlist_colaborador(
    playlist_id: int,
    payload: AddPlaylistColaboradorSchema,
    db: Session = Depends(get_db),
):
    return PlaylistColaboradoresService(db).add_collaborator(
        playlist_id,
        payload.usuario_id,
        payload.usuario_dueno_id,
    )

@router.delete("/{playlist_id}/colaboradores/{usuario_id}", response_model=PlaylistResponseDTO)
def remove_playlist_colaborador(
    playlist_id: int,
    usuario_id: int,
    usuario_dueno_id: int,
    db: Session = Depends(get_db),
):
    return PlaylistColaboradoresService(db).remove_collaborator(
        playlist_id,
        usuario_id,
        usuario_dueno_id,
    )

@router.delete("/{playlist_id}/usuario/{usuario_id}")
def delete_playlist(
    playlist_id: int,
    usuario_id: int,
    db: Session = Depends(get_db),
):
    return PlaylistController(db).delete_playlist(playlist_id, usuario_id)

@router.put("/{playlist_id}", response_model=PlaylistResponseDTO)
def update_playlist(
    playlist_id: int,
    payload: UpdatePlaylistSchema,
    usuario_dueno_id: int,
    db: Session = Depends(get_db),
):
    dto = UpdatePlaylistDTO(**payload.model_dump())
    playlist = PlaylistController(db).get_playlist_by_id(playlist_id)
    if playlist.usuario_id != usuario_dueno_id:
        raise ForbiddenError("Solo el dueño puede renombrar o actualizar la playlist")
    return PlaylistController(db).update_playlist(playlist_id, dto)

@router.patch("/{playlist_id}", response_model=PlaylistResponseDTO)
def partial_update_playlist(
    playlist_id: int,
    payload: UpdatePlaylistSchema | None = None,
    usuario_dueno_id: int | None = None,
    db: Session = Depends(get_db),
):
    if payload is None:
        return PlaylistController(db).get_playlist_by_id(playlist_id)

    dto = UpdatePlaylistDTO(**payload.model_dump())
    playlist = PlaylistController(db).get_playlist_by_id(playlist_id)
    if usuario_dueno_id is not None and playlist.usuario_id != usuario_dueno_id:
        raise ForbiddenError("Solo el dueño puede renombrar o actualizar la playlist")
    return PlaylistController(db).update_playlist(playlist_id, dto)

