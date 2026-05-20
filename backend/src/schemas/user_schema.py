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
            raise ValueError('Password must be at least 8 characters')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must not exceed 72 bytes when encoded')
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
            raise ValueError('Password must be at least 8 characters')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must not exceed 72 bytes when encoded')
        return v

