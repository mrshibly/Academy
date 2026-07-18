"""Booking repository — all booking and time-slot DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.booking import Booking, TimeSlot


class BookingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_available_slots(self) -> list[TimeSlot]:
        result = await self.db.execute(
            select(TimeSlot)
            .where(TimeSlot.is_available == True)  # noqa: E712
            .order_by(TimeSlot.date, TimeSlot.start_time)
        )
        return list(result.scalars().all())

    async def get_slot_for_update(self, slot_id: UUID) -> TimeSlot | None:
        """Acquire a row-level lock on the slot to prevent race conditions.
        Falls back to a plain SELECT on SQLite (which doesn't support FOR UPDATE).
        """
        stmt = (
            select(TimeSlot)
            .where(TimeSlot.id == slot_id, TimeSlot.is_available == True)  # noqa: E712
        )
        # SQLite does not support SELECT ... FOR UPDATE; skip it for SQLite
        dialect_name = self.db.bind.dialect.name if self.db.bind else ""
        if dialect_name != "sqlite":
            stmt = stmt.with_for_update()
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_booking(self, **kwargs: object) -> Booking:
        booking = Booking(**kwargs)
        self.db.add(booking)
        await self.db.flush()
        return booking

    async def list_all_bookings(self) -> list[Booking]:
        result = await self.db.execute(select(Booking).order_by(Booking.created_at.desc()))
        return list(result.scalars().all())
