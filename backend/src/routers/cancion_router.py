# TODO: armar el APIRouter de productos siguiendo el patrón de user_router.py
#
# from fastapi import APIRouter, Depends
# router = APIRouter(prefix="/products", tags=["products"])
# ...

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from src.schemas.cancion_schema import CreateCancionSchema
from src.services.cancion_service import CancionService

router = APIRouter(prefix="/canciones", tags=["canciones"])


@router.post("/", response_model=CancionResponseDTO, status_code=status.HTTP_201_CREATED)
def create_cancion(payload: CreateCancionSchema, db: Session = Depends(get_db)):
    dto = CreateCancionDTO(**payload.model_dump())
    return CancionService(db).create(dto)