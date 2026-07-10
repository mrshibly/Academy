"""User repository — all user-related DB queries."""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.role import UserRole

class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        stmt = select(User).where(User.id == user_id, User.deleted_at.is_(None)).options(selectinload(User.user_roles).selectinload(UserRole.role))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email, User.deleted_at.is_(None)).options(selectinload(User.user_roles).selectinload(UserRole.role))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> User:
        user = User(**kwargs)
        self.db.add(user)
        await self.db.flush()
        return user

    async def update(self, user: User, **kwargs: object) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        await self.db.flush()
        return user

    async def soft_delete(self, user: User) -> None:
        user.deleted_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def list_users(self, page: int = 1, page_size: int = 20) -> tuple[list[User], int]:
        count_stmt = select(func.count()).select_from(User).where(User.deleted_at.is_(None))
        total = (await self.db.execute(count_stmt)).scalar() or 0
        stmt = (select(User).where(User.deleted_at.is_(None)).options(selectinload(User.user_roles).selectinload(UserRole.role)).offset((page - 1) * page_size).limit(page_size).order_by(User.created_at.desc()))
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), int(total)
