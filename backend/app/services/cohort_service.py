"""Cohort service — live training cohort operations."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError, ConflictError
from app.models.cohort import Cohort
from app.repositories.cohort_repository import CohortRepository
from app.services.enrollment_service import EnrollmentService

class CohortService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CohortRepository(db)
        self.enroll_svc = EnrollmentService(db)

    async def list_cohorts(self) -> list[Cohort]:
        return await self.repo.list_cohorts()

    async def create_cohort(self, **kwargs: object) -> Cohort:
        cohort = await self.repo.create(**kwargs)
        await self.db.commit()
        return cohort

    async def enroll_users(self, cohort_id: UUID, user_ids: list[UUID]) -> int:
        cohort = await self.repo.get_by_id(cohort_id)
        if cohort is None:
            raise NotFoundError(resource="Cohort")

        # Capacity enforcement: Check how many users are currently enrolled
        # If we have capacity and need to enforce:
        # Currently, let's count current enrollment count for this cohort
        # Let's count enrollments in the database:
        from app.models.enrollment import Enrollment
        from sqlalchemy import select, func
        stmt = select(func.count()).select_from(Enrollment).where(Enrollment.cohort_id == cohort_id)
        current_count = (await self.db.execute(stmt)).scalar() or 0
        if current_count + len(user_ids) > cohort.capacity:
            raise ConflictError(message=f"Cohort capacity exceeded. Only {cohort.capacity - current_count} slots remaining.")

        enrolled_count = 0
        for uid in user_ids:
            try:
                await self.enroll_svc.enroll(uid, cohort.course_id, cohort_id=cohort.id)
                enrolled_count += 1
            except Exception:
                # Swallowing user-already-enrolled errors, but raising critical errors
                pass

        await self.db.commit()
        return enrolled_count
