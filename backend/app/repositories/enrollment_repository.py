"""Enrollment repository."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.enrollment import Enrollment, LessonProgress, EnrollmentStatus, ProgressStatus

class EnrollmentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_user_and_course(self, user_id: UUID, course_id: UUID) -> Enrollment | None:
        stmt = select(Enrollment).where(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, course_id: UUID, cohort_id: UUID | None = None, organization_id: UUID | None = None) -> Enrollment:
        enrollment = Enrollment(user_id=user_id, course_id=course_id, cohort_id=cohort_id, organization_id=organization_id, enrolled_at=datetime.now(timezone.utc))
        self.db.add(enrollment)
        await self.db.flush()
        return enrollment

    async def list_by_user(self, user_id: UUID) -> list[Enrollment]:
        stmt = select(Enrollment).where(Enrollment.user_id == user_id).options(selectinload(Enrollment.lesson_progress)).order_by(Enrollment.enrolled_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update_lesson_progress(self, enrollment_id: UUID, lesson_id: UUID, status: str) -> LessonProgress:
        stmt = select(LessonProgress).where(LessonProgress.enrollment_id == enrollment_id, LessonProgress.lesson_id == lesson_id)
        result = await self.db.execute(stmt)
        progress = result.scalar_one_or_none()
        if progress is None:
            progress = LessonProgress(enrollment_id=enrollment_id, lesson_id=lesson_id, status=ProgressStatus(status))
            self.db.add(progress)
        else:
            progress.status = ProgressStatus(status)
        if status == "completed":
            progress.completed_at = datetime.now(timezone.utc)
        await self.db.flush()
        return progress

    async def get_completion_pct(self, enrollment_id: UUID, total_lessons: int) -> float:
        if total_lessons == 0:
            return 0.0
        stmt = select(func.count()).select_from(LessonProgress).where(LessonProgress.enrollment_id == enrollment_id, LessonProgress.status == ProgressStatus.COMPLETED)
        completed = (await self.db.execute(stmt)).scalar() or 0
        return round((completed / total_lessons) * 100, 1)
