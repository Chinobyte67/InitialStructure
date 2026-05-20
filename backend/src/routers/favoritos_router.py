from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.favoritos_dto import CreateFavoritosDTO, FavoritosResponseDTO
from src.schemas.favoritos_schema import CreateFavoritosSchema
from src.services.favoritos_service import FavoritosService

router = APIRouter(prefix="/favoritos", tags=["favoritos"])

@router.post("/", response_model=FavoritosResponseDTO)
def create_favoritos(payload: CreateFavoritosSchema, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump())
    return FavoritosService(db).create_favoritos(dto)

@router.get("/{favoritos_id}", response_model=FavoritosResponseDTO)
def get_favoritos(favoritos_id: int, db: Session = Depends(get_db)):
    favoritos = FavoritosService(db).get_favoritos_by_id(favoritos_id)
    if not favoritos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")
    return favoritos

@router.get("/", response_model=list[FavoritosResponseDTO])
def list_favoritos(db: Session = Depends(get_db)):
    return FavoritosService(db).list_all_favoritos()

@router.delete("/{favoritos_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favoritos(favoritos_id: int, db: Session = Depends(get_db)):
    success = FavoritosService(db).delete_favoritos(favoritos_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")

@router.put("/{favoritos_id}", response_model=FavoritosResponseDTO)
def update_favoritos(favoritos_id: int, payload: CreateFavoritosSchema, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump())
    updated_favoritos = FavoritosService(db).update_favoritos(favoritos_id, dto)
    if not updated_favoritos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")
    return updated_favoritos

@router.patch("/{favoritos_id}", response_model=FavoritosResponseDTO)
def partial_update_favoritos(favoritos_id: int, payload: CreateFavoritosSchema | None = None, db: Session = Depends(get_db)):
    dto = CreateFavoritosDTO(**payload.model_dump()) if payload else None
    updated_favoritos = FavoritosService(db).update_favoritos(favoritos_id, dto)
    if not updated_favoritos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorito no encontrado")
    return updated_favoritos  
