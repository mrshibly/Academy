"""Research publication routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.research import PublicationCreate, PublicationRead
from app.services.research_service import ResearchService

router = APIRouter()

@router.get("", response_model=list[PublicationRead], status_code=200)
async def list_publications(db: AsyncSession = Depends(get_db)):
    svc = ResearchService(db)
    pubs = await svc.list_publications()
    return [PublicationRead.model_validate(p) for p in pubs]

@router.get("/{slug}", response_model=PublicationRead, status_code=200)
async def get_publication(slug: str, db: AsyncSession = Depends(get_db)):
    svc = ResearchService(db)
    pub = await svc.get_by_slug(slug)
    return PublicationRead.model_validate(pub)

@router.post("", response_model=PublicationRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_publication(data: PublicationCreate, db: AsyncSession = Depends(get_db)):
    svc = ResearchService(db)
    pub = await svc.create_publication(**data.model_dump())
    return PublicationRead.model_validate(pub)
