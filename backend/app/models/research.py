"""Research publications, whitepapers, and security advisories."""
from __future__ import annotations
import enum
from datetime import datetime
from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class PublicationType(str, enum.Enum):
    WHITEPAPER = "whitepaper"
    ADVISORY = "advisory"
    PAPER = "paper"

class PublicationStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class Publication(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "publications"
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    abstract: Mapped[str | None] = mapped_column(Text, nullable=True)
    authors_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[PublicationType] = mapped_column(Enum(PublicationType), nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), nullable=False, default=PublicationStatus.DRAFT)
