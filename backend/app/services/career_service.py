"""Career service — job listings and application business logic."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.career import JobPosting, JobApplication
from app.repositories.career_repository import CareerRepository

class CareerService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CareerRepository(db)

    async def list_open_jobs(self) -> list[JobPosting]:
        return await self.repo.list_open_jobs()

    async def get_job_by_slug(self, slug: str) -> JobPosting:
        job = await self.repo.get_job_by_slug(slug)
        if job is None:
            raise NotFoundError(resource="JobPosting")
        return job

    async def apply(self, slug: str, **kwargs: object) -> JobApplication:
        job = await self.repo.get_open_job_by_slug(slug)
        if job is None:
            raise NotFoundError(resource="JobPosting")
        app = await self.repo.create_application(job_id=job.id, **kwargs)
        await self.db.commit()
        return app

    async def create_job(self, **kwargs: object) -> JobPosting:
        job = await self.repo.create_job(**kwargs)
        await self.db.commit()
        return job

    async def list_applications(self, job_id: UUID) -> list[JobApplication]:
        return await self.repo.list_applications(job_id)
