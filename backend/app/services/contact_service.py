"""Contact service — captures service inquiries and quote requests."""
from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import ContactSubmission, QuoteRequest
from app.repositories.contact_repository import ContactRepository

class ContactService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ContactRepository(db)

    async def submit_contact(self, **kwargs: object) -> ContactSubmission:
        sub = await self.repo.create_contact_submission(**kwargs)
        await self.db.commit()
        return sub

    async def list_contacts(self) -> list[ContactSubmission]:
        return await self.repo.list_contact_submissions()

    async def submit_quote(self, **kwargs: object) -> QuoteRequest:
        req = await self.repo.create_quote_request(**kwargs)
        await self.db.commit()
        return req

    async def list_quotes(self) -> list[QuoteRequest]:
        return await self.repo.list_quote_requests()
