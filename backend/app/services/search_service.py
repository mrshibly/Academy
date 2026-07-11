"""Search service — concurrent, multi-entity search logic."""
from __future__ import annotations
import asyncio
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course, CourseStatus
from app.models.blog import BlogPost, PostStatus
from app.models.service import ServicePage, ServiceStatus
from app.models.research import Publication, PublicationStatus

class SearchService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def search(self, query: str, entity_type: str | None = None) -> dict:
        search_term = f"%{query}%"
        results = []

        async def search_courses():
            stmt = select(Course.id, Course.title, Course.slug, Course.short_description).where(
                Course.status == CourseStatus.PUBLISHED,
                Course.deleted_at.is_(None),
                or_(Course.title.ilike(search_term), Course.description.ilike(search_term))
            )
            rows = (await self.db.execute(stmt)).all()
            return [{"type": "course", "id": str(r.id), "title": r.title, "slug": r.slug, "excerpt": r.short_description} for r in rows]

        async def search_blog():
            stmt = select(BlogPost.id, BlogPost.title, BlogPost.slug, BlogPost.excerpt).where(
                BlogPost.status == PostStatus.PUBLISHED,
                BlogPost.deleted_at.is_(None),
                or_(BlogPost.title.ilike(search_term), BlogPost.content.ilike(search_term))
            )
            rows = (await self.db.execute(stmt)).all()
            return [{"type": "blog", "id": str(r.id), "title": r.title, "slug": r.slug, "excerpt": r.excerpt} for r in rows]

        async def search_services():
            stmt = select(ServicePage.id, ServicePage.title, ServicePage.slug, ServicePage.description).where(
                ServicePage.status == ServiceStatus.PUBLISHED,
                or_(ServicePage.title.ilike(search_term), ServicePage.description.ilike(search_term))
            )
            rows = (await self.db.execute(stmt)).all()
            return [{"type": "service", "id": str(r.id), "title": r.title, "slug": r.slug, "excerpt": (r.description or "")[:200]} for r in rows]

        async def search_research():
            stmt = select(Publication.id, Publication.title, Publication.slug, Publication.abstract).where(
                Publication.status == PublicationStatus.PUBLISHED,
                or_(Publication.title.ilike(search_term), Publication.abstract.ilike(search_term))
            )
            rows = (await self.db.execute(stmt)).all()
            return [{"type": "research", "id": str(r.id), "title": r.title, "slug": r.slug, "excerpt": (r.abstract or "")[:200]} for r in rows]

        tasks = []
        if entity_type is None or entity_type == "course":
            tasks.append(search_courses())
        if entity_type is None or entity_type == "blog":
            tasks.append(search_blog())
        if entity_type is None or entity_type == "service":
            tasks.append(search_services())
        if entity_type is None or entity_type == "research":
            tasks.append(search_research())

        # Run queries concurrently to achieve maximum speed under concurrent request loads
        outputs = await asyncio.gather(*tasks)
        for out in outputs:
            results.extend(out)

        return {"query": query, "results": results, "total": len(results)}
