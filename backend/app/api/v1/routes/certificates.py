"""Certificate routes — public verification + user's certificates."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
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

@router.get("/fallback/{verification_id}.pdf", status_code=200)
async def fallback_certificate(
    verification_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve fallback certificate PDF or HTML directly."""
    from app.services.certificate_utils import get_certificate_pdf_bytes_by_verification_id
    res = await get_certificate_pdf_bytes_by_verification_id(db, verification_id)
    if res is None:
        raise NotFoundError(resource="Certificate")
    pdf_bytes, media_type = res
    filename = f"certificate-{verification_id}.pdf" if media_type == "application/pdf" else f"certificate-{verification_id}.html"
    return Response(
        content=pdf_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("", status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_certificates(db: AsyncSession = Depends(get_db)):
    """Admin: list all certificates with user and course info."""
    svc = CertificateService(db)
    items = await svc.list_all_certificates()
    return [
        {
            "id": str(c.id),
            "verification_id": str(c.verification_id),
            "user_id": str(c.user_id),
            "user_name": c.user.full_name,
            "user_email": c.user.email,
            "course_id": str(c.course_id),
            "course_title": c.course.title,
            "pdf_url": c.pdf_url,
            "issued_at": c.issued_at.isoformat(),
        }
        for c in items
    ]
