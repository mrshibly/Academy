"""Certificate model — auto-generated on course completion."""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Certificate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "certificates"
    __table_args__ = (UniqueConstraint("enrollment_id", name="uq_cert_enrollment"),)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("enrollments.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True)
    verification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    user: Mapped["app.models.user.User"] = relationship("User")
    course: Mapped["app.models.course.Course"] = relationship("Course")
