"""Global search route — Postgres full-text search across content types."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.course import Course, CourseStatus
from app.models.blog import BlogPost, PostStatus
from app.models.service import ServicePage, ServiceStatus
from app.models.research import Publication, PublicationStatus

router = APIRouter()

@router.get("", status_code=200)
async def search(q: str = Query(min_length=1), type: str | None = None, db: AsyncSession = Depends(get_db)):
    """Search across courses, blog posts, services, and research."""
    results = []
    search_term = f"%{q}%"

    if type is None or type == "course":
        stmt = select(Course.id, Course.title, Course.slug, Course.short_description).where(Course.status == CourseStatus.PUBLISHED, Course.deleted_at.is_(None), or_(Course.title.ilike(search_term), Course.description.ilike(search_term)))
        for row in (await db.execute(stmt)).all():
            results.append({"type": "course", "id": str(row.id), "title": row.title, "slug": row.slug, "excerpt": row.short_description})

    if type is None or type == "blog":
        stmt = select(BlogPost.id, BlogPost.title, BlogPost.slug, BlogPost.excerpt).where(BlogPost.status == PostStatus.PUBLISHED, BlogPost.deleted_at.is_(None), or_(BlogPost.title.ilike(search_term), BlogPost.content.ilike(search_term)))
        for row in (await db.execute(stmt)).all():
            results.append({"type": "blog", "id": str(row.id), "title": row.title, "slug": row.slug, "excerpt": row.excerpt})

    if type is None or type == "service":
        stmt = select(ServicePage.id, ServicePage.title, ServicePage.slug, ServicePage.description).where(ServicePage.status == ServiceStatus.PUBLISHED, ServicePage.title.ilike(search_term))
        for row in (await db.execute(stmt)).all():
            results.append({"type": "service", "id": str(row.id), "title": row.title, "slug": row.slug, "excerpt": (row.description or "")[:200]})

    if type is None or type == "research":
        stmt = select(Publication.id, Publication.title, Publication.slug, Publication.abstract).where(Publication.status == PublicationStatus.PUBLISHED, or_(Publication.title.ilike(search_term), Publication.abstract.ilike(search_term)))
        for row in (await db.execute(stmt)).all():
            results.append({"type": "research", "id": str(row.id), "title": row.title, "slug": row.slug, "excerpt": (row.abstract or "")[:200]})

    return {"query": q, "results": results, "total": len(results)}
