"""Certificate routes — public verification + user's certificates."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateRead, CertificateVerifyResponse

router = APIRouter()

@router.get("/verify/{verification_id}", response_model=CertificateVerifyResponse, status_code=200)
async def verify_certificate(verification_id: UUID, db: AsyncSession = Depends(get_db)):
    """Public: verify a certificate by its unique verification ID."""
    result = await db.execute(select(Certificate).where(Certificate.verification_id == verification_id).options(selectinload(Certificate.user), selectinload(Certificate.course)))
    cert = result.scalar_one_or_none()
    if cert is None:
        return CertificateVerifyResponse(is_valid=False)
    return CertificateVerifyResponse(is_valid=True, holder_name=cert.user.full_name, course_title=cert.course.title, issued_at=cert.issued_at)

@router.get("/me", response_model=list[CertificateRead], status_code=200)
async def my_certificates(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """List current user's certificates."""
    result = await db.execute(select(Certificate).where(Certificate.user_id == user.id).order_by(Certificate.issued_at.desc()))
    return [CertificateRead.model_validate(c) for c in result.scalars().all()]
