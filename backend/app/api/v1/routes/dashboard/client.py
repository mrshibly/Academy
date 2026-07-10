"""Corporate client dashboard routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role, get_current_active_user
from app.models.user import User
from app.models.organization import OrganizationMember
from app.models.enrollment import Enrollment
from app.models.order import Invoice

router = APIRouter()

@router.get("/overview", status_code=200, dependencies=[Depends(require_role("corporate_client", "admin"))])
async def client_overview(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Corporate client dashboard: org enrollments and invoices."""
    # Find user's organization
    mem_result = await db.execute(select(OrganizationMember).where(OrganizationMember.user_id == user.id))
    membership = mem_result.scalar_one_or_none()
    if membership is None:
        return {"organization": None, "total_enrollments": 0, "invoices": []}

    org_id = membership.organization_id
    total = (await db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.organization_id == org_id))).scalar() or 0
    invoices = (await db.execute(select(Invoice).where(Invoice.organization_id == org_id).order_by(Invoice.created_at.desc()))).scalars().all()

    return {"organization_id": str(org_id), "total_enrollments": total, "invoices": [{"id": str(i.id), "invoice_number": i.invoice_number, "status": i.status.value} for i in invoices]}
