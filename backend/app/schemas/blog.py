"""Blog schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class BlogPostCreate(BaseModel):
    title: str = Field(max_length=500)
    slug: str = Field(max_length=500)
    content: str
    excerpt: str | None = None
    category_id: UUID | None = None
    featured_image_url: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    status: str = "draft"
    tag_ids: list[UUID] = []

class BlogPostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    excerpt: str | None = None
    category_id: UUID | None = None
    featured_image_url: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    status: str | None = None
    tag_ids: list[UUID] | None = None

class BlogPostRead(BaseModel):
    id: UUID
    title: str
    slug: str
    excerpt: str | None = None
    status: str
    published_at: datetime | None = None
    featured_image_url: str | None = None
    author_id: UUID
    category_id: UUID | None = None
    created_at: datetime
    model_config = {"from_attributes": True}
