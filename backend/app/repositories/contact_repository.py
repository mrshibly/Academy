"""Contact and Quote repository — all contact-related DB queries."""
from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import ContactSubmission, QuoteRequest

class ContactRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_contact_submission(self, **kwargs: object) -> ContactSubmission:
        sub = ContactSubmission(**kwargs)
        self.db.add(sub)
        await self.db.flush()
        return sub

    async def list_contact_submissions(self) -> list[ContactSubmission]:
        result = await self.db.execute(select(ContactSubmission).order_by(ContactSubmission.created_at.desc()))
        return list(result.scalars().all())

    async def create_quote_request(self, **kwargs: object) -> QuoteRequest:
        req = QuoteRequest(**kwargs)
        self.db.add(req)
        await self.db.flush()
        return req

    async def list_quote_requests(self) -> list[QuoteRequest]:
        result = await self.db.execute(select(QuoteRequest).order_by(QuoteRequest.created_at.desc()))
        return list(result.scalars().all())
