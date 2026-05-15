from pydantic import BaseModel, EmailStr, Field, constr

class CreateUserSchema(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=72)  # tipo, no valor por defecto
    age: int = Field(ge=18)

class UpdateUserSchema(BaseModel):
    email: EmailStr | None = None
    password: constr(min_length=8, max_length=72) | None = None
    age: int | None = Field(default=None, ge=18)
