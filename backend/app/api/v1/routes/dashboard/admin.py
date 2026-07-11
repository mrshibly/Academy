"""Admin dashboard routes — key business metrics and audit logs."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/metrics", status_code=200, dependencies=[Depends(require_role("admin"))])
async def admin_metrics(db: AsyncSession = Depends(get_db)):
    """Key business metrics for the admin dashboard."""
    svc = DashboardService(db)
    return await svc.get_admin_metrics()

@router.get("/audit-logs", status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_audit_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db)):
    """Paginated audit log view."""
    svc = DashboardService(db)
    items, total = await svc.list_audit_logs(page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}
