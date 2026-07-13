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

@router.get("/managed", response_model=PaginatedResponse[BlogPostRead], status_code=200)
async def list_managed_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: UUID | None = None,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Instructor/Admin workspace: list blog posts they manage (instructors only see their own)."""
    svc = BlogService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    is_instructor = any(ur.role.name == "instructor" for ur in user.user_roles)
    
    if not is_admin and not is_instructor:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError(message="Only instructors and administrators can view managed blog posts.")
        
    author_filter = None if is_admin else user.id
    items, total = await svc.list_all(page, page_size, category_id, author_id=author_filter)
    return PaginatedResponse(items=[BlogPostRead.model_validate(p) for p in items], total=total, page=page, page_size=page_size)

@router.get("/{slug}", response_model=BlogPostRead, status_code=200)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    post = await svc.get_by_slug(slug)
    return BlogPostRead.model_validate(post)

@router.post("", response_model=BlogPostRead, status_code=201, dependencies=[Depends(require_role("instructor", "admin"))])
async def create_post(data: BlogPostCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    post = await svc.create_post(author_id=user.id, is_admin=is_admin, **data.model_dump())
    return BlogPostRead.model_validate(post)

@router.patch("/{post_id}", response_model=BlogPostRead, status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def update_post(post_id: UUID, data: BlogPostUpdate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    post = await svc.update_post(post_id=post_id, actor_id=user.id, is_admin=is_admin, **data.model_dump(exclude_unset=True))
    return BlogPostRead.model_validate(post)

@router.delete("/{post_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def delete_post(post_id: UUID, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    svc = BlogService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    await svc.delete_post(post_id=post_id, actor_id=user.id, is_admin=is_admin)
    return MessageResponse(message="Post deleted.")
