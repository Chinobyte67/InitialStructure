from pydantic import BaseModel

class CreatePlaylistCancionesSchema(BaseModel):
    playlist_id: int
    cancion_id: int

class UpdatePlaylistCancionesSchema(BaseModel):
    playlist_id: int | None = None
    cancion_id: int | None = None
    orden: int | None = None

