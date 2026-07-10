"""User schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    roles: list[str] = []
    created_at: datetime
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    avatar_url: str | None = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    roles: list[str] = ["student"]

class UserRoleUpdate(BaseModel):
    roles: list[str]
