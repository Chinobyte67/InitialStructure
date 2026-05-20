from pydantic import BaseModel
#(id, usuario_id, cancion_id, fecha, segundos_escuchados)

class ReproduccionResponseDTO(BaseModel):
    id: int
    usuario_id: int
    cancion_id: int
    fecha: str
    segundos_escuchados: int

class CreateReproduccionDTO(BaseModel):
    usuario_id: int
    cancion_id: int
    fecha: str
    segundos_escuchados: int