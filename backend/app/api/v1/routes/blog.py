"""Blog routes — public listing + admin CRUD."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.models.blog import BlogPost, PostStatus
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostRead
from app.schemas.common import PaginatedResponse
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=PaginatedResponse[BlogPostRead], status_code=200)
async def list_posts(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), category_id: UUID | None = None, db: AsyncSession = Depends(get_db)):
    base = select(BlogPost).where(BlogPost.status == PostStatus.PUBLISHED, BlogPost.deleted_at.is_(None))
    if category_id:
        base = base.where(BlogPost.category_id == category_id)
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
    result = await db.execute(base.offset((page - 1) * page_size).limit(page_size).order_by(BlogPost.published_at.desc()))
    return PaginatedResponse(items=[BlogPostRead.model_validate(p) for p in result.scalars().all()], total=int(total), page=page, page_size=page_size)

@router.get("/{slug}", response_model=BlogPostRead, status_code=200)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.deleted_at.is_(None)))
    post = result.scalar_one_or_none()
    if post is None:
        raise NotFoundError(resource="BlogPost")
    return BlogPostRead.model_validate(post)

@router.post("", response_model=BlogPostRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_post(data: BlogPostCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    post = BlogPost(**data.model_dump(exclude={"tag_ids"}), author_id=user.id)
    db.add(post)
    await db.commit()
    return BlogPostRead.model_validate(post)

@router.patch("/{post_id}", response_model=BlogPostRead, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_post(post_id: UUID, data: BlogPostUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise NotFoundError(resource="BlogPost")
    for k, v in data.model_dump(exclude_unset=True, exclude={"tag_ids"}).items():
        setattr(post, k, v)
    await db.commit()
    return BlogPostRead.model_validate(post)

@router.delete("/{post_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise NotFoundError(resource="BlogPost")
    post.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return MessageResponse(message="Post deleted.")
