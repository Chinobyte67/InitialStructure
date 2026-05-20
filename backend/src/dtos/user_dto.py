from datetime import datetime
from pydantic import BaseModel


class CreateUserDTO(BaseModel):
    email: str
    password: str
    age: int


class UserResponseDTO(BaseModel):
    id: int
    email: str
    age: int
    created_at: datetime

    model_config = {"from_attributes": True}
