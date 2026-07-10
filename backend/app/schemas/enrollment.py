"""Enrollment schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class EnrollmentCreate(BaseModel):
    course_id: UUID
    cohort_id: UUID | None = None

class LessonProgressUpdate(BaseModel):
    lesson_id: UUID
    status: str  # not_started | in_progress | completed

class EnrollmentRead(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    status: str
    enrolled_at: datetime
    completed_at: datetime | None = None
    completion_pct: float = 0.0
    model_config = {"from_attributes": True}
