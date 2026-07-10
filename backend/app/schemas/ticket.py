"""Support ticket schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class TicketCreate(BaseModel):
    subject: str = Field(max_length=500)
    body: str

class TicketReplyCreate(BaseModel):
    body: str

class TicketReplyRead(BaseModel):
    id: UUID
    user_id: UUID
    body: str
    is_staff_reply: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class TicketRead(BaseModel):
    id: UUID
    subject: str
    status: str
    priority: str
    created_at: datetime
    replies: list[TicketReplyRead] = []
    model_config = {"from_attributes": True}

class TicketStatusUpdate(BaseModel):
    status: str
    priority: str | None = None
