"""Enrollment routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead, LessonProgressUpdate
from app.schemas.auth import MessageResponse
from app.services.enrollment_service import EnrollmentService

router = APIRouter()

@router.post("", response_model=EnrollmentRead, status_code=201)
async def enroll(data: EnrollmentCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Enroll the current user in a course."""
    svc = EnrollmentService(db)
    enrollment = await svc.enroll(user.id, data.course_id, data.cohort_id)
    return EnrollmentRead.model_validate(enrollment)

@router.get("/me", response_model=list[EnrollmentRead], status_code=200)
async def my_enrollments(user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """List current user's enrollments."""
    svc = EnrollmentService(db)
    enrollments = await svc.get_my_enrollments(user.id)
    return [EnrollmentRead.model_validate(e) for e in enrollments]

@router.patch("/{enrollment_id}/progress", status_code=200)
async def update_progress(enrollment_id: str, data: LessonProgressUpdate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Update lesson progress for an enrollment."""
    svc = EnrollmentService(db)
    progress = await svc.update_progress(UUID(enrollment_id), data.lesson_id, data.status)
    return {"lesson_id": str(progress.lesson_id), "status": progress.status.value}

@router.get("", status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_enrollments(db: AsyncSession = Depends(get_db)):
    """Admin: list all enrollments with course & user details."""
    svc = EnrollmentService(db)
    items = await svc.list_all_enrollments()
    return [
        {
            "id": str(e.id),
            "user_id": str(e.user_id),
            "user_name": e.user.full_name,
            "user_email": e.user.email,
            "course_id": str(e.course_id),
            "course_title": e.course.title,
            "status": e.status.value,
            "enrolled_at": e.enrolled_at.isoformat(),
            "completed_at": e.completed_at.isoformat() if e.completed_at else None,
        }
        for e in items
    ]

@router.delete("/{enrollment_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def cancel_enrollment(enrollment_id: UUID, db: AsyncSession = Depends(get_db)):
    """Admin: delete/cancel enrollment."""
    svc = EnrollmentService(db)
    await svc.delete_enrollment(enrollment_id)
    return MessageResponse(message="Enrollment deleted successfully.")
