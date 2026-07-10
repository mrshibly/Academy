"""
RBAC models: Role, Permission, RolePermission (join table), UserRole (join table).

Permissions are stored as (resource, action) pairs, enabling granular growth
without rewriting logic. Default roles seeded via scripts/seed.py.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class Role(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Named role (e.g. student, instructor, admin)."""

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    role_permissions: Mapped[List["RolePermission"]] = relationship("RolePermission", back_populates="role")
    user_roles: Mapped[List["UserRole"]] = relationship("UserRole", back_populates="role")


class Permission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Granular permission: (resource, action) pair."""

    __tablename__ = "permissions"
    __table_args__ = (UniqueConstraint("resource", "action", name="uq_permission_resource_action"),)

    resource: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    role_permissions: Mapped[List["RolePermission"]] = relationship("RolePermission", back_populates="permission")


class RolePermission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Join table linking roles to permissions."""

    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),)

    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("permissions.id"), nullable=False, index=True
    )

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="role_permissions")
    permission: Mapped["Permission"] = relationship("Permission", back_populates="role_permissions")


class UserRole(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Join table linking users to roles (many-to-many)."""

    __tablename__ = "user_roles"
    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_role"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="user_roles")
    role: Mapped["Role"] = relationship("Role", back_populates="user_roles")
