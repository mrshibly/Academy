"""Research publication routes."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError
from app.models.research import Publication, PublicationStatus
from app.schemas.research import PublicationCreate, PublicationRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=list[PublicationRead], status_code=200)
async def list_publications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publication).where(Publication.status == PublicationStatus.PUBLISHED).order_by(Publication.published_at.desc()))
    return [PublicationRead.model_validate(p) for p in result.scalars().all()]

@router.get("/{slug}", response_model=PublicationRead, status_code=200)
async def get_publication(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Publication).where(Publication.slug == slug))
    pub = result.scalar_one_or_none()
    if pub is None:
        raise NotFoundError(resource="Publication")
    return PublicationRead.model_validate(pub)

@router.post("", response_model=PublicationRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_publication(data: PublicationCreate, db: AsyncSession = Depends(get_db)):
    pub = Publication(**data.model_dump())
    db.add(pub)
    await db.commit()
    return PublicationRead.model_validate(pub)
