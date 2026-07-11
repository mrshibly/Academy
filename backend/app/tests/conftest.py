"""conftest.py — Pytest configuration and shared async fixtures."""
from __future__ import annotations
import os
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

import asyncio
import pytest
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.base import Base
from app.db.session import get_db

# Mock Redis cache pool to avoid live Redis dependency in tests
import app.core.redis_cache
async def mock_async_noop(*args, **kwargs):
    pass
app.core.redis_cache.init_cache = mock_async_noop
app.core.redis_cache.close_cache = mock_async_noop

from app.main import app

# Use async SQLite for in-memory testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    """Create test engine and migrate tables."""
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        # Create all tables in SQLite for testing correctness
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create isolated session per test with rollback-transaction guard."""
    async_session = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture(autouse=True)
def override_db_dependency(db_session: AsyncSession) -> None:
    """Override FastAPI get_db dependency with test database session."""
    async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session
    app.dependency_overrides[get_db] = _get_test_db

@pytest.fixture(autouse=True)
def mock_celery_and_stripe(monkeypatch) -> None:
    """Mock Celery task dispatching and Stripe operations to avoid network side-effects."""
    # Mock celery task .delay() method to just run synchronously or do nothing
    class MockDelay:
        def __init__(self, *args, **kwargs):
            pass
        def delay(self, *args, **kwargs):
            return self

    monkeypatch.setattr("app.workers.tasks.email_tasks.send_email_task.delay", lambda *a, **k: None)
    monkeypatch.setattr("app.workers.tasks.certificate_tasks.generate_certificate_task.delay", lambda *a, **k: None)
    
    # Mock Stripe Checkout session creation
    class MockStripeSession:
        url = "https://checkout.stripe.com/test_session"
        id = "cs_test_mock"
    monkeypatch.setattr("stripe.checkout.Session.create", lambda *a, **k: MockStripeSession())
