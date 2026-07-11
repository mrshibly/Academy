"""Service page (CMS) routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.service import ServicePageCreate, ServicePageUpdate, ServicePageRead
from app.services.service_page_service import ServicePageService

router = APIRouter()

@router.get("", response_model=list[ServicePageRead], status_code=200)
async def list_services(db: AsyncSession = Depends(get_db)):
    svc = ServicePageService(db)
    pages = await svc.list_services()
    return [ServicePageRead.model_validate(p) for p in pages]

@router.get("/{slug}", response_model=ServicePageRead, status_code=200)
async def get_service(slug: str, db: AsyncSession = Depends(get_db)):
    svc = ServicePageService(db)
    page = await svc.get_by_slug(slug)
    return ServicePageRead.model_validate(page)

@router.post("", response_model=ServicePageRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_service(data: ServicePageCreate, db: AsyncSession = Depends(get_db)):
    svc = ServicePageService(db)
    page = await svc.create_service(**data.model_dump())
    return ServicePageRead.model_validate(page)

@router.patch("/{service_id}", response_model=ServicePageRead, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_service(service_id: UUID, data: ServicePageUpdate, db: AsyncSession = Depends(get_db)):
    svc = ServicePageService(db)
    page = await svc.update_service(service_id, **data.model_dump(exclude_unset=True))
    return ServicePageRead.model_validate(page)
