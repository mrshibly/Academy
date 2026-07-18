"""Booking schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import date, time, datetime
from pydantic import BaseModel, EmailStr, Field

class TimeSlotRead(BaseModel):
    id: UUID
    date: date
    start_time: time
    end_time: time
    is_available: bool
    model_config = {"from_attributes": True}

class BookingCreate(BaseModel):
    name: str = Field(max_length=255)
    email: EmailStr
    phone: str | None = None
    service_type: str = Field(max_length=200)
    time_slot_id: UUID | None = None
    notes: str | None = None

class BookingRead(BaseModel):
    id: UUID
    name: str
    email: str
    service_type: str
    status: str
    time_slot: TimeSlotRead | None = None
    created_at: datetime
    model_config = {"from_attributes": True}
