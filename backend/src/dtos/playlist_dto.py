from pydantic import BaseModel

#(id, nombre, usuario_id, fecha_creacion, es_publica)

class CreatePlaylistDTO(BaseModel):
    nombre: str
    usuario_id: int | None = None
    descripcion: str | None = None
    imagen_url: str | None = None
    fecha_creacion: str | None = None
    es_publica: int | None = None
    colaborativa: int | None = None

class PlaylistResponseDTO(BaseModel):
    id: int
    nombre: str
    usuario_id: int
    fecha_creacion: str
    es_publica: int
    colaborativa: int
    colaboradores: list[int] = []

class PlaylistResumenDTO(BaseModel):
    id: int
    nombre: str
    cantidad_canciones: int
    duracion_total: str  # Formato: hh:mm:ss