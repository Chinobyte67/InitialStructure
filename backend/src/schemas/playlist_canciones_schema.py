from pydantic import BaseModel

class CreatePlaylistCancionesSchema(BaseModel):
    playlist_id: int
    cancion_id: int
    orden: int
    fecha_agregada: str

class UpdatePlaylistCancionesSchema(BaseModel):
    playlist_id: int | None = None
    cancion_id: int | None = None
    orden: int | None = None
    fecha_agregada: str | None = None

