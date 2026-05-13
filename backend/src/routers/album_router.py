from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.album_dto import CreateAlbumDTO, AlbumResponseDTO
from src.schemas.album_schema import CreateAlbumSchema, UpdateAlbumSchema
from src.services.album_service import AlbumService

router = APIRouter(prefix="/albumes", tags=["albumes"])

@router.post("/", response_model=CreateAlbumDTO)
def create_album(payload: CreateAlbumSchema, db: Session = Depends(get_db)):
    dto = CreateAlbumDTO(**payload.model_dump())
    return AlbumService(db).create_album(dto)

@router.get("/{album_id}", response_model=AlbumResponseDTO)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = AlbumService(db).get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    return album

@router.put("/", response_model=AlbumResponseDTO)
def update_album(payload: UpdateAlbumSchema, db: Session = Depends(get_db)):
    dto = CreateAlbumDTO(**payload.model_dump())
    updated_album = AlbumService(db).update_album(dto)
    if not updated_album:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    return updated_album

@router.delete("/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_album(album_id: int, db: Session = Depends(get_db)):
    success = AlbumService(db).delete_album(album_id)
    if not success:
        raise HTTPException(status_code=404, detail="Album no encontrado")
    
@router.get("/", response_model=list[AlbumResponseDTO])
def list_albums(db: Session = Depends(get_db)):
    return AlbumService(db).list_albums()

@router.get("/artista/{artista_id}", response_model=list[AlbumResponseDTO])
def list_albums_by_artista(artista_id: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_artista(artista_id)

@router.get("/genero/{genero_id}", response_model=list[AlbumResponseDTO])
def list_albums_by_genero(genero_id: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_genero(genero_id)

@router.get("/anio/{anio}", response_model=list[AlbumResponseDTO])
def list_albums_by_anio(anio: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_anio(anio)

@router.get("/titulo/{titulo}", response_model=list[AlbumResponseDTO])
def list_albums_by_titulo(titulo: str, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_titulo(titulo)

@router.get("/duracion/{duracion}", response_model=list[AlbumResponseDTO])
def list_albums_by_duracion(duracion: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_duracion(duracion)

@router.get("/cancion/{cancion_id}", response_model=list[AlbumResponseDTO])
def list_albums_by_cancion(cancion_id: int, db: Session = Depends(get_db)):
    return AlbumService(db).list_albums_by_cancion(cancion_id)
