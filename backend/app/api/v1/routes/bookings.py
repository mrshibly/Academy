"""Booking routes — public slot listing/booking + admin management."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.booking import BookingCreate, BookingRead, TimeSlotRead
from app.schemas.auth import MessageResponse
from app.services.booking_service import BookingService

router = APIRouter()

@router.get("/slots", response_model=list[TimeSlotRead], status_code=200)
async def list_slots(db: AsyncSession = Depends(get_db)):
    svc = BookingService(db)
    slots = await svc.list_available_slots()
    return [TimeSlotRead.model_validate(s) for s in slots]

@router.post("", response_model=MessageResponse, status_code=201)
async def create_booking(data: BookingCreate, db: AsyncSession = Depends(get_db)):
    svc = BookingService(db)
    await svc.create_booking(**data.model_dump())
    return MessageResponse(message="Booking submitted successfully.")

@router.get("", response_model=list[BookingRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_bookings(db: AsyncSession = Depends(get_db)):
    svc = BookingService(db)
    bookings = await svc.list_all_bookings()
    return [BookingRead.model_validate(b) for b in bookings]
