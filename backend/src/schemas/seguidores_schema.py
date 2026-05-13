from pydantic import BaseModel
#(usuario_id, artista_id)

class UpdateSeguidoresSchema(BaseModel):
    id: int
    usuario_id: int
    artista_id: int

class CreateSeguidoresSchema(BaseModel):
    usuario_id: int
    artista_id: int