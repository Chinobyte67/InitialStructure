from pydantic import BaseModel, EmailStr, Field, constr

class CreateUserSchema(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=72)
    plan: str = "free"

class UpdateUserSchema(BaseModel):
    email: EmailStr | None = None
    password: constr(min_length=8, max_length=72) | None = None
    plan: str | None = None
