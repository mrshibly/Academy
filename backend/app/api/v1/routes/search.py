"""Global search route — Postgres full-text search across content types."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.search_service import SearchService

router = APIRouter()

@router.get("", status_code=200)
async def search(q: str = Query(min_length=1), type: str | None = None, db: AsyncSession = Depends(get_db)):
    """Search across courses, blog posts, services, and research."""
    svc = SearchService(db)
    return await svc.search(query=q, entity_type=type)
