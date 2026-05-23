from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.reproduccion_dto import ReproduccionResponseDTO
from src.services.reproduccion_service import ReproduccionController
from src.schemas.reproduccion_schema import CreateReproduccionSchema
from src.dtos.reproduccion_dto import CreateReproduccionDTO
from fastapi import HTTPException, status

router = APIRouter(prefix="/reproducciones", tags=["reproducciones"])

@router.get("/{reproduccion_id}", response_model=ReproduccionResponseDTO)
def get_reproduccion(reproduccion_id: int, db: Session = Depends(get_db)):
    return ReproduccionController(db).get_reproduccion_by_id(reproduccion_id)

@router.get("/", response_model=list[ReproduccionResponseDTO])
def list_reproducciones(db: Session = Depends(get_db)):
    return ReproduccionController(db).list_all_reproducciones()


@router.post("/", response_model=ReproduccionResponseDTO)
def create_reproduccion(payload: CreateReproduccionSchema, db: Session = Depends(get_db)):
    dto = CreateReproduccionDTO(**payload.model_dump())
    try:
        return ReproduccionController(db).create_reproduccion(dto)
    except HTTPException:
        raise
    except Exception as e:
        # Let AppError middleware handle known AppError subclasses
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

