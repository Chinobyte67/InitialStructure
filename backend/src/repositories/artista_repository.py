from ..db.models.artista_model import Artista
from ..dtos.artista_dto import ArtistaResponseDTO
from ..mappers.artista_mapper import to_artista_response

class ArtistaRepository:
    def create(self, nombre: str, pais: str, genero_musical: str) -> ArtistaResponseDTO:
        artista = Artista(
            nombre=nombre,
            pais=pais,
            genero_musical=genero_musical
        )
        artista.save()
        return to_artista_response(artista)
    
    def delete(self, artista_id: int) -> bool:
        artista = Artista.query.get(artista_id)
        if not artista:
            return False
        artista.delete()
        return True
    
    def find_by_id(self, artista_id: int) -> ArtistaResponseDTO:
        artista = Artista.query.get(artista_id)
        if not artista:
            return None
        return to_artista_response(artista)

    def list_all(self) -> list[ArtistaResponseDTO]:
        artistas = Artista.query.all()
        return [to_artista_response(a) for a in artistas]
    
    def update(self, artista_id: int, nombre: str, pais: str, genero_musical: str) -> ArtistaResponseDTO:
        artista = Artista.query.get(artista_id)
        if not artista:
            return None
        artista.nombre = nombre
        artista.pais = pais
        artista.genero_musical = genero_musical
        artista.save()
        return to_artista_response(artista)