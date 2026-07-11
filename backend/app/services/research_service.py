"""Research service — manages publications and security advisories."""
from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.research import Publication
from app.repositories.research_repository import ResearchRepository

class ResearchService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ResearchRepository(db)

    async def list_publications(self) -> list[Publication]:
        return await self.repo.list_published()

    async def get_by_slug(self, slug: str) -> Publication:
        pub = await self.repo.get_by_slug(slug)
        if pub is None:
            raise NotFoundError(resource="Publication")
        return pub

    async def create_publication(self, **kwargs: object) -> Publication:
        pub = await self.repo.create(**kwargs)
        await self.db.commit()
        return pub

    async def delete_publication(self, pub_id: UUID) -> None:
        from uuid import UUID
        await self.repo.delete(pub_id)
        await self.db.commit()
