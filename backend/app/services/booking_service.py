"""Booking service — booking and slot conflict resolution business logic."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError, ConflictError
from app.models.booking import Booking, TimeSlot
from app.repositories.booking_repository import BookingRepository

class BookingService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = BookingRepository(db)

    async def list_available_slots(self) -> list[TimeSlot]:
        return await self.repo.list_available_slots()

    async def create_booking(self, **kwargs: object) -> Booking:
        time_slot_id: UUID | None = kwargs.get("time_slot_id")  # type: ignore
        if time_slot_id:
            # Row-level lock slot to prevent concurrent double-booking race condition
            slot = await self.repo.get_slot_for_update(time_slot_id)
            if slot is None:
                raise NotFoundError(resource="TimeSlot")
            if not slot.is_available:
                raise ConflictError(message="This time slot is no longer available.")
            slot.is_available = False

        booking = await self.repo.create_booking(**kwargs)
        await self.db.commit()
        return booking

    async def list_all_bookings(self) -> list[Booking]:
        return await self.repo.list_all_bookings()
