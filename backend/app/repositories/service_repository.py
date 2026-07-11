"""Service repository — CMS service pages DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.service import ServicePage, ServiceStatus

class ServiceRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_published(self) -> list[ServicePage]:
        result = await self.db.execute(
            select(ServicePage)
            .where(ServicePage.status == ServiceStatus.PUBLISHED)
            .order_by(ServicePage.order)
        )
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> ServicePage | None:
        result = await self.db.execute(select(ServicePage).where(ServicePage.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_id(self, service_id: UUID) -> ServicePage | None:
        result = await self.db.execute(select(ServicePage).where(ServicePage.id == service_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> ServicePage:
        page = ServicePage(**kwargs)
        self.db.add(page)
        await self.db.flush()
        return page

    async def update(self, page: ServicePage, **kwargs: object) -> ServicePage:
        for k, v in kwargs.items():
            setattr(page, k, v)
        await self.db.flush()
        return page
