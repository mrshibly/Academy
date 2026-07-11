"""Audit logging helper."""
from __future__ import annotations
import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_repository import AuditRepository

async def log_audit(
    db: AsyncSession,
    actor_id: uuid.UUID | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    ip_address: str | None = None,
    diff_json: dict | None = None
) -> None:
    """Log state-changing action to the AuditLog table."""
    repo = AuditRepository(db)
    diff_str = json.dumps(diff_json) if diff_json else None
    await repo.create(
        actor_id=actor_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        diff_json=diff_str,
        ip_address=ip_address
    )
    # Note: caller should call db.commit() to persist
