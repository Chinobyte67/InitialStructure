from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.seguidores_dto import SeguidoresResponseDTO
from src.services.seguidores_services import SeguidoresController
from src.schemas.seguidores_schema import CreateSeguidoresSchema

router = APIRouter(prefix="/seguidores", tags=["seguidores"])

@router.get("/{seguidor_id}", response_model=SeguidoresResponseDTO)
def get_seguidor(seguidor_id: int, db: Session = Depends(get_db)):
    return SeguidoresController().get_seguidor_by_id(seguidor_id)

@router.get("/", response_model=list[SeguidoresResponseDTO])
def list_seguidores(db: Session = Depends(get_db)):
    return SeguidoresController().list_all_seguidores()

@router.post("/", response_model=SeguidoresResponseDTO)
def create_seguidor(seguidor: CreateSeguidoresSchema, db: Session = Depends(get_db)):
    return SeguidoresController().create_seguidor(seguidor)

