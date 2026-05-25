from pydantic import BaseModel

class CreateCancionDTO(BaseModel):
    titulo: str
    duracion_seg: int | None = None
    album_id: int
    url_audio: str | None = None

class CancionResponseDTO(BaseModel):
    id: int
    titulo: str
    duracion_seg: int
    album_id: int
    url_audio: str | None = None


class CancionEstadisticasDTO(BaseModel):
    cancion_id: int
    cantidad_reproducciones: int
    reproducciones_validas: int
    porcentaje_promedio_escuchado: str

    model_config = {
        "json_encoders": {}
    }