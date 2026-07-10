"""Support ticket and replies — lightweight helpdesk."""
from __future__ import annotations
import enum, uuid
from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class SupportTicket(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "support_tickets"
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[TicketStatus] = mapped_column(Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN)
    priority: Mapped[TicketPriority] = mapped_column(Enum(TicketPriority), nullable=False, default=TicketPriority.MEDIUM)
    user: Mapped["app.models.user.User"] = relationship("User")
    replies: Mapped[list["TicketReply"]] = relationship("TicketReply", back_populates="ticket", order_by="TicketReply.created_at")

class TicketReply(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ticket_replies"
    ticket_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("support_tickets.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_staff_reply: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ticket: Mapped["SupportTicket"] = relationship("SupportTicket", back_populates="replies")
