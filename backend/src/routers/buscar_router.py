from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.buscar_dto import BuscarResponseDTO
from src.services.buscar_service import BuscarService

router = APIRouter(prefix="/buscar", tags=["buscar"])


@router.get("/", response_model=BuscarResponseDTO)
def buscar(busqueda: str, db: Session = Depends(get_db)):
    if not busqueda or len(busqueda.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El parámetro 'busqueda' no puede estar vacío"
        )
    return BuscarService(db).buscar(busqueda.strip())
