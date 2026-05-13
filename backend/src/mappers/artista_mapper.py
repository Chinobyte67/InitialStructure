from ..db.models.artista_model import Artista
from ..dtos.artista_dto import ArtistaResponseDTO  

def to_artista_response(artista: Artista) -> ArtistaResponseDTO:
    return ArtistaResponseDTO(
        id=artista.id,
        nombre=artista.nombre,
        pais=artista.pais,
        genero=artista.genero_musical
    )