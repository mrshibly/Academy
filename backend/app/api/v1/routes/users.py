"""User routes — profile and admin user management."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate, UserRoleUpdate
from app.schemas.common import PaginatedResponse
from app.schemas.auth import MessageResponse
from app.services.user_service import UserService

router = APIRouter()

def _user_to_read(user: User) -> UserRead:
    return UserRead(id=user.id, email=user.email, full_name=user.full_name, avatar_url=user.avatar_url, is_active=user.is_active, is_verified=user.is_verified, roles=[ur.role.name for ur in user.user_roles], created_at=user.created_at)

@router.get("/me", response_model=UserRead, status_code=200)
async def get_me(user: User = Depends(get_current_active_user)) -> UserRead:
    """Get current user's profile."""
    return _user_to_read(user)

@router.patch("/me", response_model=UserRead, status_code=200)
async def update_me(data: UserUpdate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)) -> UserRead:
    """Update current user's profile."""
    svc = UserService(db)
    updated = await svc.update_profile(user.id, **data.model_dump(exclude_unset=True))
    return _user_to_read(updated)

@router.get("", response_model=PaginatedResponse[UserRead], status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_users(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    """List all users (admin only)."""
    svc = UserService(db)
    users, total = await svc.list_users(page, page_size)
    return PaginatedResponse(items=[_user_to_read(u) for u in users], total=total, page=page, page_size=page_size)

@router.patch("/{user_id}/role", response_model=UserRead, status_code=200, dependencies=[Depends(require_role("admin"))])
async def update_user_role(user_id: str, data: UserRoleUpdate, db: AsyncSession = Depends(get_db)):
    """Assign roles to a user (admin only)."""
    from uuid import UUID
    svc = UserService(db)
    user = await svc.assign_roles(UUID(user_id), data.roles)
    return _user_to_read(user)

@router.delete("/{user_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Soft-delete a user (admin only)."""
    from uuid import UUID
    svc = UserService(db)
    await svc.soft_delete_user(UUID(user_id))
    return MessageResponse(message="User deleted.")
