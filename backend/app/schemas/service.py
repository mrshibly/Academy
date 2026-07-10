"""Service page schemas."""
from __future__ import annotations
from uuid import UUID
from pydantic import BaseModel, Field

class ServicePageCreate(BaseModel):
    title: str = Field(max_length=500)
    slug: str = Field(max_length=500)
    category: str = Field(max_length=200)
    hero_content: str | None = None
    description: str | None = None
    deliverables_json: str | None = None
    process_json: str | None = None
    status: str = "draft"
    order: int = 0

class ServicePageUpdate(BaseModel):
    title: str | None = None
    hero_content: str | None = None
    description: str | None = None
    deliverables_json: str | None = None
    process_json: str | None = None
    status: str | None = None
    order: int | None = None

class ServicePageRead(BaseModel):
    id: UUID
    title: str
    slug: str
    category: str
    hero_content: str | None = None
    description: str | None = None
    status: str
    order: int
    model_config = {"from_attributes": True}
