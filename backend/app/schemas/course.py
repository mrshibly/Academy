"""Course, Module, Lesson schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class LessonCreate(BaseModel):
    title: str = Field(max_length=500)
    order: int = 0
    content_type: str = "text"
    content_url: str | None = None
    content_body: str | None = None
    duration_minutes: int | None = None
    is_free_preview: bool = False

class LessonRead(BaseModel):
    id: UUID
    title: str
    order: int
    content_type: str
    content_url: str | None = None
    duration_minutes: int | None = None
    is_free_preview: bool
    model_config = {"from_attributes": True}

class ModuleCreate(BaseModel):
    title: str = Field(max_length=500)
    description: str | None = None
    order: int = 0

class ModuleRead(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    order: int
    lessons: list[LessonRead] = []
    model_config = {"from_attributes": True}

class CourseCreate(BaseModel):
    title: str = Field(max_length=500)
    slug: str = Field(max_length=500)
    description: str | None = None
    short_description: str | None = None
    price: float = 0
    currency: str = "USD"
    level: str = "beginner"
    category_id: UUID | None = None
    thumbnail_url: str | None = None
    duration_hours: float | None = None

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    short_description: str | None = None
    price: float | None = None
    level: str | None = None
    category_id: UUID | None = None
    thumbnail_url: str | None = None
    duration_hours: float | None = None
    status: str | None = None

class CourseRead(BaseModel):
    id: UUID
    title: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    price: float
    currency: str
    level: str
    status: str
    thumbnail_url: str | None = None
    duration_hours: float | None = None
    instructor_id: UUID
    category_id: UUID | None = None
    created_at: datetime
    modules: list[ModuleRead] = []
    model_config = {"from_attributes": True}


class ModuleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None


class LessonUpdate(BaseModel):
    title: str | None = None
    order: int | None = None
    content_type: str | None = None
    content_url: str | None = None
    content_body: str | None = None
    duration_minutes: int | None = None
    is_free_preview: bool | None = None
