from sqlalchemy.orm import Session

from ..db.models.artista_model import Artista
from ..dtos.artista_dto import ArtistaResponseDTO, CreateArtistaDTO, UpdateArtistaDTO
from ..mappers.artista_mapper import to_artista_response

class ArtistaRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, create_artista_dto: CreateArtistaDTO) -> ArtistaResponseDTO:
        artista = Artista(
            nombre=create_artista_dto.nombre,
            pais=create_artista_dto.pais,
            genero_musical=create_artista_dto.genero,
        )
        self.db.add(artista)
        self.db.commit()
        self.db.refresh(artista)
        return to_artista_response(artista)
    
    def delete(self, artista_id: int) -> bool:
        artista = self.db.query(Artista).filter(Artista.id == artista_id).first()
        if not artista:
            return False
        self.db.delete(artista)
        self.db.commit()
        return True
    
    def find_by_id(self, artista_id: int) -> ArtistaResponseDTO | None:
        artista = self.db.query(Artista).filter(Artista.id == artista_id).first()
        if not artista:
            return None
        return to_artista_response(artista)

    def list_all(self) -> list[ArtistaResponseDTO]:
        artistas = self.db.query(Artista).all()
        return [to_artista_response(a) for a in artistas]
    
    def update(self, artista_id: int, update_artista_dto: UpdateArtistaDTO) -> ArtistaResponseDTO | None:
        artista = self.db.query(Artista).filter(Artista.id == artista_id).first()
        if not artista:
            return None
        if update_artista_dto.nombre is not None:
            artista.nombre = update_artista_dto.nombre
        if update_artista_dto.pais is not None:
            artista.pais = update_artista_dto.pais
        if update_artista_dto.genero is not None:
            artista.genero_musical = update_artista_dto.genero
        self.db.commit()
        self.db.refresh(artista)
        return to_artista_response(artista)