"""Service page (CMS) routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError
from app.models.service import ServicePage, ServiceStatus
from app.schemas.service import ServicePageCreate, ServicePageUpdate, ServicePageRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=list[ServicePageRead], status_code=200)
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServicePage).where(ServicePage.status == ServiceStatus.PUBLISHED).order_by(ServicePage.order))
    return [ServicePageRead.model_validate(s) for s in result.scalars().all()]

@router.get("/{slug}", response_model=ServicePageRead, status_code=200)
async def get_service(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServicePage).where(ServicePage.slug == slug))
    svc = result.scalar_one_or_none()
    if svc is None:
        raise NotFoundError(resource="ServicePage")
    return ServicePageRead.model_validate(svc)

@router.post("", response_model=ServicePageRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_service(data: ServicePageCreate, db: AsyncSession = Depends(get_db)):
    svc = ServicePage(**data.model_dump())
    db.add(svc)
    await db.commit()
    return ServicePageRead.model_validate(svc)

@router.patch("/{service_id}", response_model=ServicePageRead, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_service(service_id: UUID, data: ServicePageUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServicePage).where(ServicePage.id == service_id))
    svc = result.scalar_one_or_none()
    if svc is None:
        raise NotFoundError(resource="ServicePage")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(svc, k, v)
    await db.commit()
    return ServicePageRead.model_validate(svc)
