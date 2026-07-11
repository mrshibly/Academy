"""Cohort management routes (admin)."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.cohort import CohortCreate, CohortRead, CohortEnrollRequest
from app.schemas.auth import MessageResponse
from app.services.cohort_service import CohortService

router = APIRouter()

@router.get("", response_model=list[CohortRead], status_code=200, dependencies=[Depends(require_role("admin", "instructor"))])
async def list_cohorts(db: AsyncSession = Depends(get_db)):
    svc = CohortService(db)
    cohorts = await svc.list_cohorts()
    return [CohortRead.model_validate(c) for c in cohorts]

@router.post("", response_model=CohortRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_cohort(data: CohortCreate, db: AsyncSession = Depends(get_db)):
    svc = CohortService(db)
    cohort = await svc.create_cohort(**data.model_dump())
    return CohortRead.model_validate(cohort)

@router.post("/{cohort_id}/enroll", response_model=MessageResponse, status_code=201, dependencies=[Depends(require_role("admin"))])
async def enroll_users(cohort_id: UUID, data: CohortEnrollRequest, db: AsyncSession = Depends(get_db)):
    """Bulk-enroll users into a cohort."""
    svc = CohortService(db)
    enrolled_count = await svc.enroll_users(cohort_id, data.user_ids)
    return MessageResponse(message=f"Enrolled {enrolled_count} users into cohort.")

@router.delete("/{cohort_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_cohort(cohort_id: UUID, db: AsyncSession = Depends(get_db)):
    """Admin: delete a training cohort."""
    svc = CohortService(db)
    await svc.delete_cohort(cohort_id)
    return MessageResponse(message="Cohort deleted successfully.")
