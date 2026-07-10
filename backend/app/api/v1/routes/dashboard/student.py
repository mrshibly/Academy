"""Student dashboard routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate

router = APIRouter()

@router.get("/overview", status_code=200)
async def student_overview(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Student dashboard overview: enrolled courses, completions, certificates."""
    enrolled_count = (await db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.user_id == user.id))).scalar() or 0
    completed_count = (await db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.user_id == user.id, Enrollment.status == "completed"))).scalar() or 0
    cert_count = (await db.execute(select(func.count()).select_from(Certificate).where(Certificate.user_id == user.id))).scalar() or 0
    return {"enrolled_courses": enrolled_count, "completed_courses": completed_count, "certificates_earned": cert_count}
