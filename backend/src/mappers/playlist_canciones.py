#(playlist_id, cancion_id, orden, fecha_agregada)

from ..db.models.playlist_canciones_model import PlaylistCanciones
from ..dtos.playlist_canciones_dto import PlaylistCancionesResponseDTO

def to_playlist_canciones_response(playlist_canciones: PlaylistCanciones) -> PlaylistCancionesResponseDTO:
    return PlaylistCancionesResponseDTO(
        id=playlist_canciones.id,
        playlist_id=playlist_canciones.playlist_id,
        cancion_id=playlist_canciones.cancion_id,
        orden=playlist_canciones.orden,
        fecha_agregada=playlist_canciones.fecha_agregada
    )