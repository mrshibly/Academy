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
        from sqlalchemy import select, func
        from datetime import datetime, timezone
        from app.models.enrollment import Enrollment, EnrollmentStatus
        from app.models.course import Lesson, Module, Course
        from app.models.user import User
        from app.workers.tasks.certificate_tasks import generate_certificate_task

        # Retrieve the enrollment
        enroll_stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
        enrollment_res = await self.db.execute(enroll_stmt)
        enrollment = enrollment_res.scalar_one_or_none()
        if enrollment is None:
            raise NotFoundError(resource="Enrollment")

        progress = await self.enroll_repo.update_lesson_progress(enrollment_id, lesson_id, status)

        # Count total lessons in the course
        lesson_count_stmt = select(func.count(Lesson.id)).join(Module).where(Module.course_id == enrollment.course_id)
        total_lessons = (await self.db.execute(lesson_count_stmt)).scalar() or 0

        # Calculate completion percentage
        completion_pct = await self.enroll_repo.get_completion_pct(enrollment_id, total_lessons)

        # Check if certificate exists to determine if we should generate one
        from app.models.certificate import Certificate
        cert_stmt = select(Certificate).where(Certificate.enrollment_id == enrollment.id)
        existing_cert = (await self.db.execute(cert_stmt)).scalar_one_or_none()

        if completion_pct >= 100.0 and (enrollment.status != EnrollmentStatus.COMPLETED or not existing_cert):
            if enrollment.status != EnrollmentStatus.COMPLETED:
                enrollment.status = EnrollmentStatus.COMPLETED
                enrollment.completed_at = datetime.now(timezone.utc)
            
            # Fetch user and course info for certificate generation
            user_stmt = select(User).where(User.id == enrollment.user_id)
            user = (await self.db.execute(user_stmt)).scalar_one()
            
            course_stmt = select(Course).where(Course.id == enrollment.course_id)
            course = (await self.db.execute(course_stmt)).scalar_one()
            
            # Check if Redis broker is online first before calling Celery to avoid blocking hangs
            redis_online = False
            try:
                import socket
                from urllib.parse import urlparse
                from app.core.config import get_settings
                redis_url = get_settings().REDIS_URL
                if redis_url:
                    parsed = urlparse(redis_url)
                    host = parsed.hostname or "127.0.0.1"
                    port = parsed.port or 6379
                    with socket.create_connection((host, port), timeout=0.2):
                        redis_online = True
            except Exception:
                redis_online = False

            if redis_online:
                try:
                    generate_certificate_task.delay(str(enrollment.id), user.full_name, course.title)
                except Exception as e:
                    import logging
                    logging.getLogger("uvicorn.error").warning(f"Celery dispatch failed: {e}")
                    redis_online = False

            if not redis_online:
                import logging
                logging.getLogger("uvicorn.error").info("Redis offline. Generating certificate synchronously in-process...")
                from app.services.certificate_utils import generate_certificate_in_process
                await generate_certificate_in_process(self.db, enrollment.id, user.full_name, course.title)

        await self.db.commit()
        return progress

    async def list_all_enrollments(self):
        return await self.enroll_repo.list_all()

    async def delete_enrollment(self, enrollment_id: UUID) -> None:
        await self.enroll_repo.delete(enrollment_id)
        await self.db.commit()

    async def get_enrollment_detail(self, enrollment_id: UUID):
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.enrollment import Enrollment
        from app.models.course import Course, Module

        stmt = (
            select(Enrollment)
            .where(Enrollment.id == enrollment_id)
            .options(
                selectinload(Enrollment.course)
                .selectinload(Course.modules)
                .selectinload(Module.lessons),
                selectinload(Enrollment.lesson_progress)
            )
        )
        res = await self.db.execute(stmt)
        enrollment = res.scalar_one_or_none()
        if enrollment is None:
            raise NotFoundError(resource="Enrollment")
        return enrollment
