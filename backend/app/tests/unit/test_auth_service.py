"""Unit tests for AuthService."""
from __future__ import annotations
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth_service import AuthService
from app.core.exceptions import ConflictError, UnauthorizedError

@pytest.mark.anyio
async def test_register_new_user(db_session: AsyncSession) -> None:
    svc = AuthService(db_session)
    result = await svc.register(
        email="test_student@academy.dev",
        password="securepassword123",
        full_name="Test Student"
    )
    assert "user_id" in result
    assert "verification_token" in result

@pytest.mark.anyio
async def test_register_duplicate_email(db_session: AsyncSession) -> None:
    svc = AuthService(db_session)
    await svc.register(
        email="dup@academy.dev",
        password="securepassword123",
        full_name="Duplicate User"
    )
    with pytest.raises(ConflictError):
        await svc.register(
            email="dup@academy.dev",
            password="anotherpassword",
            full_name="Another Duplicate"
        )

@pytest.mark.anyio
async def test_login_invalid_credentials(db_session: AsyncSession) -> None:
    svc = AuthService(db_session)
    with pytest.raises(UnauthorizedError):
        await svc.login(email="nonexistent@academy.dev", password="password")
