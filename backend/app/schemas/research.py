"""Research publication schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class PublicationCreate(BaseModel):
    title: str = Field(max_length=500)
    slug: str = Field(max_length=500)
    abstract: str | None = None
    authors_json: str | None = None
    type: str
    file_url: str | None = None
    cve_id: str | None = None
    status: str = "draft"

class PublicationRead(BaseModel):
    id: UUID
    title: str
    slug: str
    abstract: str | None = None
    type: str
    cve_id: str | None = None
    published_at: datetime | None = None
    status: str
    model_config = {"from_attributes": True}
