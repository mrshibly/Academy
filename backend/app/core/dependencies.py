"""
FastAPI dependency functions for authentication and role-based access control.

Usage in routers:
    @router.get("/protected")
    async def protected_route(user: User = Depends(get_current_active_user)):
        ...

    @router.delete("/admin-only", dependencies=[Depends(require_role("admin"))])
    async def admin_route():
        ...
"""

from __future__ import annotations

from typing import Callable, List
from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.models.role import UserRole, Role, RolePermission, Permission

# ---------------------------------------------------------------------------
# Bearer token extractor
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate the Bearer token, return the corresponding User.

    Raises:
        UnauthorizedError: If the token is missing, invalid, or the user doesn't exist.
    """
    if credentials is None:
        raise UnauthorizedError(message="Authentication required.")

    payload = decode_token(credentials.credentials)

    if payload.get("type") != "access":
        raise UnauthorizedError(message="Invalid token type.")

    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError()

    stmt = (
        select(User)
        .where(User.id == UUID(user_id), User.deleted_at.is_(None))
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedError(message="User not found.")

    return user


async def get_current_active_user(
    user: User = Depends(get_current_user),
) -> User:
    """
    Verify that the authenticated user's account is active and verified.

    Raises:
        ForbiddenError: If the account is inactive or unverified.
    """
    if not user.is_active:
        raise ForbiddenError(message="Account is deactivated.")
    if not user.is_verified:
        raise ForbiddenError(message="Email verification required.")
    return user


def require_role(*allowed_roles: str) -> Callable[..., User]:
    """
    Return a dependency that enforces role-based access.

    Args:
        allowed_roles: One or more role names (e.g. "admin", "instructor").

    Usage:
        @router.get("/", dependencies=[Depends(require_role("admin", "instructor"))])
    """

    async def _check_role(
        user: User = Depends(get_current_active_user),
    ) -> User:
        user_role_names = {ur.role.name for ur in user.user_roles}
        if not user_role_names.intersection(allowed_roles):
            raise ForbiddenError()
        return user

    return _check_role


def require_permission(resource: str, action: str) -> Callable[..., User]:
    """
    Return a dependency that enforces granular permission checks.

    Looks up the user's roles → role_permissions → permissions to verify
    the user has the required (resource, action) pair.

    Args:
        resource: The resource name (e.g. "courses", "users").
        action: The action name (e.g. "create", "read", "update", "delete").
    """

    async def _check_permission(
        user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        role_ids = [ur.role_id for ur in user.user_roles]
        if not role_ids:
            raise ForbiddenError()

        stmt = (
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(
                RolePermission.role_id.in_(role_ids),
                Permission.resource == resource,
                Permission.action == action,
            )
        )
        result = await db.execute(stmt)
        if result.scalar_one_or_none() is None:
            raise ForbiddenError()
        return user

    return _check_permission
