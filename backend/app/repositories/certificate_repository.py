"""Certificate repository — all certificate-related DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.certificate import Certificate

class CertificateRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_verification_id(self, verification_id: UUID) -> Certificate | None:
        stmt = select(Certificate).where(Certificate.verification_id == verification_id).options(
            selectinload(Certificate.user),
            selectinload(Certificate.course)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user_id(self, user_id: UUID) -> list[Certificate]:
        stmt = select(Certificate).where(Certificate.user_id == user_id).order_by(Certificate.issued_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_enrollment_id(self, enrollment_id: UUID) -> Certificate | None:
        stmt = select(Certificate).where(Certificate.enrollment_id == enrollment_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Certificate:
        cert = Certificate(**kwargs)
        self.db.add(cert)
        await self.db.flush()
        return cert
