# TODO: armar el APIRouter de productos siguiendo el patrón de user_router.py
#
# from fastapi import APIRouter, Depends
# router = APIRouter(prefix="/products", tags=["products"])
# ...

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO, CancionEstadisticasDTO
from src.schemas.cancion_schema import CreateCancionSchema
from src.services.cancion_service import CancionService

router = APIRouter(prefix="/canciones", tags=["canciones"])


@router.post("/", response_model=CancionResponseDTO, status_code=status.HTTP_201_CREATED)
def create_cancion(payload: CreateCancionSchema, db: Session = Depends(get_db)):
    dto = CreateCancionDTO(**payload.model_dump())
    return CancionService(db).create_cancion(dto)


def get_cancion(cancion_id: int, db: Session = Depends(get_db)):
    return CancionService(db).get_cancion_by_id(cancion_id)


def list_canciones(db: Session = Depends(get_db), album_id: int | None = None):
    return CancionService(db).list_canciones(album_id)


def update_cancion(cancion_id: int, payload: CreateCancionSchema, db: Session = Depends(get_db)):
    dto = CreateCancionDTO(**payload.model_dump())
    return CancionService(db).update_cancion(cancion_id, dto)


def delete_cancion(cancion_id: int, db: Session = Depends(get_db)):
    CancionService(db).delete_cancion(cancion_id)


@router.get("/", response_model=list[CancionResponseDTO])
def list_canciones_endpoint(db: Session = Depends(get_db), album_id: int | None = None):
    """Retorna todas las canciones o filtra por album_id si se provee."""
    return list_canciones(db, album_id)


@router.get("/all", response_model=list[CancionResponseDTO])
def list_all_canciones_endpoint(db: Session = Depends(get_db)):
    """Retorna todas las canciones sin filtrar."""
    return CancionService(db).list_canciones()


@router.get("/{cancion_id}/estadisticas", response_model=CancionEstadisticasDTO)
def get_estadisticas_cancion_endpoint(cancion_id: int, anio_inicio: int | None = None, anio_fin: int | None = None, db: Session = Depends(get_db)):
    """Retorna estadísticas de una canción, con filtro opcional por año."""
    return CancionService(db).get_estadisticas_cancion(cancion_id, anio_inicio, anio_fin)


@router.get("/{cancion_id}", response_model=CancionResponseDTO)
def get_cancion_endpoint(cancion_id: int, db: Session = Depends(get_db)):
    cancion = get_cancion(cancion_id, db)
    if not cancion:
        return {"error": "Canción no encontrada"}
    return cancion


@router.put("/{cancion_id}", response_model=CancionResponseDTO)
def update_cancion_endpoint(cancion_id: int, payload: CreateCancionSchema, db: Session = Depends(get_db)):
    cancion = get_cancion(cancion_id, db)
    if not cancion:
        return {"error": "Canción no encontrada"}
    return update_cancion(cancion_id, payload, db)


@router.delete("/{cancion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cancion_endpoint(cancion_id: int, db: Session = Depends(get_db)):
    cancion = get_cancion(cancion_id, db)
    if not cancion:
        return {"error": "Canción no encontrada"}
    delete_cancion(cancion_id, db)
