#(id, nombre, usuario_id, fecha_creacion, es_publica)
from ..db.models.playlist_model import Playlist
from ..dtos.playlist_canciones_dto import PlaylistCancionesResponseDTO
from ..dtos.playlist_dto import PlaylistResponseDTO

def to_playlist_response(
    playlist: Playlist,
    colaboradores: list[int] | None = None,
    canciones: list[PlaylistCancionesResponseDTO] | None = None,
) -> PlaylistResponseDTO:
    return PlaylistResponseDTO(
        id=playlist.id,
        nombre=playlist.nombre,
        usuario_id=playlist.usuario_id,
        fecha_creacion=playlist.fecha_creacion,
        es_publica=playlist.es_publica,
        colaborativa=playlist.colaborativa,
        colaboradores=colaboradores or [],
        canciones=canciones or [],
    )