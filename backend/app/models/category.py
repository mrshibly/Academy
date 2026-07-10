"""
Category and Tag models for organizing courses and content.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.course import Course


class Category(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Hierarchical category (supports sub-categories via parent_id)."""

    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True
    )

    # Relationships
    parent: Mapped["Category | None"] = relationship("Category", remote_side="Category.id", back_populates="children")
    children: Mapped[List["Category"]] = relationship("Category", back_populates="parent")
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="category")


class Tag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Flat tag for cross-cutting labels on courses, blog posts, etc."""

    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)


class CourseTag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Many-to-many join table: Course ↔ Tag."""

    __tablename__ = "course_tags"
    __table_args__ = (UniqueConstraint("course_id", "tag_id", name="uq_course_tag"),)

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False, index=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="tags")
    tag: Mapped["Tag"] = relationship("Tag")
