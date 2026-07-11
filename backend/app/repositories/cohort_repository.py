"""Cohort repository — all cohort-related DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cohort import Cohort

class CohortRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_cohorts(self) -> list[Cohort]:
        result = await self.db.execute(select(Cohort).order_by(Cohort.start_date.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, cohort_id: UUID) -> Cohort | None:
        result = await self.db.execute(select(Cohort).where(Cohort.id == cohort_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Cohort:
        cohort = Cohort(**kwargs)
        self.db.add(cohort)
        await self.db.flush()
        return cohort

    async def delete(self, cohort_id: UUID) -> None:
        result = await self.db.execute(select(Cohort).where(Cohort.id == cohort_id))
        cohort = result.scalar_one_or_none()
        if cohort:
            await self.db.delete(cohort)
            await self.db.flush()
