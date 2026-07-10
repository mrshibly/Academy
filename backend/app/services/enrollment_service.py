"""Enrollment service — enroll students, track progress, compute completion."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictError, NotFoundError
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.course_repository import CourseRepository

class EnrollmentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.enroll_repo = EnrollmentRepository(db)
        self.course_repo = CourseRepository(db)

    async def enroll(self, user_id: UUID, course_id: UUID, cohort_id: UUID | None = None):
        existing = await self.enroll_repo.get_by_user_and_course(user_id, course_id)
        if existing is not None:
            raise ConflictError(message="Already enrolled in this course.")
        enrollment = await self.enroll_repo.create(user_id, course_id, cohort_id=cohort_id)
        await self.db.commit()
        return enrollment

    async def get_my_enrollments(self, user_id: UUID):
        return await self.enroll_repo.list_by_user(user_id)

    async def update_progress(self, enrollment_id: UUID, lesson_id: UUID, status: str):
        progress = await self.enroll_repo.update_lesson_progress(enrollment_id, lesson_id, status)
        await self.db.commit()
        return progress
