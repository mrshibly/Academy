"""
Cohort model — manages live bootcamps, corporate training batches, and scheduled cohorts.
"""

from __future__ import annotations

import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CohortStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Cohort(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A scheduled cohort for a course (live bootcamp, corporate batch, etc.)."""

    __tablename__ = "cohorts"

    course_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("courses.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    instructor_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("organizations.id"), nullable=True, index=True
    )
    status: Mapped[CohortStatus] = mapped_column(Enum(CohortStatus), nullable=False, default=CohortStatus.UPCOMING)

    # Relationships
    course: Mapped["app.models.course.Course"] = relationship("Course")
    instructor: Mapped["app.models.user.User"] = relationship("User", foreign_keys=[instructor_id])
    organization: Mapped["app.models.organization.Organization | None"] = relationship("Organization")
