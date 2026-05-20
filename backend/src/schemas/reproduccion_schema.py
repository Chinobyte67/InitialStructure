from datetime import datetime

from pydantic import BaseModel

class CreateReproduccionSchema(BaseModel):
    usuario_id: int
    cancion_id: int
    fecha: datetime
    segundos_escuchados: int

class UpdateReproduccionSchema(BaseModel):
    usuario_id: int | None = None
    cancion_id: int | None = None
    fecha: datetime | None = None
    segundos_escuchados: int | None = None