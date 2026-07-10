"""Career routes — public job listings + applications + admin management."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError
from app.models.career import JobPosting, JobApplication, JobStatus
from app.schemas.career import JobPostingCreate, JobPostingRead, JobApplicationCreate, JobApplicationRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=list[JobPostingRead], status_code=200)
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobPosting).where(JobPosting.status == JobStatus.OPEN, JobPosting.deleted_at.is_(None)).order_by(JobPosting.created_at.desc()))
    return [JobPostingRead.model_validate(j) for j in result.scalars().all()]

@router.get("/{slug}", response_model=JobPostingRead, status_code=200)
async def get_job(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobPosting).where(JobPosting.slug == slug, JobPosting.deleted_at.is_(None)))
    job = result.scalar_one_or_none()
    if job is None:
        raise NotFoundError(resource="JobPosting")
    return JobPostingRead.model_validate(job)

@router.post("/{slug}/apply", response_model=MessageResponse, status_code=201)
async def apply(slug: str, data: JobApplicationCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobPosting).where(JobPosting.slug == slug, JobPosting.status == JobStatus.OPEN))
    job = result.scalar_one_or_none()
    if job is None:
        raise NotFoundError(resource="JobPosting")
    app = JobApplication(job_id=job.id, **data.model_dump())
    db.add(app)
    await db.commit()
    return MessageResponse(message="Application submitted successfully.")

@router.post("", response_model=JobPostingRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_job(data: JobPostingCreate, db: AsyncSession = Depends(get_db)):
    job = JobPosting(**data.model_dump())
    db.add(job)
    await db.commit()
    return JobPostingRead.model_validate(job)

@router.get("/{job_id}/applications", response_model=list[JobApplicationRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_applications(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobApplication).where(JobApplication.job_id == job_id).order_by(JobApplication.created_at.desc()))
    return [JobApplicationRead.model_validate(a) for a in result.scalars().all()]
