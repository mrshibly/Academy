"""Certificate service — completion certificate verifications."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.certificate import Certificate
from app.repositories.certificate_repository import CertificateRepository

class CertificateService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CertificateRepository(db)

    async def get_by_verification_id(self, verification_id: UUID) -> Certificate | None:
        return await self.repo.get_by_verification_id(verification_id)

    async def list_by_user_id(self, user_id: UUID) -> list[Certificate]:
        return await self.repo.list_by_user_id(user_id)

    async def list_all_certificates(self) -> list[Certificate]:
        return await self.repo.list_all()

    async def get_by_enrollment_id(self, enrollment_id: UUID) -> Certificate | None:
        return await self.repo.get_by_enrollment_id(enrollment_id)

    async def create_certificate(self, **kwargs: object) -> Certificate:
        cert = await self.repo.create(**kwargs)
        await self.db.commit()
        return cert
