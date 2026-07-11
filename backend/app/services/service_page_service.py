"""Service page service — manages CMS service page content."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.service import ServicePage
from app.repositories.service_repository import ServiceRepository

class ServicePageService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ServiceRepository(db)

    async def list_services(self) -> list[ServicePage]:
        return await self.repo.list_published()

    async def get_by_slug(self, slug: str) -> ServicePage:
        page = await self.repo.get_by_slug(slug)
        if page is None:
            raise NotFoundError(resource="ServicePage")
        return page

    async def create_service(self, **kwargs: object) -> ServicePage:
        page = await self.repo.create(**kwargs)
        await self.db.commit()
        return page

    async def update_service(self, service_id: UUID, **kwargs: object) -> ServicePage:
        page = await self.repo.get_by_id(service_id)
        if page is None:
            raise NotFoundError(resource="ServicePage")
        page = await self.repo.update(page, **kwargs)
        await self.db.commit()
        return page
