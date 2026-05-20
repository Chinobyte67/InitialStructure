from datetime import datetime
from pydantic import BaseModel


class CreateUserDTO(BaseModel):
    email: str
    password: str
    nombre: str | None = None
    plan: str = "free"


class UserResponseDTO(BaseModel):
    id: int
    email: str
    nombre: str | None = None
    plan: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}