from datetime import datetime

from pydantic import BaseModel
#(id, usuario_id, cancion_id, fecha, segundos_escuchados)

class ReproduccionResponseDTO(BaseModel):
    id: int
    usuario_id: int
    cancion_id: int
    fecha: datetime
    segundos_escuchados: int

    model_config = {
        "json_encoders": {datetime: lambda v: v.isoformat()}
    }

class CreateReproduccionDTO(BaseModel):
    usuario_id: int
    cancion_id: int
    fecha: datetime
    segundos_escuchados: int