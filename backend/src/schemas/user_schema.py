from pydantic import BaseModel, EmailStr, field_validator

class CreateUserSchema(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    plan: str = "free"
    
    @field_validator('password', mode='after')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('la contraseña debe ser minimo 8 caracteres')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('La contraseña no puede exceder los 72 bytes al codificarse')
        return v

    @field_validator('plan', mode='after')
    @classmethod
    def validate_plan(cls, v):
        if v not in {"free", "premium", "familiar"}:
            raise ValueError('Plan must be one of: free, premium, familiar')
        return v

class UpdateUserSchema(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    nombre: str | None = None
    plan: str | None = None
    
    @field_validator('password', mode='after')
    @classmethod
    def validate_password(cls, v):
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError('la contraseña debe ser minimo 8 caracteres')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('La contraseña no puede exceder los 72 bytes al codificarse')
        return v

    @field_validator('plan', mode='after')
    @classmethod
    def validate_plan(cls, v):
        if v is None:
            return v
        if v not in {"free", "premium", "familiar"}:
            raise ValueError('Plan must be one of: free, premium, familiar')
        return v

