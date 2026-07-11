"""Career routes — public job listings + applications + admin management."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.career import JobPostingCreate, JobPostingRead, JobApplicationCreate, JobApplicationRead
from app.schemas.auth import MessageResponse
from app.services.career_service import CareerService

router = APIRouter()

@router.get("", response_model=list[JobPostingRead], status_code=200)
async def list_jobs(db: AsyncSession = Depends(get_db)):
    svc = CareerService(db)
    jobs = await svc.list_open_jobs()
    return [JobPostingRead.model_validate(j) for j in jobs]

@router.get("/{slug}", response_model=JobPostingRead, status_code=200)
async def get_job(slug: str, db: AsyncSession = Depends(get_db)):
    svc = CareerService(db)
    job = await svc.get_job_by_slug(slug)
    return JobPostingRead.model_validate(job)

@router.post("/{slug}/apply", response_model=MessageResponse, status_code=201)
async def apply(slug: str, data: JobApplicationCreate, db: AsyncSession = Depends(get_db)):
    svc = CareerService(db)
    await svc.apply(slug, **data.model_dump())
    return MessageResponse(message="Application submitted successfully.")

@router.post("", response_model=JobPostingRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_job(data: JobPostingCreate, db: AsyncSession = Depends(get_db)):
    svc = CareerService(db)
    job = await svc.create_job(**data.model_dump())
    return JobPostingRead.model_validate(job)

@router.get("/{job_id}/applications", response_model=list[JobApplicationRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_applications(job_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = CareerService(db)
    apps = await svc.list_applications(job_id)
    return [JobApplicationRead.model_validate(a) for a in apps]

@router.delete("/{job_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """Admin: delete a job posting."""
    svc = CareerService(db)
    await svc.delete_job(job_id)
    return MessageResponse(message="Job posting deleted successfully.")
