"""Blog repository — all blog post DB queries."""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.blog import BlogPost, BlogPostTag, PostStatus


class BlogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_published(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None) -> tuple[list[BlogPost], int]:
        """List published, non-deleted posts with pagination."""
        base = select(BlogPost).where(BlogPost.status == PostStatus.PUBLISHED, BlogPost.deleted_at.is_(None))
        if category_id:
            base = base.where(BlogPost.category_id == category_id)
        total = (await self.db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
        result = await self.db.execute(base.offset((page - 1) * page_size).limit(page_size).order_by(BlogPost.published_at.desc()))
        return list(result.scalars().all()), int(total)

    async def get_by_slug(self, slug: str) -> BlogPost | None:
        result = await self.db.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.deleted_at.is_(None)))
        return result.scalar_one_or_none()

    async def get_by_id(self, post_id: UUID) -> BlogPost | None:
        result = await self.db.execute(select(BlogPost).where(BlogPost.id == post_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> BlogPost:
        post = BlogPost(**kwargs)
        self.db.add(post)
        await self.db.flush()
        return post

    async def update(self, post: BlogPost, **kwargs: object) -> BlogPost:
        for k, v in kwargs.items():
            setattr(post, k, v)
        await self.db.flush()
        return post

    async def soft_delete(self, post: BlogPost) -> None:
        post.deleted_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def set_tags(self, post_id: UUID, tag_ids: list[UUID]) -> None:
        """Replace all tags for a post."""
        # Remove existing
        existing = await self.db.execute(select(BlogPostTag).where(BlogPostTag.post_id == post_id))
        for tag_link in existing.scalars().all():
            await self.db.delete(tag_link)
        # Add new
        for tid in tag_ids:
            self.db.add(BlogPostTag(post_id=post_id, tag_id=tid))
        await self.db.flush()
