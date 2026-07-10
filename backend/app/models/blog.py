"""Blog post model with category/tag support and CMS states."""
from __future__ import annotations
import enum, uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin

class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"

class BlogPost(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "blog_posts"
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    excerpt: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)
    status: Mapped[PostStatus] = mapped_column(Enum(PostStatus), nullable=False, default=PostStatus.DRAFT)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    featured_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    meta_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    author: Mapped["app.models.user.User"] = relationship("User")

class BlogPostTag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "blog_post_tags"
    __table_args__ = (UniqueConstraint("post_id", "tag_id", name="uq_blog_post_tag"),)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("blog_posts.id"), nullable=False, index=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False, index=True)
