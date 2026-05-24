from pydantic import BaseModel
from ..dtos.cancion_dto import CancionResponseDTO
from ..dtos.artista_dto import ArtistaResponseDTO
from ..dtos.album_dto import AlbumResponseDTO


class BuscarResponseDTO(BaseModel):
    canciones: list[CancionResponseDTO]
    artistas: list[ArtistaResponseDTO]
    albumes: list[AlbumResponseDTO]
