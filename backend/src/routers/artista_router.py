from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db 
from src.dtos.artista_dto import CreateArtistaDTO, UpdateArtistaDTO, ArtistaResponseDTO
from src.dtos.album_dto import AlbumResponseDTO
from src.dtos.seguidores_dto import UsuariosSeguidoresResponseDTO
from src.services.album_service import AlbumService
from src.services.artista_service import ArtistaService
from src.services.seguidores_services import SeguidoresController
from src.schemas.artista_schema import CreateArtistaSchema, UpdateArtistaSchema

router = APIRouter(prefix="/artistas", tags=["artistas"])

@router.post("/", response_model=ArtistaResponseDTO)
def create_artista(payload: CreateArtistaSchema, db: Session = Depends(get_db)):
    dto = CreateArtistaDTO(**payload.model_dump())
    return ArtistaService(db).create_artista(dto)

@router.get("/{artista_id}", response_model=ArtistaResponseDTO)
def get_artista(artista_id: int, db: Session = Depends(get_db)):
    artista = ArtistaService(db).get_artista_by_id(artista_id)
    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return artista

@router.put("/{artista_id}", response_model=ArtistaResponseDTO)
def update_artista(artista_id: int, payload: UpdateArtistaSchema, db: Session = Depends(get_db)):
    dto = UpdateArtistaDTO(**payload.model_dump())
    updated_artista = ArtistaService(db).update_artista(artista_id, dto)
    if not updated_artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    return updated_artista

@router.delete("/{artista_id}", status_code=204)
def delete_artista(artista_id: int, db: Session = Depends(get_db)):
    success = ArtistaService(db).delete_artista(artista_id)
    if not success:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    
@router.get("/", response_model=list[ArtistaResponseDTO])
def list_artistas(db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas()


@router.get("/{artista_id}/albumes", response_model=list[AlbumResponseDTO])
def list_albumes_por_artista(artista_id: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums(artista_id)


@router.get("/{artista_id}/seguidores", response_model=UsuariosSeguidoresResponseDTO)
def list_seguidores(artista_id: int, db: Session = Depends(get_db)):
    return SeguidoresController(db).list_usuarios_seguidores_por_artista(artista_id)
