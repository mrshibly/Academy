"""Support ticket routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketRead, TicketReplyCreate, TicketStatusUpdate
from app.schemas.auth import MessageResponse
from app.services.ticket_service import TicketService

router = APIRouter()

@router.post("", response_model=TicketRead, status_code=201)
async def create_ticket(data: TicketCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = TicketService(db)
    ticket = await svc.create_ticket(user_id=user.id, subject=data.subject, body=data.body)
    return TicketRead.model_validate(ticket)

@router.get("/me", response_model=list[TicketRead], status_code=200)
async def my_tickets(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = TicketService(db)
    tickets = await svc.list_my_tickets(user.id)
    return [TicketRead.model_validate(t) for t in tickets]

@router.get("", response_model=list[TicketRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    svc = TicketService(db)
    tickets = await svc.list_all_tickets()
    return [TicketRead.model_validate(t) for t in tickets]

@router.post("/{ticket_id}/replies", response_model=MessageResponse, status_code=201)
async def add_reply(ticket_id: UUID, data: TicketReplyCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = TicketService(db)
    is_staff = any(ur.role.name == "admin" for ur in user.user_roles)
    await svc.add_reply(ticket_id=ticket_id, user_id=user.id, body=data.body, is_staff=is_staff)
    return MessageResponse(message="Reply added.")

@router.patch("/{ticket_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_ticket_status(ticket_id: UUID, data: TicketStatusUpdate, db: AsyncSession = Depends(get_db)):
    svc = TicketService(db)
    await svc.update_ticket(ticket_id=ticket_id, status=data.status, priority=data.priority)
    return MessageResponse(message="Ticket updated.")
