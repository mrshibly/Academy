"""Support ticket repository — tickets and replies DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.ticket import SupportTicket, TicketReply

class TicketRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, ticket_id: UUID) -> SupportTicket | None:
        result = await self.db.execute(
            select(SupportTicket)
            .where(SupportTicket.id == ticket_id)
            .options(selectinload(SupportTicket.replies))
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: UUID) -> list[SupportTicket]:
        result = await self.db.execute(
            select(SupportTicket)
            .where(SupportTicket.user_id == user_id)
            .options(selectinload(SupportTicket.replies))
            .order_by(SupportTicket.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_all(self) -> list[SupportTicket]:
        result = await self.db.execute(
            select(SupportTicket)
            .options(selectinload(SupportTicket.replies))
            .order_by(SupportTicket.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_ticket(self, **kwargs: object) -> SupportTicket:
        ticket = SupportTicket(**kwargs)
        self.db.add(ticket)
        await self.db.flush()
        return ticket

    async def create_reply(self, **kwargs: object) -> TicketReply:
        reply = TicketReply(**kwargs)
        self.db.add(reply)
        await self.db.flush()
        return reply
