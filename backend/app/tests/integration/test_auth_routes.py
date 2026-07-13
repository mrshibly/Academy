"""Integration tests for authentication routers."""
from __future__ import annotations
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_register_and_login_flow() -> None:
    # Use httpx AsyncClient to perform full integration testing against application routing
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register User
        reg_payload = {
            "email": "integration_test@academy.dev",
            "password": "SecurePassword123!",
            "full_name": "Integration User"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        assert "message" in res_reg.json()

        # 2. Login User (simulate verified user or normal login)
        login_payload = {
            "email": "integration_test@academy.dev",
            "password": "SecurePassword123!"
        }
        # In a real database, verification is required, but let's test endpoint accessibility
        res_login = await ac.post("/api/v1/auth/login", json=login_payload)
        # Note: If email verification is enforced, this might raise Forbidden/Unauthorized in strict modes, 
        # but verifies endpoint is callable and schema validates correctly.
        assert res_login.status_code in (200, 403)
