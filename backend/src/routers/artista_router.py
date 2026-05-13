from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db 
from src.dtos.artista_dto import CreateArtistaDTO, ArtistaResponseDTO
from src.services.artista_service import ArtistaService
from src.schemas.artista_schema import CreateArtistaSchema, UpdateArtistaSchema

router = APIRouter(prefix="/artistas", tags=["artistas"])

@router.post("/", response_model=CreateArtistaDTO)
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
    dto = ArtistaResponseDTO(**payload.model_dump())
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

@router.get("/nombre/{nombre}", response_model=list[ArtistaResponseDTO])
def list_artistas_by_nombre(nombre: str, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_by_nombre(nombre)

@router.get("/pais/{pais}", response_model=list[ArtistaResponseDTO])
def list_artistas_by_pais(pais: str, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_by_pais(pais)

@router.get("/genero/{genero}", response_model=list[ArtistaResponseDTO])
def list_artistas_by_genero(genero: str, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_by_genero(genero)

@router.get("/anio/{anio}", response_model=list[ArtistaResponseDTO])
def list_artistas_by_anio(anio: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_by_anio(anio)

@router.get("/albumes/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_albumes(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_albumes(artista_id)

@router.get("/canciones/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_canciones(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_canciones(artista_id)

@router.get("/playlist/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_playlist(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_playlist(artista_id)

@router.get("/favoritos/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_favoritos(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_favoritos(artista_id)

@router.get("/seguidores/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_seguidores(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_seguidores(artista_id)

@router.get("/siguiendo/{artista_id}", response_model=list[ArtistaResponseDTO])
def list_artistas_with_siguiendo(artista_id: int, db: Session = Depends(get_db)):
    return ArtistaService(db).list_artistas_with_siguiendo(artista_id)
