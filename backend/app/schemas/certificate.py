"""Certificate schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class CertificateRead(BaseModel):
    id: UUID
    verification_id: UUID
    course_id: UUID
    user_id: UUID
    pdf_url: str | None = None
    issued_at: datetime
    model_config = {"from_attributes": True}

class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    holder_name: str | None = None
    course_title: str | None = None
    issued_at: datetime | None = None
