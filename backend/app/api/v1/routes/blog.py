"""Blog routes — public listing + admin CRUD."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostRead
from app.schemas.common import PaginatedResponse
from app.schemas.auth import MessageResponse
from app.services.blog_service import BlogService

router = APIRouter()

@router.get("", response_model=PaginatedResponse[BlogPostRead], status_code=200)
async def list_posts(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), category_id: UUID | None = None, db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    items, total = await svc.list_published(page, page_size, category_id)
    return PaginatedResponse(items=[BlogPostRead.model_validate(p) for p in items], total=total, page=page, page_size=page_size)

@router.get("/{slug}", response_model=BlogPostRead, status_code=200)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    post = await svc.get_by_slug(slug)
    return BlogPostRead.model_validate(post)

@router.post("", response_model=BlogPostRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_post(data: BlogPostCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    post = await svc.create_post(author_id=user.id, **data.model_dump())
    return BlogPostRead.model_validate(post)

@router.patch("/{post_id}", response_model=BlogPostRead, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_post(post_id: UUID, data: BlogPostUpdate, db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    post = await svc.update_post(post_id, **data.model_dump(exclude_unset=True))
    return BlogPostRead.model_validate(post)

@router.delete("/{post_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    await svc.delete_post(post_id)
    return MessageResponse(message="Post deleted.")
