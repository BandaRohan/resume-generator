from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# User models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    access_token: str
    token_type: str = "bearer"

# Auth response model
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
