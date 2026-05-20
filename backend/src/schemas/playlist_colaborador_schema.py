from pydantic import BaseModel


class AddPlaylistColaboradorSchema(BaseModel):
    usuario_id: int
