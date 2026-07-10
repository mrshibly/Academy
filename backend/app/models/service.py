"""CMS-managed service pages."""
from __future__ import annotations
import enum
from sqlalchemy import Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class ServiceStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class ServicePage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "service_pages"
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(200), nullable=False)
    hero_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    deliverables_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    process_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ServiceStatus] = mapped_column(Enum(ServiceStatus), nullable=False, default=ServiceStatus.DRAFT)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
