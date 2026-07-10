"""Instructor dashboard routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role, get_current_active_user
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter()

@router.get("/overview", status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def instructor_overview(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Instructor dashboard: their courses and student counts."""
    courses = (await db.execute(select(Course).where(Course.instructor_id == user.id, Course.deleted_at.is_(None)))).scalars().all()
    course_stats = []
    for c in courses:
        enrolled = (await db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.course_id == c.id))).scalar() or 0
        course_stats.append({"course_id": str(c.id), "title": c.title, "status": c.status.value, "enrolled_students": enrolled})
    return {"total_courses": len(courses), "courses": course_stats}
