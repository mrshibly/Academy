"""Certificate routes — public verification + user's certificates."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.certificate import CertificateRead, CertificateVerifyResponse
from app.services.certificate_service import CertificateService

router = APIRouter()

@router.get("/verify/{verification_id}", response_model=CertificateVerifyResponse, status_code=200)
async def verify_certificate(verification_id: UUID, db: AsyncSession = Depends(get_db)):
    """Public: verify a certificate by its unique verification ID."""
    svc = CertificateService(db)
    cert = await svc.get_by_verification_id(verification_id)
    if cert is None:
        return CertificateVerifyResponse(is_valid=False)
    return CertificateVerifyResponse(is_valid=True, holder_name=cert.user.full_name, course_title=cert.course.title, issued_at=cert.issued_at)

@router.get("/me", response_model=list[CertificateRead], status_code=200)
async def my_certificates(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """List current user's certificates."""
    svc = CertificateService(db)
    certs = await svc.list_by_user_id(user.id)
    return [CertificateRead.model_validate(c) for c in certs]
