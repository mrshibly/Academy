"""Category and Tag schemas."""
from __future__ import annotations
from uuid import UUID
from pydantic import BaseModel, Field

class CategoryCreate(BaseModel):
    name: str = Field(max_length=200)
    slug: str = Field(max_length=200)
    parent_id: UUID | None = None

class CategoryRead(BaseModel):
    id: UUID
    name: str
    slug: str
    parent_id: UUID | None = None
    model_config = {"from_attributes": True}

class TagCreate(BaseModel):
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100)

class TagRead(BaseModel):
    id: UUID
    name: str
    slug: str
    model_config = {"from_attributes": True}
