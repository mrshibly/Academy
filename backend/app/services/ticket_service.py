"""Support ticket service — customer support ticket lifecycles."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.ticket import SupportTicket, TicketReply, TicketStatus, TicketPriority
from app.repositories.ticket_repository import TicketRepository

class TicketService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = TicketRepository(db)

    async def create_ticket(self, user_id: UUID, subject: str, body: str) -> SupportTicket:
        ticket = await self.repo.create_ticket(user_id=user_id, subject=subject)
        await self.repo.create_reply(ticket_id=ticket.id, user_id=user_id, body=body, is_staff_reply=False)
        await self.db.commit()
        return await self.repo.get_by_id(ticket.id)  # type: ignore

    async def list_my_tickets(self, user_id: UUID) -> list[SupportTicket]:
        return await self.repo.list_by_user(user_id)

    async def list_all_tickets(self) -> list[SupportTicket]:
        return await self.repo.list_all()

    async def add_reply(self, ticket_id: UUID, user_id: UUID, body: str, is_staff: bool) -> TicketReply:
        ticket = await self.repo.get_by_id(ticket_id)
        if ticket is None:
            raise NotFoundError(resource="Ticket")
        reply = await self.repo.create_reply(ticket_id=ticket_id, user_id=user_id, body=body, is_staff_reply=is_staff)
        # Update status if client vs staff reply
        if is_staff:
            ticket.status = TicketStatus.IN_PROGRESS
        else:
            ticket.status = TicketStatus.OPEN
        await self.db.commit()
        return reply

    async def update_ticket(self, ticket_id: UUID, status: str, priority: str | None = None) -> SupportTicket:
        ticket = await self.repo.get_by_id(ticket_id)
        if ticket is None:
            raise NotFoundError(resource="Ticket")
        ticket.status = TicketStatus(status)
        if priority:
            ticket.priority = TicketPriority(priority)
        await self.db.commit()
        return ticket
