"""Contact and quote request schemas."""
from __future__ import annotations
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class ContactCreate(BaseModel):
    name: str = Field(max_length=255)
    email: EmailStr
    subject: str = Field(max_length=500)
    message: str

class ContactRead(BaseModel):
    id: UUID
    name: str
    email: str
    subject: str
    message: str
    status: str
    model_config = {"from_attributes": True}

class QuoteCreate(BaseModel):
    name: str = Field(max_length=255)
    email: EmailStr
    company: str | None = None
    service_type: str = Field(max_length=200)
    budget_range: str | None = None
    details: str

class QuoteRead(BaseModel):
    id: UUID
    name: str
    email: str
    service_type: str
    status: str
    model_config = {"from_attributes": True}
