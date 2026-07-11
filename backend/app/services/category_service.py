"""Category service — course/blog categories and tags business logic."""
from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category, Tag
from app.repositories.category_repository import CategoryRepository

class CategoryService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CategoryRepository(db)

    async def list_categories(self) -> list[Category]:
        return await self.repo.list_categories()

    async def create_category(self, **kwargs: object) -> Category:
        cat = await self.repo.create_category(**kwargs)
        await self.db.commit()
        return cat

    async def list_tags(self) -> list[Tag]:
        return await self.repo.list_tags()

    async def create_tag(self, **kwargs: object) -> Tag:
        tag = await self.repo.create_tag(**kwargs)
        await self.db.commit()
        return tag
