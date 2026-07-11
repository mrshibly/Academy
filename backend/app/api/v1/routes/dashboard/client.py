"""Corporate client dashboard routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role, get_current_active_user
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/overview", status_code=200, dependencies=[Depends(require_role("corporate_client", "admin"))])
async def client_overview(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Corporate client dashboard: org enrollments and invoices."""
    svc = DashboardService(db)
    return await svc.get_client_overview(user.id)
