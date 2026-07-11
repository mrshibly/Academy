"""Category and Tag repository — all category/tag-related DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category, Tag

class CategoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_categories(self) -> list[Category]:
        result = await self.db.execute(select(Category).order_by(Category.name))
        return list(result.scalars().all())

    async def get_category_by_id(self, category_id: UUID) -> Category | None:
        result = await self.db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def get_category_by_slug(self, slug: str) -> Category | None:
        result = await self.db.execute(select(Category).where(Category.slug == slug))
        return result.scalar_one_or_none()

    async def create_category(self, **kwargs: object) -> Category:
        cat = Category(**kwargs)
        self.db.add(cat)
        await self.db.flush()
        return cat

    async def list_tags(self) -> list[Tag]:
        result = await self.db.execute(select(Tag).order_by(Tag.name))
        return list(result.scalars().all())

    async def get_tag_by_id(self, tag_id: UUID) -> Tag | None:
        result = await self.db.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    async def get_tag_by_slug(self, slug: str) -> Tag | None:
        result = await self.db.execute(select(Tag).where(Tag.slug == slug))
        return result.scalar_one_or_none()

    async def create_tag(self, **kwargs: object) -> Tag:
        tag = Tag(**kwargs)
        self.db.add(tag)
        await self.db.flush()
        return tag
