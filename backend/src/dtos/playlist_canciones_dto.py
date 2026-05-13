from pydantic import BaseModel

#(playlist_id, cancion_id, orden, fecha_agregada)

class CreatePlaylistCancionesDTO(BaseModel):
    playlist_id: int
    cancion_id: int
    orden: int
    fecha_agregada: str

class PlaylistCancionesResponseDTO(BaseModel):
    id: int
    playlist_id: int
    cancion_id: int
    orden: int
    fecha_agregada: str