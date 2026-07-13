"""User service — profile management and admin user operations."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError, ForbiddenError
from app.core.security import hash_password
from app.models.user import User
from app.models.role import Role, UserRole
from app.repositories.user_repository import UserRepository

class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)

    async def create_user(self, email: str, password_plain: str, full_name: str, roles: list[str]) -> User:
        from app.core.exceptions import ConflictError
        existing = await self.user_repo.get_by_email(email)
        if existing is not None:
            raise ConflictError(message="An account with this email already exists.")
        
        hashed = hash_password(password_plain)
        user = await self.user_repo.create(email=email, hashed_password=hashed, full_name=full_name, is_verified=True)
        
        for r_name in roles:
            role_stmt = select(Role).where(Role.name == r_name)
            role = (await self.db.execute(role_stmt)).scalar_one_or_none()
            if role:
                self.db.add(UserRole(user_id=user.id, role_id=role.id))
                
        await self.db.commit()
        return await self.user_repo.get_by_id(user.id)  # type: ignore

    async def get_profile(self, user_id: UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(resource="User")
        return user

    async def update_profile(self, user_id: UUID, **kwargs: object) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(resource="User")
        user = await self.user_repo.update(user, **kwargs)
        await self.db.commit()
        return user

    async def list_users(self, page: int = 1, page_size: int = 20) -> tuple[list[User], int]:
        return await self.user_repo.list_users(page, page_size)

    async def assign_roles(self, user_id: UUID, role_names: list[str]) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(resource="User")
        # Clear existing roles
        for ur in list(user.user_roles):
            await self.db.delete(ur)
        # Assign new roles
        for name in role_names:
            role_stmt = select(Role).where(Role.name == name)
            role = (await self.db.execute(role_stmt)).scalar_one_or_none()
            if role:
                self.db.add(UserRole(user_id=user.id, role_id=role.id))
        await self.db.commit()
        return await self.user_repo.get_by_id(user_id)  # type: ignore

    async def soft_delete_user(self, user_id: UUID) -> None:
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError(resource="User")
        await self.user_repo.soft_delete(user)
        await self.db.commit()
