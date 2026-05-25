from pydantic import BaseModel, conint, field_validator

class CreateCancionSchema(BaseModel):
    titulo: str
    duracion_seg: conint(gt=0) | None = None
    album_id: int
    url_audio: str | None = None

    @field_validator("duracion_seg", "url_audio", mode="before")
    @classmethod
    def check_duration_or_url(cls, v):
        return v

class UpdateCancionSchema(BaseModel):
    id: int
    titulo: str | None = None  
    duracion_seg: int | None = None