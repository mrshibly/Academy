"""Cohort management routes (admin)."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError
from app.models.cohort import Cohort
from app.schemas.cohort import CohortCreate, CohortRead, CohortEnrollRequest
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=list[CohortRead], status_code=200, dependencies=[Depends(require_role("admin", "instructor"))])
async def list_cohorts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cohort).order_by(Cohort.start_date.desc()))
    return [CohortRead.model_validate(c) for c in result.scalars().all()]

@router.post("", response_model=CohortRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_cohort(data: CohortCreate, db: AsyncSession = Depends(get_db)):
    cohort = Cohort(**data.model_dump())
    db.add(cohort)
    await db.commit()
    return CohortRead.model_validate(cohort)

@router.post("/{cohort_id}/enroll", response_model=MessageResponse, status_code=201, dependencies=[Depends(require_role("admin"))])
async def enroll_users(cohort_id: UUID, data: CohortEnrollRequest, db: AsyncSession = Depends(get_db)):
    """Bulk-enroll users into a cohort."""
    from app.services.enrollment_service import EnrollmentService
    result = await db.execute(select(Cohort).where(Cohort.id == cohort_id))
    cohort = result.scalar_one_or_none()
    if cohort is None:
        raise NotFoundError(resource="Cohort")
    svc = EnrollmentService(db)
    for uid in data.user_ids:
        try:
            await svc.enroll(uid, cohort.course_id, cohort_id=cohort.id)
        except Exception:
            pass  # Skip already enrolled users
    return MessageResponse(message=f"Enrolled {len(data.user_ids)} users into cohort.")
