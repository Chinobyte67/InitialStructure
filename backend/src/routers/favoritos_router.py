from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from src.schemas.favoritos_schema import CreateFavoritosSchema
from src.services.favoritos_service import FavoritosService

router = APIRouter(prefix="/favoritos", tags=["favoritos"])

@router.post("/", response_model=FavoritosResponseDTO)
def create_favoritos(payload: CreateFavoritosSchema, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump())
    return FavoritosService().create_favoritos(dto)

@router.get("/{favoritos_id}", response_model=FavoritosResponseDTO)
def get_favoritos(favoritos_id: int, db: Session = Depends(get_db)):
    return FavoritosService().get_favoritos_by_id(favoritos_id)

@router.get("/", response_model=list[FavoritosResponseDTO])
def list_favoritos(db: Session = Depends(get_db)):
    return FavoritosService().list_all_favoritos()

@router.delete("/{favoritos_id}")
def delete_favoritos(favoritos_id: int, db: Session = Depends(get_db)):
    return FavoritosService().delete_favoritos(favoritos_id)

@router.put("/{favoritos_id}", response_model=FavoritosResponseDTO)
def update_favoritos(favoritos_id: int, payload: CreateFavoritosSchema, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump())
    return FavoritosService().update_favoritos(favoritos_id, dto)

@router.patch("/{favoritos_id}", response_model=FavoritosResponseDTO)
def partial_update_favoritos(favoritos_id: int, payload: CreateFavoritosSchema | None = None, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump()) if payload else None
    return FavoritosService().update_favoritos(favoritos_id, dto)  
