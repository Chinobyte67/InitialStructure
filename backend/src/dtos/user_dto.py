from datetime import datetime
from pydantic import BaseModel


class CreateUserDTO(BaseModel):
    email: str
    password: str
    age: int
    plan: str = "free"


class UserResponseDTO(BaseModel):
    id: int
    email: str
    nombre: str
    age: int
    created_at: datetime

    model_config = {"from_attributes": True}