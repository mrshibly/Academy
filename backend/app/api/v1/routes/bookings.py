"""Booking routes — public slot listing/booking + admin management."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError, ConflictError
from app.models.booking import Booking, TimeSlot, BookingStatus
from app.schemas.booking import BookingCreate, BookingRead, TimeSlotRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("/slots", response_model=list[TimeSlotRead], status_code=200)
async def list_slots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeSlot).where(TimeSlot.is_available == True).order_by(TimeSlot.date, TimeSlot.start_time))
    return [TimeSlotRead.model_validate(s) for s in result.scalars().all()]

@router.post("", response_model=MessageResponse, status_code=201)
async def create_booking(data: BookingCreate, db: AsyncSession = Depends(get_db)):
    if data.time_slot_id:
        slot = (await db.execute(select(TimeSlot).where(TimeSlot.id == data.time_slot_id))).scalar_one_or_none()
        if slot is None:
            raise NotFoundError(resource="TimeSlot")
        if not slot.is_available:
            raise ConflictError(message="This time slot is no longer available.")
        slot.is_available = False
    booking = Booking(**data.model_dump())
    db.add(booking)
    await db.commit()
    return MessageResponse(message="Booking submitted successfully.")

@router.get("", response_model=list[BookingRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_bookings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).order_by(Booking.created_at.desc()))
    return [BookingRead.model_validate(b) for b in result.scalars().all()]
