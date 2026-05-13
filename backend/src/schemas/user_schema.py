from pydantic import BaseModel, EmailStr, Field


class CreateUserSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    age: int = Field(ge=18)


class UpdateUserSchema(BaseModel):
    # TODO: completar con los campos opcionales que se permiten actualizar.
    # Tip: todos los campos van como Optional / con default None.
    ...
    id: int
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    age: int | None = Field(default=None, ge=18)
