"""Contact and quote request routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.contact import ContactCreate, ContactRead, QuoteCreate, QuoteRead
from app.schemas.auth import MessageResponse
from app.services.contact_service import ContactService

router = APIRouter()

@router.post("", response_model=MessageResponse, status_code=201)
async def submit_contact(data: ContactCreate, db: AsyncSession = Depends(get_db)):
    svc = ContactService(db)
    await svc.submit_contact(**data.model_dump())
    return MessageResponse(message="Message received. We'll be in touch shortly.")

@router.get("", response_model=list[ContactRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_contacts(db: AsyncSession = Depends(get_db)):
    svc = ContactService(db)
    subs = await svc.list_contacts()
    return [ContactRead.model_validate(c) for c in subs]

@router.post("/quotes", response_model=MessageResponse, status_code=201)
async def submit_quote(data: QuoteCreate, db: AsyncSession = Depends(get_db)):
    svc = ContactService(db)
    await svc.submit_quote(**data.model_dump())
    return MessageResponse(message="Quote request submitted.")

@router.get("/quotes", response_model=list[QuoteRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_quotes(db: AsyncSession = Depends(get_db)):
    svc = ContactService(db)
    reqs = await svc.list_quotes()
    return [QuoteRead.model_validate(q) for q in reqs]
