from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.buscar_dto import BuscarResponseDTO
from src.services.buscar_service import BuscarService

router = APIRouter(prefix="/buscar", tags=["buscar"])


@router.get("/", response_model=BuscarResponseDTO)
def buscar(q: str, db: Session = Depends(get_db)):
    if not q or len(q.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El parámetro 'q' no puede estar vacío"
        )
    return BuscarService(db).buscar(q.strip())
