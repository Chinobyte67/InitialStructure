from pydantic import BaseModel

class CreateFavoritosSchema(BaseModel):
    usuario_id: int
    cancion_id: int

    # TODO: completar con los campos opcionales que se permiten actualizar.
    # Tip: todos los campos van como Optional / con default None.
class UpdateFavoritoSchema(BaseModel):
    id: int
    usuario_id: int | None = None
    cancion_id: int | None = None