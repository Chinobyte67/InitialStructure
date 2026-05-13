from ..db.models.album_model import Album
from ..dtos.album_dto import AlbumResponseDTO 

def to_album_response(album: Album) -> AlbumResponseDTO:
    return AlbumResponseDTO(
        id=album.id,
        titulo=album.titulo,
        anio=album.anio,
        artista_id=album.artista_id
    )