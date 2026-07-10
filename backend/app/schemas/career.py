"""Career / job posting schemas."""
from __future__ import annotations
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class JobPostingCreate(BaseModel):
    title: str = Field(max_length=300)
    slug: str = Field(max_length=300)
    department: str
    location: str
    type: str
    description: str
    requirements: str | None = None
    status: str = "draft"

class JobPostingRead(BaseModel):
    id: UUID
    title: str
    slug: str
    department: str
    location: str
    type: str
    status: str
    model_config = {"from_attributes": True}

class JobApplicationCreate(BaseModel):
    name: str = Field(max_length=255)
    email: EmailStr
    resume_url: str | None = None
    cover_letter: str | None = None

class JobApplicationRead(BaseModel):
    id: UUID
    job_id: UUID
    name: str
    email: str
    status: str
    model_config = {"from_attributes": True}
