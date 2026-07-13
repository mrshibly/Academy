"""Blog service — blog post business logic."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.blog import BlogPost, PostStatus
from app.repositories.blog_repository import BlogRepository

class BlogService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = BlogRepository(db)

    async def list_published(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None) -> tuple[list[BlogPost], int]:
        return await self.repo.list_published(page, page_size, category_id)

    async def list_all(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, author_id: UUID | None = None) -> tuple[list[BlogPost], int]:
        return await self.repo.list_all(page, page_size, category_id, author_id)

    async def get_by_slug(self, slug: str) -> BlogPost:
        post = await self.repo.get_by_slug(slug)
        if post is None:
            raise NotFoundError(resource="BlogPost")
        return post

    async def create_post(self, author_id: UUID, is_admin: bool, **kwargs: object) -> BlogPost:
        tag_ids: list[UUID] = kwargs.pop("tag_ids", [])  # type: ignore
        if not is_admin:
            kwargs["status"] = PostStatus.DRAFT
        status = kwargs.get("status", "draft")
        published_at = None
        if status == PostStatus.PUBLISHED:
            published_at = datetime.now(timezone.utc)

        post = await self.repo.create(author_id=author_id, published_at=published_at, **kwargs)
        if tag_ids:
            await self.repo.set_tags(post.id, tag_ids)

        await self.db.commit()
        return post

    async def update_post(self, post_id: UUID, actor_id: UUID, is_admin: bool, **kwargs: object) -> BlogPost:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise NotFoundError(resource="BlogPost")
        if not is_admin and post.author_id != actor_id:
            from app.core.exceptions import ForbiddenError
            raise ForbiddenError(message="You can only edit your own blog posts.")

        tag_ids: list[UUID] | None = kwargs.pop("tag_ids", None)  # type: ignore
        if not is_admin and "status" in kwargs:
            kwargs["status"] = PostStatus.DRAFT
        status = kwargs.get("status")
        if status == PostStatus.PUBLISHED and post.status != PostStatus.PUBLISHED:
            kwargs["published_at"] = datetime.now(timezone.utc)

        post = await self.repo.update(post, **kwargs)
        if tag_ids is not None:
            await self.repo.set_tags(post.id, tag_ids)

        await self.db.commit()
        return post

    async def delete_post(self, post_id: UUID, actor_id: UUID, is_admin: bool) -> None:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise NotFoundError(resource="BlogPost")
        if not is_admin and post.author_id != actor_id:
            from app.core.exceptions import ForbiddenError
            raise ForbiddenError(message="You can only delete your own blog posts.")
        await self.repo.soft_delete(post)
        await self.db.commit()
