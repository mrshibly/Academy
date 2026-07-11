"""Audit log repository — all audit log DB operations."""
from __future__ import annotations
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog

class AuditRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, **kwargs: object) -> AuditLog:
        log = AuditLog(**kwargs)
        self.db.add(log)
        await self.db.flush()
        return log

    async def list_paginated(self, page: int = 1, page_size: int = 50) -> tuple[list[AuditLog], int]:
        total = (await self.db.execute(select(func.count()).select_from(AuditLog))).scalar() or 0
        result = await self.db.execute(
            select(AuditLog)
            .order_by(AuditLog.timestamp.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), int(total)
