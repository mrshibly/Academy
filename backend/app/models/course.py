"""
Course, Module, and Lesson models — the core LMS content structure.
"""

from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class CourseLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ContentType(str, enum.Enum):
    VIDEO = "video"
    TEXT = "text"
    QUIZ = "quiz"


class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    """A single course offered on the platform."""

    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    level: Mapped[CourseLevel] = mapped_column(Enum(CourseLevel), nullable=False, default=CourseLevel.BEGINNER)
    status: Mapped[CourseStatus] = mapped_column(Enum(CourseStatus), nullable=False, default=CourseStatus.DRAFT)
    thumbnail_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    instructor_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("categories.id"), nullable=True, index=True
    )

    # Relationships
    instructor: Mapped["app.models.user.User"] = relationship("User", foreign_keys=[instructor_id])
    category: Mapped["app.models.category.Category | None"] = relationship("Category", back_populates="courses")
    modules: Mapped[List["Module"]] = relationship("Module", back_populates="course", order_by="Module.order")
    tags: Mapped[List["app.models.category.CourseTag"]] = relationship("CourseTag", back_populates="course")


class Module(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Ordered grouping of lessons within a course."""

    __tablename__ = "modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("courses.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship("Lesson", back_populates="module", order_by="Lesson.order")


class Lesson(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Individual content unit within a module."""

    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("modules.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType), nullable=False, default=ContentType.TEXT)
    content_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    content_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    module: Mapped["Module"] = relationship("Module", back_populates="lessons")
