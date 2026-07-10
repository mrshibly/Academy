"""Job postings and applications — careers page."""
from __future__ import annotations
import enum, uuid
from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin

class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"

class JobStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    DRAFT = "draft"

class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    OFFERED = "offered"

class JobPosting(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "job_postings"
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    department: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[JobType] = mapped_column(Enum(JobType), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), nullable=False, default=JobStatus.DRAFT)

class JobApplication(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_applications"
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("job_postings.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    resume_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.SUBMITTED)
