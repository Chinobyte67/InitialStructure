from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.reproduccion_dto import ReproduccionResponseDTO
from src.services.reproduccion_service import ReproduccionController
from src.schemas.reproduccion_schema import CreateReproduccionSchema

router = APIRouter(prefix="/reproducciones", tags=["reproducciones"])

@router.get("/{reproduccion_id}", response_model=ReproduccionResponseDTO)
def get_reproduccion(reproduccion_id: int, db: Session = Depends(get_db)):
    return ReproduccionController().get_reproduccion_by_id(reproduccion_id)

@router.get("/", response_model=list[ReproduccionResponseDTO])
def list_reproducciones(db: Session = Depends(get_db)):
    return ReproduccionController().list_all_reproducciones()

