"""Support ticket routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.models.ticket import SupportTicket, TicketReply, TicketStatus
from app.schemas.ticket import TicketCreate, TicketRead, TicketReplyCreate, TicketStatusUpdate
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.post("", response_model=TicketRead, status_code=201)
async def create_ticket(data: TicketCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    ticket = SupportTicket(user_id=user.id, subject=data.subject)
    db.add(ticket)
    await db.flush()
    reply = TicketReply(ticket_id=ticket.id, user_id=user.id, body=data.body, is_staff_reply=False)
    db.add(reply)
    await db.commit()
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket.id).options(selectinload(SupportTicket.replies)))
    return TicketRead.model_validate(result.scalar_one())

@router.get("/me", response_model=list[TicketRead], status_code=200)
async def my_tickets(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).where(SupportTicket.user_id == user.id).options(selectinload(SupportTicket.replies)).order_by(SupportTicket.created_at.desc()))
    return [TicketRead.model_validate(t) for t in result.scalars().all()]

@router.get("", response_model=list[TicketRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).options(selectinload(SupportTicket.replies)).order_by(SupportTicket.created_at.desc()))
    return [TicketRead.model_validate(t) for t in result.scalars().all()]

@router.post("/{ticket_id}/replies", response_model=MessageResponse, status_code=201)
async def add_reply(ticket_id: UUID, data: TicketReplyCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise NotFoundError(resource="Ticket")
    is_staff = any(ur.role.name == "admin" for ur in user.user_roles)
    reply = TicketReply(ticket_id=ticket.id, user_id=user.id, body=data.body, is_staff_reply=is_staff)
    db.add(reply)
    await db.commit()
    return MessageResponse(message="Reply added.")

@router.patch("/{ticket_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_ticket_status(ticket_id: UUID, data: TicketStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise NotFoundError(resource="Ticket")
    ticket.status = TicketStatus(data.status)
    if data.priority:
        from app.models.ticket import TicketPriority
        ticket.priority = TicketPriority(data.priority)
    await db.commit()
    return MessageResponse(message="Ticket updated.")
