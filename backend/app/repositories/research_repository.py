"""Research repository — publications and security advisories DB queries."""
from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research import Publication, PublicationStatus

class ResearchRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_published(self) -> list[Publication]:
        result = await self.db.execute(
            select(Publication)
            .where(Publication.status == PublicationStatus.PUBLISHED)
            .order_by(Publication.published_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Publication | None:
        result = await self.db.execute(select(Publication).where(Publication.slug == slug))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Publication:
        pub = Publication(**kwargs)
        self.db.add(pub)
        await self.db.flush()
        return pub
