"""Contact submissions and quote requests."""
from __future__ import annotations
import enum
from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class SubmissionStatus(str, enum.Enum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"

class QuoteStatus(str, enum.Enum):
    NEW = "new"
    IN_REVIEW = "in_review"
    QUOTED = "quoted"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class ContactSubmission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "contact_submissions"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), nullable=False, default=SubmissionStatus.NEW)

class QuoteRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "quote_requests"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    company: Mapped[str | None] = mapped_column(String(300), nullable=True)
    service_type: Mapped[str] = mapped_column(String(200), nullable=False)
    budget_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[QuoteStatus] = mapped_column(Enum(QuoteStatus), nullable=False, default=QuoteStatus.NEW)
