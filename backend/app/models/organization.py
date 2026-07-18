"""
Organization and OrganizationMember models — corporate client entities.
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class OrgMemberRole(str, enum.Enum):
    HR = "hr"
    EMPLOYEE = "employee"


class Organization(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    """Corporate client organization."""

    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    contact_email: Mapped[str] = mapped_column(String(320), nullable=False)

    # Relationships
    members: Mapped[list["OrganizationMember"]] = relationship("OrganizationMember", back_populates="organization")


class OrganizationMember(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Membership linking a user to a corporate organization."""

    __tablename__ = "organization_members"
    __table_args__ = (UniqueConstraint("organization_id", "user_id", name="uq_org_member"),)

    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[OrgMemberRole] = mapped_column(Enum(OrgMemberRole), nullable=False, default=OrgMemberRole.EMPLOYEE)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="members")
    user: Mapped["app.models.user.User"] = relationship("User")
