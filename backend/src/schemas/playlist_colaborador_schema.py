from pydantic import BaseModel


class AddPlaylistColaboradorSchema(BaseModel):
    usuario_id: int
    usuario_dueno_id: int
