from pydantic import BaseModel

#(playlist_id, cancion_id, orden, fecha_agregada)

class CreatePlaylistCancionesDTO(BaseModel):
    playlist_id: int
    cancion_id: int
    orden: int | None = None

class UpdatePlaylistCancionesDTO(BaseModel):
    playlist_id: int | None = None
    cancion_id: int | None = None
    orden: int | None = None

class PlaylistCancionesResponseDTO(BaseModel):
    id: int
    playlist_id: int
    cancion_id: int
    orden: int
    fecha_agregada: str