# TODO: definir CreateProductDTO y ProductResponseDTO



class CreateCancionDTO(BaseModel):
    titulo: str
    duracion_seg: int
    album_id: int

class CancionResponseDTO(BaseModel):
    id: int
    titulo: str
    duracion_seg: int
    album_id: int