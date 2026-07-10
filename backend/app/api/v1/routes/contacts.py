"""Contact and quote request routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.contact import ContactSubmission, QuoteRequest
from app.schemas.contact import ContactCreate, ContactRead, QuoteCreate, QuoteRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.post("", response_model=MessageResponse, status_code=201)
async def submit_contact(data: ContactCreate, db: AsyncSession = Depends(get_db)):
    db.add(ContactSubmission(**data.model_dump()))
    await db.commit()
    return MessageResponse(message="Message received. We'll be in touch shortly.")

@router.get("", response_model=list[ContactRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContactSubmission).order_by(ContactSubmission.created_at.desc()))
    return [ContactRead.model_validate(c) for c in result.scalars().all()]

@router.post("/quotes", response_model=MessageResponse, status_code=201)
async def submit_quote(data: QuoteCreate, db: AsyncSession = Depends(get_db)):
    db.add(QuoteRequest(**data.model_dump()))
    await db.commit()
    return MessageResponse(message="Quote request submitted.")

@router.get("/quotes", response_model=list[QuoteRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_quotes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuoteRequest).order_by(QuoteRequest.created_at.desc()))
    return [QuoteRead.model_validate(q) for q in result.scalars().all()]
