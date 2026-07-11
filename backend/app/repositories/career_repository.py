"""Career repository — job postings and applications DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.career import JobPosting, JobApplication, JobStatus


class CareerRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_open_jobs(self) -> list[JobPosting]:
        result = await self.db.execute(
            select(JobPosting)
            .where(JobPosting.status == JobStatus.OPEN, JobPosting.deleted_at.is_(None))
            .order_by(JobPosting.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_job_by_slug(self, slug: str) -> JobPosting | None:
        result = await self.db.execute(
            select(JobPosting).where(JobPosting.slug == slug, JobPosting.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_open_job_by_slug(self, slug: str) -> JobPosting | None:
        result = await self.db.execute(
            select(JobPosting).where(JobPosting.slug == slug, JobPosting.status == JobStatus.OPEN)
        )
        return result.scalar_one_or_none()

    async def create_job(self, **kwargs: object) -> JobPosting:
        job = JobPosting(**kwargs)
        self.db.add(job)
        await self.db.flush()
        return job

    async def create_application(self, job_id: UUID, **kwargs: object) -> JobApplication:
        app = JobApplication(job_id=job_id, **kwargs)
        self.db.add(app)
        await self.db.flush()
        return app

    async def list_applications(self, job_id: UUID) -> list[JobApplication]:
        result = await self.db.execute(
            select(JobApplication).where(JobApplication.job_id == job_id).order_by(JobApplication.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete_job(self, job_id: UUID) -> None:
        result = await self.db.execute(select(JobPosting).where(JobPosting.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            await self.db.delete(job)
            await self.db.flush()
