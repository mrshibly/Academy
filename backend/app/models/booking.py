"""Booking and TimeSlot models — consultation scheduling."""
from __future__ import annotations
import enum, uuid
from datetime import date, time
from sqlalchemy import Date, Enum, ForeignKey, String, Text, Time, Boolean, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class TimeSlot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "time_slots"
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

class Booking(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "bookings"
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    service_type: Mapped[str] = mapped_column(String(200), nullable=False)
    time_slot_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("time_slots.id"), nullable=True, index=True)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), nullable=False, default=BookingStatus.PENDING)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    time_slot: Mapped["TimeSlot | None"] = relationship("TimeSlot")
