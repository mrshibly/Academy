"""Student dashboard routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/overview", status_code=200)
async def student_overview(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Student dashboard overview: enrolled courses, completions, certificates."""
    svc = DashboardService(db)
    return await svc.get_student_overview(user.id)
