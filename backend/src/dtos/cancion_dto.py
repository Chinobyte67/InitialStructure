from pydantic import BaseModel

class CreateCancionDTO(BaseModel):
    titulo: str
    duracion_seg: int
    album_id: int
    url_audio: str | None = None

class CancionResponseDTO(BaseModel):
    id: int
    titulo: str
    duracion_seg: int
    album_id: int
    url_audio: str | None = None