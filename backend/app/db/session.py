"""
Async SQLAlchemy engine and session factory.

Provides the `get_db` dependency for injecting an AsyncSession into routes.
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async DB session.

    Commits are the caller's responsibility; the session is always closed
    at the end of the request.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
